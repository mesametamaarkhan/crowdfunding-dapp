import { useState } from "react";
import { ethers } from "ethers";
import { KYC_CONTRACT_ADDRESS, KYC_ABI } from "../config";

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
      alert("KYC submitted!");
    } catch (err) {
      console.error(err);
      alert("Error submitting KYC");
    }
  }

  async function approveUser() {
    try {
      const contract = await getContract();
      const tx = await contract.approveKYC("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
      await tx.wait();
      alert("User approved!");
    } catch (err) {
      console.error(err);
      alert("Only admin can approve.");
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
    <div className="p-4 bg-gray-100 rounded-xl shadow-md my-4">
      <h2 className="font-bold mb-2 text-lg">KYC Verification</h2>
      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 m-1 rounded w-full"
      />
      <input
        placeholder="CNIC"
        value={cnic}
        onChange={(e) => setCnic(e.target.value)}
        className="border p-2 m-1 rounded w-full"
      />
      <button onClick={submitKYC} className="bg-green-500 text-white px-4 py-2 m-1 rounded">
        Submit KYC
      </button>
      <button onClick={approveUser} className="bg-yellow-500 text-white px-4 py-2 m-1 rounded">
        Admin Approve
      </button>
      <button onClick={checkStatus} className="bg-blue-500 text-white px-4 py-2 m-1 rounded">
        Check Status
      </button>
      {status && <p className="mt-2">Status: <b>{status}</b></p>}
    </div>
  );
}
