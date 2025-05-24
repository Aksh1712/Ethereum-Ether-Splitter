const hre = require("hardhat");

async function main() {
  // Get the network name
  const networkName = hre.network.name;
  console.log("Deploying to network:", networkName);

  // Replace these addresses with your actual recipient addresses
  const RECIPIENT_1 = "0x1234567890123456789012345678901234567890"; // Replace with actual address
  const RECIPIENT_2 = "0x2345678901234567890123456789012345678901"; // Replace with actual address  
  const RECIPIENT_3 = "0x3456789012345678901234567890123456789012"; // Replace with actual address

  console.log("Recipient addresses:");
  console.log("Recipient 1:", RECIPIENT_1);
  console.log("Recipient 2:", RECIPIENT_2);
  console.log("Recipient 3:", RECIPIENT_3);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy the contract
  const EtherSplitter = await hre.ethers.getContractFactory("EtherSplitter");
  const etherSplitter = await EtherSplitter.deploy(RECIPIENT_1, RECIPIENT_2, RECIPIENT_3);

  await etherSplitter.waitForDeployment();

  const contractAddress = await etherSplitter.getAddress();
  console.log("EtherSplitter deployed to:", contractAddress);
  console.log("Contract owner:", await etherSplitter.owner());

  // Verify the recipients are set correctly
  const recipients = await etherSplitter.getRecipients();
  console.log("Verified recipients:");
  console.log("Recipient 1:", recipients[0]);
  console.log("Recipient 2:", recipients[1]);
  console.log("Recipient 3:", recipients[2]);

  // Save deployment info
  const deploymentInfo = {
    network: networkName,
    contractAddress: contractAddress,
    deployer: deployer.address,
    recipients: {
      recipient1: recipients[0],
      recipient2: recipients[1],
      recipient3: recipients[2]
    },
    deployedAt: new Date().toISOString()
  };

  console.log("\n=== Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // If on a testnet or mainnet, provide verification command
  if (networkName !== "hardhat" && networkName !== "localhost") {
    console.log("\nTo verify the contract, run:");
    console.log(`npx hardhat verify --network ${networkName} ${contractAddress} "${RECIPIENT_1}" "${RECIPIENT_2}" "${RECIPIENT_3}"`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });