import { useState, useEffect } from "react";

export default function ConnectWallet({ onConnected }) {
  const [account, setAccount] = useState(null);

  async function connect() {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      onConnected(accounts[0]);
    } else {
      alert("MetaMask not found. Please install it.");
    }
  }

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          onConnected(accounts[0]);
        }
      });
    }
  }, []);

  return (
    <div className="p-4 bg-gray-900 text-white rounded-xl shadow-md flex justify-between items-center">
      {account ? (
        <span>Connected: {account.substring(0, 6)}...{account.slice(-4)}</span>
      ) : (
        <button onClick={connect} className="bg-blue-500 px-4 py-2 rounded-lg">
          Connect MetaMask
        </button>
      )}
    </div>
  );
}
