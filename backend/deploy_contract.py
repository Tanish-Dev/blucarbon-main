"""
Deploy MRVRegistry Smart Contract to Polygon
"""
import os
import json
from web3 import Web3
from solcx import compile_standard, install_solc
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Install solc if needed
install_solc('0.8.19')

def compile_contract():
    """Compile the MRVRegistry contract"""
    print("📝 Compiling MRVRegistry contract...")
    
    with open('blockchain/MRVRegistry.sol', 'r') as file:
        contract_source = file.read()
    
    compiled_sol = compile_standard(
        {
            "language": "Solidity",
            "sources": {
                "MRVRegistry.sol": {
                    "content": contract_source
                }
            },
            "settings": {
                "outputSelection": {
                    "*": {
                        "*": ["abi", "metadata", "evm.bytecode", "evm.sourceMap"]
                    }
                }
            }
        },
        solc_version="0.8.19"
    )
    
    print("✅ Contract compiled successfully!")
    return compiled_sol

def deploy_contract():
    """Deploy the contract to Polygon"""
    
    # Compile contract
    compiled_sol = compile_contract()
    
    # Get contract data
    contract_interface = compiled_sol['contracts']['MRVRegistry.sol']['MRVRegistry']
    bytecode = contract_interface['evm']['bytecode']['object']
    abi = contract_interface['abi']
    
    # Save ABI
    os.makedirs('blockchain/abi', exist_ok=True)
    with open('blockchain/abi/MRVRegistry.json', 'w') as f:
        json.dump(abi, f, indent=2)
    print("✅ ABI saved to blockchain/abi/MRVRegistry.json")
    
    # Connect to Polygon
    rpc_url = os.getenv('POLYGON_RPC_URL', 'https://rpc-amoy.polygon.technology/')
    w3 = Web3(Web3.HTTPProvider(rpc_url))
    
    if not w3.is_connected():
        print("❌ Failed to connect to Polygon network")
        return
    
    print(f"✅ Connected to Polygon (Chain ID: {w3.eth.chain_id})")
    
    # Set up account
    private_key = os.getenv('PRIVATE_KEY')
    if not private_key:
        print("❌ PRIVATE_KEY not set in .env file")
        return
    
    # Remove 0x prefix if present
    if private_key.startswith('0x'):
        private_key = private_key[2:]
    
    account = w3.eth.account.from_key(private_key)
    print(f"📍 Deploying from: {account.address}")
    
    # Check balance
    balance = w3.eth.get_balance(account.address)
    balance_matic = w3.from_wei(balance, 'ether')
    print(f"💰 Balance: {balance_matic} MATIC")
    
    if balance == 0:
        print("❌ Insufficient balance. Get testnet MATIC from https://faucet.polygon.technology/")
        return
    
    # Create contract instance
    MRVRegistry = w3.eth.contract(abi=abi, bytecode=bytecode)
    
    # Build deployment transaction
    print("🚀 Building deployment transaction...")
    nonce = w3.eth.get_transaction_count(account.address)
    
    transaction = MRVRegistry.constructor().build_transaction({
        'from': account.address,
        'nonce': nonce,
        'gas': 2000000,
        'gasPrice': w3.eth.gas_price,
        'chainId': w3.eth.chain_id
    })
    
    # Sign and send transaction
    print("✍️  Signing transaction...")
    signed_txn = w3.eth.account.sign_transaction(transaction, private_key)
    
    print("📤 Sending transaction...")
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    print(f"Transaction hash: {tx_hash.hex()}")
    
    # Wait for confirmation
    print("⏳ Waiting for confirmation...")
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=300)
    
    if tx_receipt.status == 1:
        contract_address = tx_receipt.contractAddress
        print("\n" + "="*60)
        print("🎉 Contract deployed successfully!")
        print("="*60)
        print(f"Contract Address: {contract_address}")
        print(f"Transaction Hash: {tx_receipt.transactionHash.hex()}")
        print(f"Block Number: {tx_receipt.blockNumber}")
        print(f"Gas Used: {tx_receipt.gasUsed}")
        print(f"\n📝 Add this to your .env file:")
        print(f'MRV_REGISTRY_ADDRESS="{contract_address}"')
        
        # Determine network name
        if w3.eth.chain_id == 80002:
            explorer = "https://amoy.polygonscan.com"
        elif w3.eth.chain_id == 137:
            explorer = "https://polygonscan.com"
        else:
            explorer = f"https://polygonscan.com"
        
        print(f"\n🔍 View on Explorer:")
        print(f"{explorer}/address/{contract_address}")
        print("="*60)
        
        # Update .env file
        update_env_file(contract_address)
        
    else:
        print("❌ Deployment failed!")
        print(f"Transaction receipt: {tx_receipt}")

def update_env_file(contract_address):
    """Update .env file with contract address"""
    env_path = '.env'
    
    try:
        with open(env_path, 'r') as f:
            lines = f.readlines()
        
        # Check if MRV_REGISTRY_ADDRESS already exists
        address_exists = False
        for i, line in enumerate(lines):
            if line.startswith('MRV_REGISTRY_ADDRESS='):
                lines[i] = f'MRV_REGISTRY_ADDRESS="{contract_address}"\n'
                address_exists = True
                break
        
        if not address_exists:
            # Add to end of file
            lines.append(f'\n# MRV Registry Contract\nMRV_REGISTRY_ADDRESS="{contract_address}"\n')
        
        with open(env_path, 'w') as f:
            f.writelines(lines)
        
        print(f"✅ Updated {env_path} with contract address")
    except Exception as e:
        print(f"⚠️  Could not update .env file: {e}")
        print(f"   Please manually add: MRV_REGISTRY_ADDRESS=\"{contract_address}\"")

if __name__ == "__main__":
    print("\n" + "="*60)
    print("MRVRegistry Contract Deployment")
    print("="*60 + "\n")
    
    deploy_contract()
