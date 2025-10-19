import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CROWDFUND_CONTRACT_ADDRESS, CROWDFUND_ABI } from "../config";
import "../App.css";

export default function CrowdfundingPanel({ account }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [goal, setGoal] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [amount, setAmount] = useState("");
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);

  async function getContract() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CROWDFUND_CONTRACT_ADDRESS, CROWDFUND_ABI, signer);
  }

  async function createCampaign() {
    try {
      const contract = await getContract();
      const tx = await contract.createCampaign(
        title,
        desc,
        ethers.parseEther(goal)
      );
      await tx.wait();
      alert("✅ Campaign created successfully!");
      setTitle("");
      setDesc("");
      setGoal("");
      fetchCampaigns();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to create campaign");
    }
  }

  async function contribute() {
    try {
      const contract = await getContract();
      const tx = await contract.contribute(campaignId, {
        value: ethers.parseEther(amount),
      });
      await tx.wait();
      alert("✅ Contribution successful!");
      fetchCampaigns();
    } catch (err) {
      console.error(err);
      alert("❌ Contribution failed");
    }
  }

  async function withdraw() {
    try {
      const contract = await getContract();
      const tx = await contract.withdraw(campaignId);
      await tx.wait();
      alert("✅ Funds withdrawn!");
      fetchCampaigns();
    } catch (err) {
      console.error(err);
      alert("⚠️ Withdraw failed (check campaign status)");
    }
  }

  async function fetchCampaigns() {
    try {
      setLoading(true);
      const contract = await getContract();
      const count = await contract.campaignCount();
      const fetched = [];

      for (let i = 1; i <= count; i++) {
        const data = await contract.getCampaign(i);
        fetched.push({
          id: data[0].toString(),
          creator: data[1],
          title: data[2],
          description: data[3],
          goal: ethers.formatEther(data[4]),
          raised: ethers.formatEther(data[5]),
          status:
            data[6] === 0
              ? "Active"
              : data[6] === 1
              ? "Completed"
              : "Withdrawn",
        });
      }

      setCampaigns(fetched);
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (account) fetchCampaigns();
  }, [account]);

  return (
    <div className="panel">
      <h2 className="section-title">Crowdfunding Campaigns</h2>

      {/* Create Campaign */}
      <div className="campaign-section">
        <h3 className="sub-title">Create New Campaign</h3>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="input-field"
        />
        <input
          type="number"
          placeholder="Goal in ETH"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className="input-field"
        />
        <button onClick={createCampaign} className="btn btn-success">
          Create Campaign
        </button>
      </div>

      <hr className="divider" />

      {/* Contribute / Withdraw */}
      <div className="campaign-section">
        <h3 className="sub-title">Contribute / Withdraw</h3>
        <input
          type="text"
          placeholder="Campaign ID"
          value={campaignId}
          onChange={(e) => setCampaignId(e.target.value)}
          className="input-field"
        />
        <input
          type="number"
          placeholder="Amount (ETH)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input-field"
        />
        <div className="button-group">
          <button onClick={contribute} className="btn btn-info">
            Contribute
          </button>
          <button onClick={withdraw} className="btn btn-warning">
            Withdraw
          </button>
        </div>
      </div>

      <hr className="divider" />

      {/* Campaign List */}
      <div className="campaign-list">
        <h3 className="sub-title">All Campaigns</h3>
        {loading ? (
          <p>Loading campaigns...</p>
        ) : campaigns.length === 0 ? (
          <p>No campaigns found.</p>
        ) : (
          <ul className="campaign-ul">
            {campaigns.map((c) => (
              <li key={c.id} className="campaign-item">
                <div className="campaign-header">
                  <span className="campaign-id">#{c.id}</span>
                  <span className={`status-badge status-${c.status.toLowerCase()}`}>
                    {c.status}
                  </span>
                </div>
                <h4>{c.title}</h4>
                <p>{c.description}</p>
                <p>
                  🎯 <b>Goal:</b> {c.goal} ETH | 💰 <b>Raised:</b> {c.raised} ETH
                </p>
                <p className="creator-text">👤 Creator: {c.creator}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
