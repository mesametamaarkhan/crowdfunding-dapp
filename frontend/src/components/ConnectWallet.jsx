import { useState, useEffect } from "react";
import "../App.css";

export default function ConnectWallet({ onConnected }) {
  const [account, setAccount] = useState(null);

  async function connect() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        onConnected(accounts[0]);
      } catch (err) {
        console.error(err);
        alert("Failed to connect MetaMask");
      }
    } else {
      alert("MetaMask not found. Please install it to continue.");
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
  }, [onConnected]);

  return (
    <div className="wallet-panel">
      {account ? (
        <span className="wallet-status">
          ✅ Connected:{" "}
          <b>
            {account.substring(0, 6)}...{account.slice(-4)}
          </b>
        </span>
      ) : (
        <button onClick={connect} className="btn btn-primary">
          Connect MetaMask
        </button>
      )}
    </div>
  );
}
