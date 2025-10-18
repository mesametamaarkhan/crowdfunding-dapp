import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying with:", await deployer.getAddress());

  const KYC = await ethers.deployContract("KYCRegistry_MesamTamaarKhan");
  await KYC.waitForDeployment();
  console.log("KYCRegistry deployed to:", await KYC.getAddress());

  const Crowdfund = await ethers.deployContract("Crowdfunding_MesamTamaarKhan", [await KYC.getAddress()]);
  await Crowdfund.waitForDeployment();
  console.log("Crowdfunding deployed to:", await Crowdfund.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
