# Ether Splitter Contract

A Solidity smart contract that automatically splits incoming Ether between three fixed addresses in equal proportions (33.33% each).

## Features

- **Automatic Splitting**: Ether sent to the contract is automatically split between three recipients
- **Equal Distribution**: Each recipient gets exactly 1/3 of the incoming Ether
- **Remainder Handling**: Any wei remainder goes to the first recipient
- **Gas Efficient**: Uses immutable variables and optimized gas usage
- **Emergency Functions**: Owner can withdraw funds in emergency situations
- **Event Logging**: All transactions are logged with events
- **Manual Trigger**: Manual split function available if needed

## Contract Architecture

### State Variables
- `recipient1`, `recipient2`, `recipient3`: Immutable recipient addresses
- `totalReceived`: Total Ether received by the contract
- `totalSplit`: Total Ether that has been split and distributed
- `owner`: Contract deployer (for emergency functions)

### Key Functions
- `receive()`: Automatically splits incoming Ether
- `manualSplit()`: Manually trigger the splitting mechanism
- `emergencyWithdraw()`: Owner-only emergency withdrawal
- `getBalance()`: View current contract balance
- `getRecipients()`: View recipient addresses

## Setup and Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ether-splitter-contract
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` file with your configuration:
- Add your private key (without 0x prefix)
- Add RPC URLs for different networks
- Add Etherscan API key for verification
- Update recipient addresses in `scripts/deploy.js`

## Configuration

Before deploying, update the recipient addresses in `scripts/deploy.js`:

```javascript
const RECIPIENT_1 = "0x1234..."; // Replace with actual address
const RECIPIENT_2 = "0x2345..."; // Replace with actual address  
const RECIPIENT_3 = "0x3456..."; // Replace with actual address
```

## Deployment

### Local Development

1. Start a local Hardhat node:
```bash
npm run node
```

2. Deploy to local network:
```bash
npm run deploy:localhost
```

### Testnet Deployment (Sepolia)

```bash
npm run deploy:sepolia
```

### Mainnet Deployment

⚠️ **Warning**: Ensure you have sufficient ETH for gas fees and have thoroughly tested on testnets.

```bash
npm run deploy:mainnet
```

## Testing

Run the comprehensive test suite:

```bash
npm test
```

The tests cover:
- Contract deployment and initialization
- Automatic Ether splitting functionality
- Remainder handling
- Event emissions
- Emergency withdrawal mechanisms
- Access control

## Usage

### Sending Ether to the Contract

Once deployed, simply send Ether to the contract address using any method:

1. **From a wallet**: Send ETH to the contract address
2. **From another contract**: Transfer ETH to the contract
3. **Via web3/ethers.js**:

```javascript
// Example using ethers.js
await signer.sendTransaction({
  to: contractAddress,
  value: ethers.parseEther("1.0") // Send 1 ETH
});
```

### Monitoring

You can monitor contract activity by:
- Checking recipient balances
- Viewing contract events on Etherscan
- Calling view functions:

```javascript
const balance = await contract.getBalance();
const totalReceived = await contract.totalReceived();
const recipients = await contract.getRecipients();
```

## Smart Contract Details

### Gas Optimization
- Uses `immutable` variables for recipients (saves gas on reads)
- Efficient splitting algorithm
- Minimal storage usage

### Security Features
- Input validation (no zero addresses)
- Access control for emergency functions
- Reentrancy protection through careful design
- Custom errors for gas-efficient reverts

### Events
- `EtherReceived(address indexed sender, uint256 amount)`
- `EtherSplit(address indexed recipient1, address indexed recipient2, address indexed recipient3, uint256 amount1, uint256 amount2, uint256 amount3)`
- `EmergencyWithdraw(address indexed owner, uint256 amount)`

## Verification

After deployment to a public network, verify the contract:

```bash
npx hardhat verify --network <network> <contract-address> "<recipient1>" "<recipient2>" "<recipient3>"
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Security Considerations

- The contract automatically splits all incoming Ether immediately
- No funds should remain in the contract under normal operation
- Emergency withdrawal is available for the contract owner
- Recipient addresses are immutable once deployed
- Always test on testnets before mainnet deployment

## Support

If you encounter any issues or have questions:
1. Check the test files for usage examples
2. Review the contract comments and documentation
3. Open an issue on GitHub

## Disclaimer

This smart contract is provided as-is. Always perform thorough testing and security audits before deploying to mainnet with significant funds.