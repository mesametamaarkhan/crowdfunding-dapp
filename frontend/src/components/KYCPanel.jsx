import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { KYC_CONTRACT_ADDRESS, KYC_ABI } from "../config";
import "../App.css";

export default function KYCPanel({ account }) {
  const [name, setName] = useState("");
  const [cnic, setCnic] = useState("");
  const [status, setStatus] = useState("");
  const [kycDetails, setKycDetails] = useState(null);
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approveAddress, setApproveAddress] = useState("");


  const ADMIN_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // hardcoded admin

  async function getContract() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(KYC_CONTRACT_ADDRESS, KYC_ABI, signer);
  }

  async function submitKYC() {
    try {
      setLoading(true);
      const contract = await getContract();
      const tx = await contract.submitKYC(name.trim(), cnic.trim());
      await tx.wait();
      alert("✅ KYC submitted successfully!");
      setName("");
      setCnic("");
      await checkStatus();
      await fetchAllRequests();
    } catch (err) {
      console.error(err);
      alert("❌ Error submitting KYC");
    } finally {
      setLoading(false);
    }
  }

  async function approveUser() {
  try {
    setLoading(true);
    const contract = await getContract();

    // Get actual signer address from provider
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();

    if (signerAddress.toLowerCase() !== ADMIN_ADDRESS.toLowerCase()) {
      alert("⚠️ Only admin can approve users!");
      setLoading(false);
      return;
    }

    if (!ethers.isAddress(approveAddress)) {
      alert("⚠️ Please enter a valid wallet address");
      setLoading(false);
      return;
    }

    const tx = await contract.approveKYC(approveAddress);
    await tx.wait();
    alert(`✅ Approved user: ${approveAddress}`);
    await fetchAllRequests();
  } catch (err) {
    console.error(err);
    alert("❌ Approval failed");
  } finally {
    setLoading(false);
  }
}

  async function checkStatus() {
    try {
      setLoading(true);
      const contract = await getContract();
      const data = await contract.getRequest(account);
      const statusEnum = ["NONE", "PENDING", "APPROVED", "REJECTED"];
      const currentStatus = statusEnum[Number(data[2])];

      setStatus(currentStatus);
      setKycDetails({
        name: data[0],
        cnic: data[1],
        requester: data[3],
      });
    } catch (err) {
      console.error(err);
      alert("❌ Unable to fetch KYC status");
    } finally {
      setLoading(false);
    }
  }

  async function fetchAllRequests() {
    try {
      const contract = await getContract();
      const [names, cnics, addrs, statuses] = await contract.getAllRequests();
      const statusEnum = ["NONE", "PENDING", "APPROVED", "REJECTED"];

      const requests = names.map((name, i) => ({
        name,
        cnic: cnics[i],
        requester: addrs[i],
        status: statusEnum[Number(statuses[i])] || "UNKNOWN",
      }));

      setAllRequests(requests);
    } catch (err) {
      console.error("Error fetching all requests:", err);
    }
  }

  useEffect(() => {
    if (account) {
      checkStatus();
      fetchAllRequests();
    }
  }, [account]);

  return (
    <div className="panel">
      <h2 className="section-title">KYC Verification</h2>

      {/* User KYC Submission */}
      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="input-field"
      />
      <input
        type="text"
        placeholder="CNIC"
        value={cnic}
        onChange={(e) => setCnic(e.target.value)}
        className="input-field"
      />

      <div className="button-group">
        <button onClick={submitKYC} className="btn btn-success" disabled={loading}>
          {loading ? "Submitting..." : "Submit KYC"}
        </button>

        <button onClick={() => approveUser(account)} className="btn btn-warning" disabled={loading}>
          {loading ? "Processing..." : "Admin Approve Self"}
        </button>

        <button onClick={checkStatus} className="btn btn-info" disabled={loading}>
          {loading ? "Checking..." : "Check Status"}
        </button>
      </div>

      {/* ✅ Admin Approval Input */}
      <div className="panel" style={{ marginTop: "1.5rem", background: "#f1f5f9" }}>
        <h3 className="sub-title">🛡️ Admin Approval Panel</h3>
        <input
	  type="text"
	  placeholder="Enter user wallet to approve"
	  value={approveAddress}
	  onChange={(e) => setApproveAddress(e.target.value)}
	  className="input-field"
	/>
        <button
          onClick={() => approveUser(approveAddress)}
          className="btn btn-warning"
          disabled={loading || !approveAddress}
        >
          {loading ? "Approving..." : "Approve This Address"}
        </button>
      </div>

      {/* Current User Status */}
      {status && (
        <div className="status-text" style={{ marginTop: "1rem" }}>
          Status:{" "}
          <b
            style={{
              color:
                status === "APPROVED"
                  ? "#16a34a"
                  : status === "PENDING"
                  ? "#eab308"
                  : status === "REJECTED"
                  ? "#dc2626"
                  : "#6b7280",
            }}
          >
            {status}
          </b>
        </div>
      )}

      {/* User's Own KYC Details */}
      {kycDetails && kycDetails.name && (
        <div className="panel" style={{ marginTop: "1rem", background: "#f9fafb" }}>
          <h3 className="sub-title">Your KYC Details</h3>
          <p>
            <b>Name:</b> {kycDetails.name}
          </p>
          <p>
            <b>CNIC:</b> {kycDetails.cnic}
          </p>
          <p>
            <b>Address:</b> {kycDetails.requester}
          </p>
        </div>
      )}

      {/* All KYC Requests Table */}
      <div className="panel" style={{ marginTop: "2rem", background: "#f9fafb" }}>
        <h3 className="sub-title">📋 All KYC Requests</h3>
        {allRequests.length === 0 ? (
          <p>No KYC requests yet.</p>
        ) : (
          <table className="kyc-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>CNIC</th>
                <th>Wallet Address</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {allRequests.map((req, i) => (
                <tr key={i}>
                  <td>{req.name}</td>
                  <td>{req.cnic}</td>
                  <td>{req.requester}</td>
                  <td>
                    <span
                      className={`status-badge status-${(req.status || "none").toLowerCase()}`}
                      style={{ fontSize: "0.8rem" }}
                    >
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
