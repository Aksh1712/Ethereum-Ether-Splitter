const EtherSplitter = artifacts.require("EtherSplitter");
const { expectRevert } = require("@openzeppelin/test-helpers");

contract("EtherSplitter", accounts => {
  let splitter;
  const [owner, sender, recipient1, recipient2, recipient3] = accounts;

  beforeEach(async () => {
    splitter = await EtherSplitter.new(recipient1, recipient2, recipient3, { from: owner });
  });

  it("should split Ether equally among recipients", async () => {
    const amount = web3.utils.toWei("3", "ether");
    const initialBalances = await Promise.all([
      web3.eth.getBalance(recipient1),
      web3.eth.getBalance(recipient2),
      web3.eth.getBalance(recipient3)
    ]);

    await splitter.splitEther({ from: sender, value: amount });

    const finalBalances = await Promise.all([
      web3.eth.getBalance(recipient1),
      web3.eth.getBalance(recipient2),
      web3.eth.getBalance(recipient3)
    ]);

    const expectedAmount = web3.utils.toWei("1", "ether");
    assert.equal(
      finalBalances[0] - initialBalances[0],
      expectedAmount,
      "Recipient1 should receive 1 ETH"
    );
    assert.equal(
      finalBalances[1] - initialBalances[1],
      expectedAmount,
      "Recipient2 should receive 1 ETH"
    );
    assert.equal(
      finalBalances[2] - initialBalances[2],
      expectedAmount,
      "Recipient3 should receive 1 ETH"
    );
  });

  it("should refund remainder to sender", async () => {
    const amount = web3.utils.toWei("10", "ether");
    await splitter.splitEther({ from: sender, value: amount });
    const refund = await splitter.pendingRefunds(sender);
    assert.equal(refund.toString(), web3.utils.toWei("1", "ether"), "Sender should have 1 ETH refund");
    const initialBalance = await web3.eth.getBalance(sender);
    await splitter.withdrawRefund({ from: sender });
    const finalBalance = await web3.eth.getBalance(sender);
    assert(finalBalance > initialBalance, "Sender should withdraw refund");
  });

  it("should prevent zero Ether deposits", async () => {
    await expectRevert(
      splitter.splitEther({ from: sender, value: 0 }),
      "Must send Ether"
    );
  });

  it("should allow owner to update recipient", async () => {
    const newRecipient = accounts[4];
    await splitter.updateRecipient(0, newRecipient, { from: owner });
    const recipients = await splitter.getRecipients();
    assert.equal(recipients[0], newRecipient, "Recipient1 should be updated");
  });
});