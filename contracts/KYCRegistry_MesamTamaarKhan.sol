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

    function submitKYC(string calldata _name, string calldata _cnic) external {
        requests[msg.sender] = Request({name: _name, cnic: _cnic, requester: msg.sender, status: KYCStatus.PENDING});
        emit KYCSubmitted(msg.sender, _name, _cnic);
    }

    function approveKYC(address _addr) external onlyAdmin {
        Request storage req = requests[_addr];
        require(req.status == KYCStatus.PENDING, "No pending request");
        req.status = KYCStatus.APPROVED;
        verified[_addr] = true;
        emit KYCApproved(_addr);
    }

    function rejectKYC(address _addr) external onlyAdmin {
        Request storage req = requests[_addr];
        require(req.status == KYCStatus.PENDING, "No pending request");
        req.status = KYCStatus.REJECTED;
        verified[_addr] = false;
        emit KYCRejected(_addr);
    }

    function getRequest(address _addr) external view returns (string memory name, string memory cnic, KYCStatus status, address requester) {
        Request storage req = requests[_addr];
        return (req.name, req.cnic, req.status, req.requester);
    }

    function isVerified(address _addr) external view returns (bool) {
        return verified[_addr] || (_addr == admin);
    }
}
