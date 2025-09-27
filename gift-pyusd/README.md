# GiftPYUSD - SBT (Soulbound Token) with PYUSD Payment

A Solidity smart contract that implements a non-transferable Soulbound Token (SBT) that can be minted by paying with PYUSD (PayPal USD) stablecoin.

## Overview

This project demonstrates a **Soulbound Token (SBT)** implementation where:
- Users can mint SBTs by paying with PYUSD tokens
- Once minted, SBTs are **non-transferable** and **non-approvable**
- Only the contract owner can withdraw accumulated PYUSD funds
- Built on Ethereum-compatible networks using Solidity

## Features

- **PYUSD Donation**: Mint SBTs by donating PYUSD tokens (minimum `mintPrice`, no upper bound)
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

### Environment Setup

Create a `.env` file that mirrors `.env.example` and populate the values for your environment:

```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/<alchemy-api-key>
ETHERSCAN_API_KEY=<etherscan-api-key>
PRIVATE_KEY=0x...
PYUSD=0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9
GIFT_PYUSD=0x...
ARTIST_ID=1
```

The repository keeps reusable artist metadata under `config/artists.json`:

```json
{
  "artists": [
    {
      "artistId": 1,
      "wallet": "0x...",
      "name": "Alice",
      "image": "https://example.com/alice.png"
    }
  ]
}
```

- **`artistId`**: Numeric identifier consumed on-chain.
- **`wallet`**: Payout address for withdrawals.
- **`name` / `image`**: Metadata stored in the contract.

Add new artists by appending additional objects to the array and bumping `ARTIST_ID` to the matching value before running the registration script.

### Build Contracts

```bash
forge build
```

### Run Tests

```bash
forge test
```

### Deploy Contract

1. Populate `.env` with RPC URL, private key, and other required variables.
2. Deploy to Sepolia (adjust flags if you do not need verification):
   ```bash
   forge script script/Deploy.s.sol:Deploy \
     --rpc-url $SEPOLIA_RPC_URL \
     --private-key $PRIVATE_KEY \
     --broadcast \
     --verify
   ```
3. After deployment, copy the resulting contract address into `GIFT_PYUSD` inside `.env`. If you re-deploy, remember to sync `config/artists.json` and re-register artists.

### Register Artists

With the contract deployed, register artist metadata for any `artistId` present in `config/artists.json`:

1. Confirm the contract owner wallet matches the `PRIVATE_KEY` you configured.
2. Set `ARTIST_ID` in `.env` (or inline) to the target numeric ID.
3. Run the registration script with broadcasting credentials:

```bash
ARTIST_ID=1 forge script script/RegisterArtist.s.sol:RegisterArtist \
  --rpc-url $SEPOLIA_RPC_URL \
  --broadcast \
  --private-key $PRIVATE_KEY
```

Forge saves each run under `broadcast/RegisterArtist.s.sol/11155111/`. Review the generated transaction hash to verify success.

4. Validate the on-chain record (optional but recommended):

```bash
cast call $GIFT_PYUSD "artists(uint256)(address,string,string,bool)" 1 --rpc-url $SEPOLIA_RPC_URL
```

If the call returns the configured wallet, metadata, and `true`, the artist is registered.

#### Update an existing artist

If metadata needs to change for an existing `artistId`, use the `updateArtist` function from the owner account. Empty strings keep current values:

```bash
cast send $GIFT_PYUSD "updateArtist(uint256,address,string,string)" \
  1 \
  0x08D811A358850892029251CcC8a565a32fd2dCB8 \
  "Alice" \
  "https://example.com/alice.png" \
  --private-key $PRIVATE_KEY \
  --rpc-url $SEPOLIA_RPC_URL
```

#### On-chain verification shortcuts

Use `cast call` to audit contract state after deployments, registrations, or mints. Examples:

```bash
cast call $GIFT_PYUSD "artists(uint256)(address,string,string,bool)" 1 --rpc-url $SEPOLIA_RPC_URL
cast call $GIFT_PYUSD "tokenAmounts(uint256)(uint256)" 1 --rpc-url $SEPOLIA_RPC_URL
cast call $GIFT_PYUSD "totalIssued()(uint256)" --rpc-url $SEPOLIA_RPC_URL
```

Store frequently used helper commands in a shell script or task runner if you expect many updates.

#### Clean up broadcast artifacts

`forge` stores broadcast metadata in `broadcast/`. When the logs become noisy, you can archive or remove older runs:

```bash
rm -rf broadcast/RegisterArtist.s.sol/11155111/run-*.json
```

Avoid deleting `cache/` unless you intend to invalidate stored simulation traces.

### Mint SBT

1. Pick a donation amount in PYUSD (must be greater than or equal to the on-chain `mintPrice`). Example: `DONATION=1000000` equals 1.0 PYUSD because the token has 6 decimals.
2. Approve the contract to pull that amount:
   ```bash
   cast send $PYUSD "approve(address,uint256)" \
     $GIFT_PYUSD \
     $DONATION \
     --private-key $PRIVATE_KEY \
     --rpc-url $SEPOLIA_RPC_URL
   ```
3. Mint the SBT for a registered artist by sending the donation value:
   ```bash
   cast send $GIFT_PYUSD "mint(uint256,uint256)" \
     1 \
     $DONATION \
     --private-key $PRIVATE_KEY \
     --rpc-url $SEPOLIA_RPC_URL
   ```
4. Verify the mint and donation were recorded (see the "On-chain verification" section below for sample commands).

## Contract Interface

### Constructor
```solidity
constructor(address _mintToken, uint256 _mintPrice)
```
- `_mintToken`: Address of the PYUSD token contract
- `_mintPrice`: Minimum PYUSD donation required to mint one SBT

### Functions

#### Public Functions
- `mint(uint256 artistId, uint256 amount)`: Mint a new SBT by donating `amount` PYUSD to `artistId` (reverts if `amount < mintPrice`)
- `totalIssued()`: Returns the total number of SBTs issued
- `contractPYUSDBalance()`: Returns current PYUSD balance of the contract
- `tokenAmounts(uint256 tokenId)`: Returns the donation amount associated with a minted token
- `artistBalance(uint256 artistId)`: Returns the accumulated PYUSD balance available for an artist to withdraw

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
