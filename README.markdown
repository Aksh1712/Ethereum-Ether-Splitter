# Ethereum Ether Splitter

A smart contract for splitting incoming Ether equally among three fixed addresses.

## Features
- Splits incoming Ether equally among three predefined recipients.
- Refunds any remainder to the sender.
- Owner can update recipient addresses.
- View recipient addresses and contract balance.

## Prerequisites
- Node.js v16+
- Truffle v5.5.0+
- Ganache CLI (for local testing)
- MetaMask (for testnet interaction)
- Infura account (for testnet deployment)

## Installation
1. Clone the repository: `git clone https://github.com/Aksh1712/ether-splitter`
2. Install dependencies: `npm install`
3. Start Ganache: `ganache-cli`
4. Compile and deploy: `truffle compile && truffle migrate`

## Deployment
- Deploy to Sepolia testnet: `truffle migrate --network sepolia`
- Verify contract: `truffle run verify EtherSplitter --network sepolia`

## Usage
- Connect MetaMask to Sepolia or Ganache.
- Interact via Remix or the front-end (`app/`).
- Send Ether using the `splitEther` function.
- Withdraw refunds using `withdrawRefund`.
- View recipients with `getRecipients` and balance with `getContractBalance`.

## Front-End
1. Navigate to `app/`: `cd app`
2. Install dependencies: `npm install`
3. Start the app: `npm start`
4. Connect MetaMask and interact with the contract.

## Preview
- [Splitter contract screenshot](preview/splitter_screenshot.png)
- [Splitter demo video](preview/splitter_demo.gif)

## Download
- [Project Zip](https://github.com/Aksh1712/ether-splitter/releases)