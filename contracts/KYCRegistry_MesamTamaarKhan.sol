// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract KYCRegistry_MesamTamaarKhan {
    address public admin;

    enum KYCStatus { NONE, PENDING, APPROVED, REJECTED }

    struct Request {
        string name;
        string cnic;
        address requester;
        KYCStatus status;
    }

    mapping(address => Request) private requests;
    mapping(address => bool) private verified;
    address[] private allAddresses; // track all KYC submissions

    event KYCSubmitted(address indexed requester, string name, string cnic);
    event KYCApproved(address indexed requester);
    event KYCRejected(address indexed requester);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    /// @notice Submit a new KYC request
    function submitKYC(string calldata _name, string calldata _cnic) external {
        // Add to tracking list only the first time
        if (requests[msg.sender].status == KYCStatus.NONE) {
            allAddresses.push(msg.sender);
        }

        requests[msg.sender] = Request({
            name: _name,
            cnic: _cnic,
            requester: msg.sender,
            status: KYCStatus.PENDING
        });

        emit KYCSubmitted(msg.sender, _name, _cnic);
    }

    /// @notice Admin approves a KYC request
    function approveKYC(address _addr) external onlyAdmin {
        Request storage req = requests[_addr];
        require(req.status == KYCStatus.PENDING, "No pending request");

        req.status = KYCStatus.APPROVED;
        verified[_addr] = true;

        emit KYCApproved(_addr);
    }

    /// @notice Admin rejects a KYC request
    function rejectKYC(address _addr) external onlyAdmin {
        Request storage req = requests[_addr];
        require(req.status == KYCStatus.PENDING, "No pending request");

        req.status = KYCStatus.REJECTED;
        verified[_addr] = false;

        emit KYCRejected(_addr);
    }

    /// @notice Fetch a specific user's KYC request
    function getRequest(address _addr)
        external
        view
        returns (string memory name, string memory cnic, KYCStatus status, address requester)
    {
        Request storage req = requests[_addr];
        return (req.name, req.cnic, req.status, req.requester);
    }

    /// @notice Returns whether a user is verified (or is admin)
    function isVerified(address _addr) external view returns (bool) {
        return verified[_addr] || (_addr == admin);
    }

    /// @notice Returns all KYC requests in array format (frontend-friendly)
    function getAllRequests()
        external
        view
        returns (
            string[] memory names,
            string[] memory cnics,
            address[] memory addrs,
            KYCStatus[] memory statuses
        )
    {
        uint256 count = allAddresses.length;

        names = new string[](count);
        cnics = new string[](count);
        addrs = new address[](count);
        statuses = new KYCStatus[](count);

        for (uint256 i = 0; i < count; i++) {
            Request storage req = requests[allAddresses[i]];
            names[i] = req.name;
            cnics[i] = req.cnic;
            addrs[i] = req.requester;
            statuses[i] = req.status;
        }

        return (names, cnics, addrs, statuses);
    }

    /// @notice Helper to get total number of requests
    function getTotalRequests() external view returns (uint256) {
        return allAddresses.length;
    }
}
