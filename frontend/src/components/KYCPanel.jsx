import { useState } from "react";
import { ethers } from "ethers";
import { KYC_CONTRACT_ADDRESS, KYC_ABI } from "../config";
import "../App.css"; // Make sure global styles are imported

export default function KYCPanel({ account }) {
  const [name, setName] = useState("");
  const [cnic, setCnic] = useState("");
  const [status, setStatus] = useState("");

  async function getContract() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(KYC_CONTRACT_ADDRESS, KYC_ABI, signer);
  }

  async function submitKYC() {
    try {
      const contract = await getContract();
      const tx = await contract.submitKYC(name, cnic);
      await tx.wait();
      alert("✅ KYC submitted successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Error submitting KYC");
    }
  }

  async function approveUser() {
    try {
      const contract = await getContract();
      const tx = await contract.approveKYC("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC");
      await tx.wait();
      alert("✅ User approved!");
    } catch (err) {
      console.error(err);
      alert("⚠️ Only admin can approve users");
    }
  }

  async function checkStatus() {
    try {
      const contract = await getContract();
      const data = await contract.getRequest(account);
      const statusEnum = ["NONE", "PENDING", "APPROVED", "REJECTED"];
      setStatus(statusEnum[Number(data[2])]);
    } catch (err) {
      console.error(err);
      alert("Unable to fetch KYC status");
    }
  }

  return (
    <div className="panel">
      <h2 className="section-title">KYC Verification</h2>

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
        <button onClick={submitKYC} className="btn btn-success">
          Submit KYC
        </button>
        <button onClick={approveUser} className="btn btn-warning">
          Admin Approve
        </button>
        <button onClick={checkStatus} className="btn btn-info">
          Check Status
        </button>
      </div>

      {status && (
        <p className="status-text">
          Status: <b>{status}</b>
        </p>
      )}
    </div>
  );
}
