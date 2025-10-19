# 🪙 Decentralized Crowdfunding DApp with KYC Verification

A decentralized crowdfunding platform built on **Ethereum** using **Hardhat** for smart contracts and **React + Ethers.js** for the frontend.  
This DApp allows users to register and get verified through a KYC process before creating or contributing to crowdfunding campaigns.

## 🚀 Features

- ✅ **KYC Verification System** — Only verified users can create or contribute to campaigns.  
- 🎯 **Campaign Creation** — Users can start new fundraising campaigns with a goal in ETH.  
- 💰 **Contributions** — Other users can contribute directly via MetaMask.  
- 🔓 **Withdrawals** — Campaign creators can withdraw funds once the goal is reached.  
- 🔗 **Fully On-Chain** — No centralized backend; all data lives on the Ethereum blockchain.

## ⚙️ Installation & Setup

Follow these steps to set up the project locally:

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/mesametamaarkhan/crowdfunding-dapp.git
cd crowdfunding-dapp
````

### 2️⃣ Install Root Dependencies

```bash
npm install
```

### 3️⃣ Set Up the Frontend

```bash
cd frontend
npm install
```

## 🧠 Running the Project

Open **three terminals** — all from the root `crowdfunding-dapp` directory.

### 🖥️ Terminal 1 — Start Local Blockchain

```bash
npx hardhat node
```

### ⚙️ Terminal 2 — Compile & Deploy Contracts

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
```

After running the deploy command, you will get addresses for **both the KYC** and **Crowdfunding** contracts in your terminal.

Copy those addresses and update them in:

```
frontend/src/config.js
```

At the top of the file, replace the placeholders:

```javascript
export const KYC_CONTRACT_ADDRESS = "KYC_ADDRESS_HERE";
export const CROWDFUND_CONTRACT_ADDRESS = "CROWDFUND_ADDRESS_HERE";
```

⚠️ Make sure both addresses start with `0x`.


### 💻 Terminal 3 — Start the Frontend

```bash
cd frontend
npm run dev
```

Now open the local development URL (usually `http://localhost:5173`) in your browser.

## 🧩 Technologies Used

* **Solidity** — Smart contract language
* **Hardhat** — Ethereum development environment
* **React.js + Vite** — Frontend framework
* **Ethers.js** — Blockchain interaction
* **MetaMask** — Wallet integration


## 📁 Project Structure

```
crowdfunding-dapp/
│
├── contracts/              # Smart contracts (KYC + Crowdfunding)
├── scripts/                # Deployment scripts
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── config.js       # Contract addresses
│   │   └── App.jsx         # Main app file
│   └── package.json
├── hardhat.config.js       # Hardhat setup
└── README.md               # You are here
```

## 🧾 License

This project is licensed under the **MIT License**.
Feel free to modify and expand upon it for your own decentralized applications.


## 🔗 Repository

**GitHub:** [https://github.com/yourusername/crowdfunding-dapp](https://github.com/mesametamaarkhan/crowdfunding-dapp)

## 🧰 Troubleshooting

If you run into common issues, here are quick fixes:

| Problem                                       | Solution                                                                               |
| --------------------------------------------- | -------------------------------------------------------------------------------------- |
| **`ProviderError: port 8545 already in use`** | Stop any running Hardhat/Anvil/Ganache instance or change port in `hardhat.config.js`. |
| **MetaMask not connecting**                   | Ensure MetaMask is on the same network (Localhost 8545). Reload the frontend.          |
| **Contracts not deployed or wrong address**   | Re-run deploy script and update addresses in `frontend/src/config.js`.                 |
| **"invalid BigNumber string"**                | Ensure ETH values are numeric and not empty when creating/contributing to campaigns.   |


✨ **Developed using Solidity, Hardhat, React, and Ethers.js.**

