// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./KYCRegistry_MesamTamaarKhan.sol";

contract Crowdfunding_MesamTamaarKhan {
    KYCRegistry_MesamTamaarKhan public kycRegistry;
    address public admin;
    uint256 public campaignCount;

    enum CampaignStatus { Active, Completed, Withdrawn }

    struct Campaign {
        uint256 id;
        address payable creator;
        string title;
        string description;
        uint256 goal; // in wei
        uint256 raised;
        CampaignStatus status;
    }

    mapping(uint256 => Campaign) public campaigns;

    event CampaignCreated(uint256 indexed id, address indexed creator, string title, uint256 goal);
    event Contribution(uint256 indexed id, address indexed contributor, uint256 amount);
    event CampaignCompleted(uint256 indexed id);
    event FundsWithdrawn(uint256 indexed id, address indexed creator, uint256 amount);

    modifier onlyVerifiedOrAdmin() {
        require(kycRegistry.isVerified(msg.sender) || msg.sender == admin, "Not verified");
        _;
    }

    modifier onlyCreator(uint256 _id) {
        require(campaigns[_id].creator == msg.sender, "Not creator");
        _;
    }

    constructor(address _kycRegistry) {
        kycRegistry = KYCRegistry_MesamTamaarKhan(_kycRegistry);
        admin = msg.sender;
    }

    function createCampaign(string calldata _title, string calldata _description, uint256 _goalWei) external onlyVerifiedOrAdmin returns (uint256) {
        require(_goalWei > 0, "Goal must be > 0");
        campaignCount++;
        campaigns[campaignCount] = Campaign({
            id: campaignCount,
            creator: payable(msg.sender),
            title: _title,
            description: _description,
            goal: _goalWei,
            raised: 0,
            status: CampaignStatus.Active
        });

        emit CampaignCreated(campaignCount, msg.sender, _title, _goalWei);
        return campaignCount;
    }

    function contribute(uint256 _campaignId) external payable {
        Campaign storage c = campaigns[_campaignId];
        require(c.id != 0, "Invalid campaign");
        require(c.status == CampaignStatus.Active, "Campaign not active");
        require(msg.value > 0, "Must send ETH");

        c.raised += msg.value;
        emit Contribution(_campaignId, msg.sender, msg.value);

        if (c.raised >= c.goal) {
            c.status = CampaignStatus.Completed;
            emit CampaignCompleted(_campaignId);
        }
    }

    function withdraw(uint256 _campaignId) external onlyCreator(_campaignId) {
        Campaign storage c = campaigns[_campaignId];
        require(c.status == CampaignStatus.Completed, "Campaign not completed");
        uint256 amount = c.raised;
        c.raised = 0;
        c.status = CampaignStatus.Withdrawn;

        (bool sent, ) = c.creator.call{value: amount}("");
        require(sent, "Transfer failed");

        emit FundsWithdrawn(_campaignId, c.creator, amount);
    }

    // Helper getters
    function getCampaign(uint256 _id) external view returns (
        uint256 id,
        address creator,
        string memory title,
        string memory description,
        uint256 goal,
        uint256 raised,
        CampaignStatus status
    ) {
        Campaign storage c = campaigns[_id];
        return (c.id, c.creator, c.title, c.description, c.goal, c.raised, c.status);
    }
}
