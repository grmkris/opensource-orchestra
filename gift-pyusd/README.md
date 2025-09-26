# GiftPYUSD - SBT (Soulbound Token) with PYUSD Payment

A Solidity smart contract that implements a non-transferable Soulbound Token (SBT) that can be minted by paying with PYUSD (PayPal USD) stablecoin.

## Overview

This project demonstrates a **Soulbound Token (SBT)** implementation where:
- Users can mint SBTs by paying with PYUSD tokens
- Once minted, SBTs are **non-transferable** and **non-approvable**
- Only the contract owner can withdraw accumulated PYUSD funds
- Built on Ethereum-compatible networks using Solidity

### What is SBT?
Soulbound Tokens are non-transferable NFTs that represent identity, credentials, or achievements that cannot be sold or transferred between users.

## Features

- **PYUSD Payment**: Mint SBTs by paying with PYUSD stablecoin
- **Non-Transferable**: All transfer and approval functions are disabled
- **Owner Withdrawal**: Contract owner can withdraw accumulated PYUSD
- **Token Metadata**: Basic ERC-721 interface with custom tokenURI support
- **Comprehensive Testing**: Full test coverage including SBT behavior verification

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd gift-pyusd

# Install dependencies
forge install
```

## Usage

### Build Contracts

```bash
forge build
```

### Run Tests

```bash
forge test
```

### Deploy Contract

1. Set up your environment variables in `.env`:
```env
SEPOLIA_RPC_URL=your_sepolia_rpc_url
ETHERSCAN_API_KEY=your_etherscan_api_key
PRIVATE_KEY=your_private_key
```

2. Deploy to Sepolia testnet:
```bash
forge script script/Deploy.s.sol:Deploy --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify
```

### Mint SBT

1. Approve PYUSD spending for the contract:
```solidity
pyusd.approve(contractAddress, mintPrice);
```

2. Mint your SBT:
```solidity
giftPYUSD.mint();
```

## Contract Interface

### Constructor
```solidity
constructor(address _mintToken, uint256 _mintPrice)
```
- `_mintToken`: Address of the PYUSD token contract
- `_mintPrice`: Amount of PYUSD required to mint one SBT

### Functions

#### Public Functions
- `mint()`: Mint a new SBT by paying with PYUSD
- `totalIssued()`: Returns the total number of SBTs issued
- `contractPYUSDBalance()`: Returns current PYUSD balance of the contract

#### Owner Functions
- `withdraw(address to, uint256 amount)`: Withdraw PYUSD to specified address

#### ERC-721 Functions (Disabled for SBT)
All transfer and approval functions revert with `TRANSFERS_DISABLED()`:
- `approve(address, uint256)`
- `setApprovalForAll(address, bool)`
- `transferFrom(address, address, uint256)`
- `safeTransferFrom(address, address, uint256)`
- `safeTransferFrom(address, address, uint256, bytes)`

## Development

### Testing

Run the full test suite:
```bash
forge test -vvv
```

Test coverage includes:
- Basic contract creation
- PYUSD payment and SBT minting
- Owner withdrawal functionality
- SBT non-transferability verification
- Access control validation

### Code Quality

```bash
# Format code
forge fmt

# Check for gas inefficiencies
forge snapshot
```

## Foundry Documentation

This project uses [Foundry](https://book.getfoundry.sh/) for development, testing, and deployment.

### Foundry Tools

- **Forge**: Testing framework and contract compiler
- **Cast**: CLI tool for interacting with smart contracts
- **Anvil**: Local Ethereum node for development

### Additional Commands

```bash
# Start local node
anvil

# Get help
forge --help
cast --help
anvil --help
```

## Security Considerations

- SBTs are permanently bound to the original minter
- No way to transfer or approve SBTs after minting
- Owner has full control over PYUSD withdrawals
- Consider implementing time-locks or multi-sig for production use

## License

MIT
