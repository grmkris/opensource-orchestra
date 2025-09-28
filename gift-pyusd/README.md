# GiftPYUSD - SBT (Soulbound Token) with PYUSD Payment

A Solidity smart contract that implements a non-transferable Soulbound Token (SBT) that can be minted by paying with PYUSD (PayPal USD) stablecoin.

## Overview

This project demonstrates a **Soulbound Token (SBT)** implementation where:
- Users can mint SBTs by paying with PYUSD tokens
- Once minted, SBTs are **non-transferable** and **non-approvable**
- Artists can withdraw their own accumulated PYUSD balances (artist wallet only)
- Built on Ethereum-compatible networks using Solidity

## Features

- **PYUSD Gift**: Mint SBTs by gifting PYUSD tokens (minimum `minGiftAmount`, no upper bound)
- **Non-Transferable**: All transfer and approval functions are disabled
- **Artist Withdrawal**: Registered artist payout wallet can withdraw its accumulated PYUSD
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

# ARTIST_PRIVATE_KEY=0x...  # Optional if payout wallet differs from deployer

# GiftPYUSDMulti
GIFT_PYUSD_MULTI=0x...
```

The repository keeps reusable artist metadata under `config/artists.json`:

```json
{
  "artists": [
    {
      "wallet": "0x...",
      "name": "Alice",
      "image": "https://example.com/alice.png"
    }
  ]
}
```
- **`wallet`**: Payout address and the unique key for the artist on-chain.
- **`name` / `image`**: Metadata stored in the contract.

Add new artists by appending additional objects to the array. Registration uses the wallet address as the key.

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
2. Deploy to Sepolia (minGiftAmount is passed via CLI; adjust flags if you do not need verification):
   ```bash
   # PYUSD from .env, minGiftAmount via CLI (1.0 PYUSD = 1_000_000 since PYUSD has 6 decimals)
   forge script script/Deploy.s.sol:Deploy \
     --sig "run(uint256)" \
     1000000 \
     --rpc-url $SEPOLIA_RPC_URL \
     --private-key $PRIVATE_KEY \
     --broadcast \
     --verify
   ```
3. After deployment, copy the resulting contract address into `GIFT_PYUSD` inside `.env`. If you re-deploy, remember to sync `config/artists.json` and re-register artists.
   ```bash
   set -a; source .env; set +a
   ```

### Register Artists

With the contract deployed, you can register artist metadata for any wallet present in `config/artists.json`.

- Registration is permissionless: anyone can call `registerArtist` for a new wallet.
- The on-chain unique key is the `wallet` address; duplicates will revert.

Run the registration script with broadcasting credentials:

```bash
ARTIST_WALLET=0x... forge script script/RegisterArtist.s.sol:RegisterArtist \
  --rpc-url $SEPOLIA_RPC_URL \
  --broadcast \
  --private-key $PRIVATE_KEY
```

Forge saves each run under `broadcast/RegisterArtist.s.sol/11155111/`. Review the generated transaction hash to verify success.

4. Validate the on-chain record (optional but recommended):

```bash
cast call $GIFT_PYUSD "artists(address)(address,string,string,bool)" $ARTIST_WALLET --rpc-url $SEPOLIA_RPC_URL
```

If the call returns the configured wallet, metadata, and `true`, the artist is registered.

#### Update an existing artist

If metadata needs to change for an existing artist (by wallet), call `updateArtist` from that artist's payout wallet (artist wallet only). Empty strings keep current values:

```bash
cast send $GIFT_PYUSD "updateArtist(address,string,string)" \
  $ARTIST_WALLET \
  "Alice" \
  "https://example.com/alice.png" \
  --private-key $PRIVATE_KEY \
  --rpc-url $SEPOLIA_RPC_URL
```


#### Gift PYUSD to artist and Mint SBT

1. Pick a gift amount in PYUSD (must be greater than or equal to the on-chain `minGiftAmount`). Example: 1.0 PYUSD = `1_000_000` (PYUSD has 6 decimals).
2. Approve the contract to pull that amount:
   ```bash
   cast send $PYUSD "approve(address,uint256)" \
     $GIFT_PYUSD \
     1000000 \
     --private-key $PRIVATE_KEY \
     --rpc-url $SEPOLIA_RPC_URL
   ```
3. Mint the SBT for a registered artist by sending the gift value:
   ```bash
   cast send $GIFT_PYUSD "mint(address,uint256)" \
     $ARTIST_WALLET \
     1000000 \
     --private-key $PRIVATE_KEY \
     --rpc-url $SEPOLIA_RPC_URL
   ```
4. Verify the mint and gift were recorded (see the "On-chain verification" section below for sample commands).

### GiftPYUSDMulti (allocate gifts to multiple artists + mint one SBT)

Allocate a total PYUSD amount across multiple registered artists in one transaction and mint a single receipt SBT. The script accepts CLI arguments directly (no JSON config needed).

Prerequisites:
- `GIFT_PYUSD` is deployed and artists are registered.
- `GIFT_PYUSD_MULTI` is deployed (see below) and exported in your `.env`.
- Use 6 decimals for PYUSD values.

1) Deploy the GiftPYUSDMulti contract (minTotalAmount is passed via CLI; 1.0 PYUSD = 1_000_000):
```bash
forge script script/DeployGiftPYUSDMulti.s.sol:DeployGiftPYUSDMulti \
  --sig "run(uint256)" \
  1000000 \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify
