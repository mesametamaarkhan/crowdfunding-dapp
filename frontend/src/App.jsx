import { useState } from "react";
import ConnectWallet from "./components/ConnectWallet";
import KYCPanel from "./components/KYCPanel";
import CrowdfundingPanel from "./components/CrowdfundingPanel";

export default function App() {
  const [account, setAccount] = useState(null);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-center">💸 Crowdfunding DApp</h1>
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
