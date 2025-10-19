import { useState } from "react";
import ConnectWallet from "./components/ConnectWallet";
import KYCPanel from "./components/KYCPanel";
import CrowdfundingPanel from "./components/CrowdfundingPanel";
import "./App.css";

export default function App() {
  const [account, setAccount] = useState(null);

  return (
    <div className="app-container">
      <h1 className="app-title">💸 Crowdfunding DApp</h1>
      <ConnectWallet onConnected={setAccount} />
      {account && (
        <>
          <KYCPanel account={account} />
          <CrowdfundingPanel account={account} />
        </>
      )}
    </div>
  );
}
