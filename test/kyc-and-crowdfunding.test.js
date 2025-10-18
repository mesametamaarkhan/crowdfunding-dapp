import { expect } from "chai";
import pkg from 'hardhat';
const { ethers } = pkg;

describe("KYC + Crowdfunding (MesamTamaarKhan)", function () {
  let kyc, crowdfund;
  let deployer, alice, bob, carol;

  beforeEach(async () => {
    [deployer, alice, bob, carol] = await ethers.getSigners();

    const KYC = await ethers.deployContract("KYCRegistry_MesamTamaarKhan");
    kyc = KYC;
    await kyc.waitForDeployment();

    const Crowd = await ethers.deployContract("Crowdfunding_MesamTamaarKhan", [await kyc.getAddress()]);
    crowdfund = Crowd;
    await crowdfund.waitForDeployment();
  });

  it("KYC: submit and admin approve", async () => {
    // alice submits KYC
    await kyc.connect(alice).submitKYC("Alice", "12345");
    let req = await kyc.getRequest(await alice.getAddress());
    // req[2] is the enum status (PENDING == 1)
    expect(Number(req[2])).to.equal(1);

    // admin approves (deployer is admin)
    await kyc.approveKYC(await alice.getAddress());
    expect(await kyc.isVerified(await alice.getAddress())).to.equal(true);
  });

  it("Only verified user (or admin) can create campaign", async () => {
    // bob is not verified; should fail
    await expect(
      crowdfund.connect(bob).createCampaign("Title", "Desc", ethers.parseEther("1"))
    ).to.be.revertedWith("Not verified");

    // bob submits KYC (as bob)
    await kyc.connect(bob).submitKYC("Bob", "11111");
    // admin approves bob (deployer is admin)
    await kyc.approveKYC(await bob.getAddress());
    expect(await kyc.isVerified(await bob.getAddress())).to.equal(true);

    // bob can create campaign now
    const tx = await crowdfund.connect(bob).createCampaign("Camp", "Desc", ethers.parseEther("1"));
    await tx.wait();
    const info = await crowdfund.getCampaign(1);
    expect(info[2]).to.equal("Camp");
    expect(info[4]).to.equal(ethers.parseEther("1"));
  });

  it("Contribute updates funds and completes when goal reached; creator withdraws", async () => {
    // approve alice, alice creates campaign with 1 ETH goal
    await kyc.connect(alice).submitKYC("Alice", "A_CN");
    await kyc.approveKYC(await alice.getAddress());

    await crowdfund.connect(alice).createCampaign("A", "Desc", ethers.parseEther("1"));

    // carol (unverified) contributes 0.4 ETH
    await crowdfund.connect(carol).contribute(1, { value: ethers.parseEther("0.4") });
    let campaign = await crowdfund.getCampaign(1);
    expect(campaign.raised).to.equal(ethers.parseEther("0.4"));
    expect(Number(campaign.status)).to.equal(0); // Active

    // bob contributes 0.6 ETH -> reaches goal
    await crowdfund.connect(bob).contribute(1, { value: ethers.parseEther("0.6") });
    campaign = await crowdfund.getCampaign(1);
    expect(campaign.raised).to.equal(ethers.parseEther("1.0"));
    expect(Number(campaign.status)).to.equal(1); // Completed

    // balance before withdraw (use provider.getBalance)
    const before = await ethers.provider.getBalance(await alice.getAddress());

    // withdraw by creator (alice)
    const withdrawTx = await crowdfund.connect(alice).withdraw(1);
    await withdrawTx.wait();

    campaign = await crowdfund.getCampaign(1);
    expect(Number(campaign.status)).to.equal(2); // Withdrawn

    const after = await ethers.provider.getBalance(await alice.getAddress());
    // Simple numeric comparison for BigInt balances
    expect(after > before).to.equal(true);
  });
});
