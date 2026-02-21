---
description: How to deploy BluCarbon smart contracts to Polygon testnet
---

# Deploy Smart Contracts to Polygon Testnet

## Prerequisites

1. **MetaMask wallet** with a private key
2. **Test MATIC tokens** for gas fees

## Step 1: Get a Wallet & Test MATIC

1. Install MetaMask: https://metamask.io/
2. Create/import a wallet
3. **For Polygon Amoy Testnet** (Chain ID 80002):
   - Get test MATIC from: https://faucet.polygon.technology/
   - Select "Amoy" network, paste your wallet address
4. Export your **private key** from MetaMask:
   - Click the 3 dots → Account Details → Show Private Key
   - Copy it (WITHOUT the `0x` prefix)

## Step 2: Configure .env

Open `backend/.env` and fill in:

```
PRIVATE_KEY="your-64-character-hex-private-key-here"
```

The `POLYGON_RPC_URL` is already set to your QuickNode endpoint.

## Step 3: Install Dependencies & Compile

```bash
cd backend/blockchain
npm install
npm run compile
```

This compiles all 3 contracts:
- `MRVRegistry.sol` — stores MRV report hashes on-chain
- `ProjectRegistry.sol` — registers carbon projects
- `CarbonCreditNFT.sol` — ERC-721 carbon credit NFTs

## Step 4: Deploy to Polygon Amoy Testnet

// turbo
```bash
cd backend/blockchain
npm run deploy:amoy
```

The script will output deployed contract addresses. Copy them.

## Step 5: Update .env with Contract Addresses

Paste the addresses from the deploy output into `backend/.env`:

```
MRV_REGISTRY_ADDRESS="0x..."
PROJECT_REGISTRY_ADDRESS="0x..."
CARBON_CREDIT_NFT_ADDRESS="0x..."
```

## Step 6: Extract ABIs for Python Backend

// turbo
```bash
cd backend/blockchain
npm run copy-abi
```

This copies the compiled ABIs to `blockchain/abi/` where the Python backend expects them.

## Step 7: Restart Backend

```bash
# Kill and restart the uvicorn server
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

## Step 8: Verify it Works

The backend logs should show:
```
✅ Connected to Polygon network via QuickNode
✅ Account initialized: 0x...
✅ MRV Registry contract initialized at 0x...
✅ Project Registry contract initialized at 0x...
✅ Carbon Credit NFT contract initialized at 0x...
```

Now when you click "Publish & Hash" in dMRV Studio, the MRV hash will be stored on the real Polygon blockchain with a transaction hash and PolygonScan link.

## Troubleshooting

- **"Insufficient funds"**: Get more test MATIC from the faucet
- **"Nonce too low"**: Reset MetaMask account (Settings → Advanced → Reset Account)
- **Contract not found**: Double-check the addresses in `.env`
- **ABI not found**: Run `npm run copy-abi` again
