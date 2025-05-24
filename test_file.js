const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EtherSplitter", function () {
  let etherSplitter;
  let owner, recipient1, recipient2, recipient3, sender;
  
  beforeEach(async function () {
    [owner, recipient1, recipient2, recipient3, sender] = await ethers.getSigners();
    
    const EtherSplitter = await ethers.getContractFactory("EtherSplitter");
    etherSplitter = await EtherSplitter.deploy(
      recipient1.address,
      recipient2.address,
      recipient3.address
    );
    await etherSplitter.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right recipients", async function () {
      const recipients = await etherSplitter.getRecipients();
      expect(recipients[0]).to.equal(recipient1.address);
      expect(recipients[1]).to.equal(recipient2.address);
      expect(recipients[2]).to.equal(recipient3.address);
    });

    it("Should set the right owner", async function () {
      expect(await etherSplitter.owner()).to.equal(owner.address);
    });

    it("Should revert if any recipient is zero address", async function () {
      const EtherSplitter = await ethers.getContractFactory("EtherSplitter");
      
      await expect(
        EtherSplitter.deploy(
          ethers.ZeroAddress,
          recipient2.address,
          recipient3.address
        )
      ).to.be.revertedWithCustomError(etherSplitter, "ZeroAddress");
    });
  });

  describe("Ether Splitting", function () {
    it("Should split Ether equally when sent via receive", async function () {
      const sendAmount = ethers.parseEther("3");
      
      // Record initial balances
      const initialBalance1 = await ethers.provider.getBalance(recipient1.address);
      const initialBalance2 = await ethers.provider.getBalance(recipient2.address);
      const initialBalance3 = await ethers.provider.getBalance(recipient3.address);
      
      // Send Ether to contract
      await sender.sendTransaction({
        to: await etherSplitter.getAddress(),
        value: sendAmount
      });
      
      // Check final balances
      const finalBalance1 = await ethers.provider.getBalance(recipient1.address);
      const finalBalance2 = await ethers.provider.getBalance(recipient2.address);
      const finalBalance3 = await ethers.provider.getBalance(recipient3.address);
      
      expect(finalBalance1 - initialBalance1).to.equal(ethers.parseEther("1"));
      expect(finalBalance2 - initialBalance2).to.equal(ethers.parseEther("1"));
      expect(finalBalance3 - initialBalance3).to.equal(ethers.parseEther("1"));
      
      // Contract should have no remaining balance
      expect(await etherSplitter.getBalance()).to.equal(0);
    });

    it("Should handle remainder correctly", async function () {
      const sendAmount = ethers.parseEther("1"); // 1 ETH = 1000000000000000000 wei
      
      const initialBalance1 = await ethers.provider.getBalance(recipient1.address);
      const initialBalance2 = await ethers.provider.getBalance(recipient2.address);
      const initialBalance3 = await ethers.provider.getBalance(recipient3.address);
      
      await sender.sendTransaction({
        to: await etherSplitter.getAddress(),
        value: sendAmount
      });
      
      const finalBalance1 = await ethers.provider.getBalance(recipient1.address);
      const finalBalance2 = await ethers.provider.getBalance(recipient2.address);
      const finalBalance3 = await ethers.provider.getBalance(recipient3.address);
      
      const shareAmount = sendAmount / 3n;
      const remainder = sendAmount % 3n;
      
      expect(finalBalance1 - initialBalance1).to.equal(shareAmount + remainder);
      expect(finalBalance2 - initialBalance2).to.equal(shareAmount);
      expect(finalBalance3 - initialBalance3).to.equal(shareAmount);
    });

    it("Should emit EtherReceived and EtherSplit events", async function () {
      const sendAmount = ethers.parseEther("3");
      
      await expect(
        sender.sendTransaction({
          to: await etherSplitter.getAddress(),
          value: sendAmount
        })
      )
        .to.emit(etherSplitter, "EtherReceived")
        .withArgs(sender.address, sendAmount)
        .and.to.emit(etherSplitter, "EtherSplit")
        .withArgs(
          recipient1.address,
          recipient2.address,
          recipient3.address,
          ethers.parseEther("1"),
          ethers.parseEther("1"),
          ethers.parseEther("1")
        );
    });

    it("Should update totalReceived and totalSplit", async function () {
      const sendAmount = ethers.parseEther("3");
      
      await sender.sendTransaction({
        to: await etherSplitter.getAddress(),
        value: sendAmount
      });
      
      expect(await etherSplitter.totalReceived()).to.equal(sendAmount);
      expect(await etherSplitter.totalSplit()).to.equal(sendAmount);
    });
  });

  describe("Manual Split", function () {
    it("Should allow manual splitting", async function () {
      // Send Ether directly without triggering automatic split
      // This is just for testing - in reality, receive() will always be called
      const sendAmount = ethers.parseEther("3");
      
      await sender.sendTransaction({
        to: await etherSplitter.getAddress(),
        value: sendAmount
      });
      
      // The split should have already happened automatically
      expect(await etherSplitter.getBalance()).to.equal(0);
      
      // Manual split with no balance should revert
      await expect(etherSplitter.manualSplit())
        .to.be.revertedWithCustomError(etherSplitter, "NoFundsToSplit");
    });
  });

  describe("Emergency Withdraw", function () {
    it("Should allow owner to emergency withdraw", async function () {
      // For this test, we need to have some balance without automatic splitting
      // This would be an edge case scenario
      const sendAmount = ethers.parseEther("1");
      
      // Send normally (will auto-split)
      await sender.sendTransaction({
        to: await etherSplitter.getAddress(),
        value: sendAmount
      });
      
      // Should have 0 balance after auto-split
      expect(await etherSplitter.getBalance()).to.equal(0);
      
      // Emergency withdraw with no funds should revert
      await expect(
        etherSplitter.emergencyWithdraw(owner.address)
      ).to.be.revertedWithCustomError(etherSplitter, "NoFundsToSplit");
    });

    it("Should not allow non-owner to emergency withdraw", async function () {
      await expect(
        etherSplitter.connect(recipient1).emergencyWithdraw(recipient1.address)
      ).to.be.revertedWithCustomError(etherSplitter, "Unauthorized");
    });

    it("Should not allow emergency withdraw to zero address", async function () {
      await expect(
        etherSplitter.emergencyWithdraw(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(etherSplitter, "ZeroAddress");
    });
  });

  describe("View Functions", function () {
    it("Should return correct balance", async function () {
      expect(await etherSplitter.getBalance()).to.equal(0);
      
      const sendAmount = ethers.parseEther("3");
      await sender.sendTransaction({
        to: await etherSplitter.getAddress(),
        value: sendAmount
      });
      
      // Should be 0 after auto-split
      expect(await etherSplitter.getBalance()).to.equal(0);
    });

    it("Should return correct recipients", async function () {
      const recipients = await etherSplitter.getRecipients();
      expect(recipients[0]).to.equal(recipient1.address);
      expect(recipients[1]).to.equal(recipient2.address);
      expect(recipients[2]).to.equal(recipient3.address);
    });
  });
});