import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import EtherSplitter from './contracts/EtherSplitter.json';
import './App.css';

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [recipients, setRecipients] = useState([]);
  const [balance, setBalance] = useState('0');
  const [amount, setAmount] = useState('');
  const [refund, setRefund] = useState('0');

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3Instance.eth.getAccounts();
        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = EtherSplitter.networks[networkId];
        const contractInstance = new web3Instance.eth.Contract(
          EtherSplitter.abi,
          deployedNetwork && deployedNetwork.address
        );
        const recipients = await contractInstance.methods.getRecipients().call();
        const balance = await contractInstance.methods.getContractBalance().call();
        const refund = await contractInstance.methods.pendingRefunds(accounts[0]).call();

        setWeb3(web3Instance);
        setContract(contractInstance);
        setAccount(accounts[0]);
        setRecipients(recipients);
        setBalance(web3Instance.utils.fromWei(balance, 'ether'));
        setRefund(web3Instance.utils.fromWei(refund, 'ether'));
      }
    };
    init();
  }, []);

  const splitEther = async () => {
    if (!contract || !web3 || !amount) return;
    try {
      await contract.methods.splitEther().send({
        from: account,
        value: web3.utils.toWei(amount, 'ether')
      });
      const newBalance = await contract.methods.getContractBalance().call();
      const newRefund = await contract.methods.pendingRefunds(account).call();
      setBalance(web3.utils.fromWei(newBalance, 'ether'));
      setRefund(web3.utils.fromWei(newRefund, 'ether'));
      setAmount('');
    } catch (error) {
      console.error("Split failed:", error);
    }
  };

  const withdrawRefund = async () => {
    if (!contract || !web3) return;
    try {
      await contract.methods.withdrawRefund().send({ from: account });
      const newRefund = await contract.methods.pendingRefunds(account).call();
      setRefund(web3.utils.fromWei(newRefund, 'ether'));
      alert("Refund withdrawn");
    } catch (error) {
      console.error("Withdrawal failed:", error);
    }
  };

  return (
    <div className="container">
      <h1>Ethereum Ether Splitter</h1>
      <p>Connected Account: {account}</p>
      <p>Contract Balance: {balance} ETH</p>
      <p>Pending Refund: {refund} ETH</p>
      <h2>Recipients</h2>
      <ul>
        {recipients.map((recipient, index) => (
          <li key={index}>Recipient {index + 1}: {recipient}</li>
        ))}
      </ul>
      <div>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount to split (ETH)"
        />
        <button onClick={splitEther}>Split Ether</button>
      </div>
      <button onClick={withdrawRefund}>Withdraw Refund</button>
    </div>
  );
};

export default App;