```
Set the address in `.env`:
```bash
GIFT_PYUSD_MULTI=0x...
```
Set the environment variables in the `.env` file.
```bash
set -a; source .env; set +a
```
   

2) Approve total PYUSD to GiftPYUSD (example: 1.0 PYUSD = 1_000_000):
```bash
cast send $PYUSD "approve(address,uint256)" \
  $GIFT_PYUSD \
  1000000 \
  --private-key $PRIVATE_KEY \
  --rpc-url $SEPOLIA_RPC_URL
```

3) Run the multi-gift script with CLI args:
```bash
forge script script/MintGiftPYUSDMulti.s.sol:MintGiftPYUSDMulti \
  --sig "run(address[],uint256,string)" \
  "[$ARTIST_WALLET,$ANOTHER_ARTIST_WALLET]" 1000000 "Alice & Bob Gift" \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```
This will:
- Compute equal split amounts from `TOTAL` across `wallets` (remainder distributed from the first artist).
- Call `GiftPYUSD.allocateGift(wallets, amounts)` once to allocate balances.
- Mint one `GiftPYUSDMulti` to the caller with the full split.

5) Verify on-chain state:
```bash
# Check per-artist balances on GiftPYUSD
cast call $GIFT_PYUSD "artistBalance(address)(uint256)" $ARTIST_WALLET --rpc-url $SEPOLIA_RPC_URL
cast call $GIFT_PYUSD "artistBalance(address)(uint256)" $ANOTHER_ARTIST_WALLET --rpc-url $SEPOLIA_RPC_URL

# Inspect the receipt NFT data (tokenId = 1)
cast call $GIFT_PYUSD_MULTI "getGift(uint256)(address[],uint256[],uint256,string)" 1 --rpc-url $SEPOLIA_RPC_URL
```

Notes:
- PYUSD uses 6 decimals. Make sure `TOTAL` matches your intent (e.g., `1_000_000` = 1.0 PYUSD).
- The default `run()` entrypoint now reverts; always use `--sig` with the typed `run(address[],uint256,string)`.

### Withdraw Artist Balance

1. Check the pending balance for the artist:
```bash
cast call $GIFT_PYUSD "artistBalance(address)(uint256)" $ARTIST_WALLET --rpc-url $SEPOLIA_RPC_URL
```
2. From the registered payout wallet, withdraw the desired PYUSD amount. If the payout wallet is different from the deployer, export `ARTIST_PRIVATE_KEY` first.
```bash
cast send $GIFT_PYUSD "withdrawForArtist(address,uint256)" \
  $ARTIST_WALLET \
  2000000 \
  --private-key ${ARTIST_PRIVATE_KEY:-$PRIVATE_KEY} \
  --rpc-url $SEPOLIA_RPC_URL
```
3. Optionally confirm balances after withdrawal:
```bash
cast call $GIFT_PYUSD "artistBalance(address)(uint256)" $ARTIST_WALLET --rpc-url $SEPOLIA_RPC_URL
cast call $GIFT_PYUSD "contractPYUSDBalance()(uint256)" --rpc-url $SEPOLIA_RPC_URL
```

## Contract Interface

### Constructor
```solidity
constructor(address _mintToken, uint256 _minGiftAmount)
```
- `_mintToken`: Address of the PYUSD token contract
- `_minGiftAmount`: Minimum PYUSD gift required to mint one SBT

### Functions

#### Public Functions
- `mint(address wallet, uint256 amount)`: Mint a new SBT by gifting `amount` PYUSD to `wallet` (reverts if `amount < minGiftAmount`)
- `totalIssued()`: Returns the total number of SBTs issued
- `contractPYUSDBalance()`: Returns current PYUSD balance of the contract
 - `tokenAmounts(uint256 tokenId)`: Returns the gift amount associated with a minted token
- `artistBalance(address wallet)`: Returns the accumulated PYUSD balance available for an artist to withdraw
 - `registerArtist(address wallet, string name, string imageURI)`: Permissionless registration for a new artist. Reverts if `wallet` already exists or `wallet` is zero.
 - `updateArtist(address wallet, string name, string imageURI)`: Only callable by the artist wallet (must equal `wallet`). Reverts with `UNAUTHORIZED` otherwise. Empty strings keep current values.

#### Withdrawal
- `withdrawForArtist(address wallet, uint256 amount)`: Withdraw PYUSD to the registered payout wallet for the specified artist. Only callable by that artist's payout wallet.

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
