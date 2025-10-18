import { useState } from "react";
import { ethers } from "ethers";
import { CROWDFUND_CONTRACT_ADDRESS, CROWDFUND_ABI } from "../config";

export default function CrowdfundingPanel({ account }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [goal, setGoal] = useState("");
  const [campaignId, setCampaignId] = useState(null);
  const [amount, setAmount] = useState("");

  async function getContract() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CROWDFUND_CONTRACT_ADDRESS, CROWDFUND_ABI, signer);
  }

  async function createCampaign() {
    try {
      const contract = await getContract();
      const tx = await contract.createCampaign(title, desc, ethers.parseEther(goal));
      const receipt = await tx.wait();
      console.log(receipt);
      alert("Campaign created!");
    } catch (err) {
      console.error(err);
      alert("Failed to create campaign");
    }
  }

  async function contribute() {
    try {
      const contract = await getContract();
      const tx = await contract.contribute(campaignId, { value: ethers.parseEther(amount) });
      await tx.wait();
      alert("Contribution successful!");
    } catch (err) {
      console.error(err);
      alert("Contribution failed");
    }
  }

  async function withdraw() {
    try {
      const contract = await getContract();
      const tx = await contract.withdraw(campaignId);
      await tx.wait();
      alert("Funds withdrawn!");
    } catch (err) {
      console.error(err);
      alert("Withdraw failed (check campaign status)");
    }
  }

  return (
    <div className="p-4 bg-gray-100 rounded-xl shadow-md my-4">
      <h2 className="font-bold mb-2 text-lg">Crowdfunding Campaigns</h2>

      <h3 className="font-semibold mt-2">Create New Campaign</h3>
      <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="border p-2 m-1 rounded w-full" />
      <input placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} className="border p-2 m-1 rounded w-full" />
      <input placeholder="Goal in ETH" value={goal} onChange={(e) => setGoal(e.target.value)} className="border p-2 m-1 rounded w-full" />
      <button onClick={createCampaign} className="bg-green-600 text-white px-4 py-2 rounded m-1">
        Create
      </button>

      <h3 className="font-semibold mt-4">Contribute / Withdraw</h3>
      <input placeholder="Campaign ID" value={campaignId || ""} onChange={(e) => setCampaignId(e.target.value)} className="border p-2 m-1 rounded w-full" />
      <input placeholder="Amount (ETH)" value={amount} onChange={(e) => setAmount(e.target.value)} className="border p-2 m-1 rounded w-full" />
      <button onClick={contribute} className="bg-blue-500 text-white px-4 py-2 rounded m-1">
        Contribute
      </button>
      <button onClick={withdraw} className="bg-yellow-600 text-white px-4 py-2 rounded m-1">
        Withdraw
      </button>
    </div>
  );
}
