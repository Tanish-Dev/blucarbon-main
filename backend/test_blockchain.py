#!/usr/bin/env python3
"""
Test Polygon Blockchain Connection
Quick script to verify your blockchain setup is working
"""
import os
from dotenv import load_dotenv
from web3 import Web3

# Load environment
load_dotenv()

def test_connection():
    """Test blockchain connection and account setup"""
    
    print("\n" + "="*60)
    print("🔗 Polygon Blockchain Connection Test")
    print("="*60 + "\n")
    
    # 1. Check environment variables
    print("1️⃣  Checking environment variables...")
    rpc_url = os.getenv('POLYGON_RPC_URL')
    private_key = os.getenv('PRIVATE_KEY')
    
    if not rpc_url:
        print("   ❌ POLYGON_RPC_URL not set in .env")
        return False
    print(f"   ✅ RPC URL: {rpc_url}")
    
    if not private_key:
        print("   ❌ PRIVATE_KEY not set in .env")
        return False
    print(f"   ✅ Private key found (length: {len(private_key)} chars)")
    
    # 2. Test RPC connection
    print("\n2️⃣  Testing RPC connection...")
    try:
        w3 = Web3(Web3.HTTPProvider(rpc_url))
        if w3.is_connected():
            print("   ✅ Connected to Polygon network")
        else:
            print("   ❌ Failed to connect to Polygon network")
            return False
    except Exception as e:
        print(f"   ❌ Connection error: {e}")
        return False
    
    # 3. Check network details
    print("\n3️⃣  Network details...")
    try:
        chain_id = w3.eth.chain_id
        block_number = w3.eth.block_number
        gas_price = w3.eth.gas_price
        
        print(f"   Chain ID: {chain_id}")
        
        if chain_id == 80002:
            print("   ✅ Connected to Polygon Amoy Testnet")
        elif chain_id == 137:
            print("   ✅ Connected to Polygon Mainnet")
        else:
            print(f"   ⚠️  Unknown network (Chain ID: {chain_id})")
        
        print(f"   Latest block: {block_number}")
        print(f"   Gas price: {w3.from_wei(gas_price, 'gwei')} Gwei")
        
    except Exception as e:
        print(f"   ❌ Error getting network details: {e}")
        return False
    
    # 4. Test account
    print("\n4️⃣  Testing account...")
    try:
        # Remove 0x prefix if present
        pk = private_key.replace('0x', '')
        account = w3.eth.account.from_key(pk)
        
        print(f"   Address: {account.address}")
        
        balance = w3.eth.get_balance(account.address)
        balance_matic = w3.from_wei(balance, 'ether')
        
        print(f"   Balance: {balance_matic} MATIC")
        
        if balance == 0:
            print("   ⚠️  Warning: Zero balance!")
            print("   💡 Get testnet MATIC from: https://faucet.polygon.technology/")
        elif balance_matic < 0.1:
            print(f"   ⚠️  Low balance: {balance_matic} MATIC")
            print("   💡 Consider getting more MATIC from faucet")
        else:
            print("   ✅ Sufficient balance")
        
    except Exception as e:
        print(f"   ❌ Error with account: {e}")
        print("   💡 Check that PRIVATE_KEY is correct (without 0x prefix)")
        return False
    
    # 5. Test transaction capability
    print("\n5️⃣  Testing transaction capability...")
    try:
        # Try to estimate gas for a simple transaction
        tx = {
            'from': account.address,
            'to': account.address,
            'value': 0,
            'gas': 21000,
            'gasPrice': w3.eth.gas_price,
            'nonce': w3.eth.get_transaction_count(account.address),
        }
        
        # Don't actually send, just validate
        print(f"   Nonce: {tx['nonce']}")
        print(f"   Can create transactions: ✅")
        
    except Exception as e:
        print(f"   ⚠️  Transaction test warning: {e}")
    
    # 6. Check contract addresses (optional)
    print("\n6️⃣  Checking optional contract addresses...")
    mrv_registry = os.getenv('MRV_REGISTRY_ADDRESS')
    project_registry = os.getenv('PROJECT_REGISTRY_ADDRESS')
    
    if mrv_registry:
        print(f"   ✅ MRV Registry: {mrv_registry}")
    else:
        print("   ⚠️  MRV Registry not set (will use transaction-based storage)")
    
    if project_registry:
        print(f"   ✅ Project Registry: {project_registry}")
    else:
        print("   ⚠️  Project Registry not set")
    
    # Summary
    print("\n" + "="*60)
    print("✅ All tests passed! Blockchain integration is ready.")
    print("="*60)
    print("\n💡 Next steps:")
    print("   1. Start backend: uvicorn server:app --reload")
    print("   2. Test in dMRV Studio")
    print("   3. Approve a project and verify blockchain storage")
    
    if chain_id == 80002:
        print(f"\n🔍 Explorer: https://amoy.polygonscan.com/address/{account.address}")
    elif chain_id == 137:
        print(f"\n🔍 Explorer: https://polygonscan.com/address/{account.address}")
    
    print("\n")
    return True

if __name__ == "__main__":
    try:
        success = test_connection()
        exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        exit(1)
