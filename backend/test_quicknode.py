#!/usr/bin/env python3
"""
Test QuickNode Polygon connection
Run this to verify your QuickNode setup is working correctly
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from web3 import Web3
import time

# Load environment variables
env_path = Path(__file__).parent / '.env'
load_dotenv(env_path)

def test_connection():
    """Test QuickNode connection"""
    
    print("\n" + "="*60)
    print("QuickNode Polygon Connection Test")
    print("="*60 + "\n")
    
    # Get RPC URL
    rpc_url = os.getenv('POLYGON_RPC_URL')
    if not rpc_url:
        print("❌ POLYGON_RPC_URL not found in .env file")
        print("   Please set your QuickNode endpoint URL")
        return False
    
    # Mask API key for display
    display_url = rpc_url[:50] + "..." if len(rpc_url) > 50 else rpc_url
    print(f"🔗 RPC URL: {display_url}\n")
    
    # Test connection
    print("⏳ Connecting to Polygon network...")
    try:
        w3 = Web3(Web3.HTTPProvider(rpc_url))
        
        if not w3.is_connected():
            print("❌ Failed to connect to Polygon network")
            print("   Check your POLYGON_RPC_URL in .env")
            return False
        
        print("✅ Connected successfully!\n")
        
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False
    
    # Get network info
    print("="*60)
    print("Network Information")
    print("="*60)
    
    try:
        chain_id = w3.eth.chain_id
        print(f"⛓️  Chain ID: {chain_id}")
        
        if chain_id == 80002:
            print(f"🌐 Network: Polygon Amoy Testnet")
        elif chain_id == 137:
            print(f"🌐 Network: Polygon Mainnet")
        else:
            print(f"⚠️  Unknown network (Chain ID: {chain_id})")
        
        # Get latest block
        block_number = w3.eth.block_number
        print(f"📦 Latest Block: {block_number:,}")
        
        # Test response time
        start = time.time()
        w3.eth.get_block('latest')
        elapsed = (time.time() - start) * 1000
        print(f"⚡ Response Time: {elapsed:.2f}ms")
        
    except Exception as e:
        print(f"❌ Error getting network info: {e}")
        return False
    
    # Check wallet
    print("\n" + "="*60)
    print("Wallet Information")
    print("="*60)
    
    private_key = os.getenv('PRIVATE_KEY')
    if not private_key:
        print("⚠️  PRIVATE_KEY not found in .env file")
        print("   Wallet checks skipped (read-only mode)")
    else:
        try:
            # Remove 0x prefix if present
            if private_key.startswith('0x'):
                private_key = private_key[2:]
            
            account = w3.eth.account.from_key(private_key)
            address = account.address
            print(f"📍 Address: {address}")
            
            # Get balance
            balance = w3.eth.get_balance(address)
            balance_matic = w3.from_wei(balance, 'ether')
            print(f"💰 Balance: {balance_matic} MATIC")
            
            if balance == 0:
                print("\n⚠️  Warning: Wallet has no MATIC!")
                if chain_id == 80002:
                    print("   Get testnet MATIC from: https://faucet.polygon.technology/")
                else:
                    print("   Please fund your wallet with MATIC")
            elif balance_matic < 0.1:
                print(f"\n⚠️  Low balance: {balance_matic} MATIC")
                print("   You may need more MATIC for transactions")
            else:
                print(f"\n✅ Wallet funded: {balance_matic} MATIC")
                
        except Exception as e:
            print(f"❌ Error checking wallet: {e}")
            print("   Check your PRIVATE_KEY in .env (without 0x prefix)")
            return False
    
    # Test transaction simulation (if wallet configured)
    if private_key:
        print("\n" + "="*60)
        print("Transaction Test (Simulation)")
        print("="*60)
        
        try:
            # Estimate gas for a simple transaction
            gas_price = w3.eth.gas_price
            gas_price_gwei = w3.from_wei(gas_price, 'gwei')
            print(f"⛽ Current Gas Price: {gas_price_gwei:.2f} Gwei")
            
            # Estimate cost for typical MRV transaction
            estimated_gas = 100000  # Typical for data transaction
            estimated_cost = w3.from_wei(gas_price * estimated_gas, 'ether')
            print(f"💸 Estimated TX Cost: {estimated_cost:.6f} MATIC")
            
            if balance > 0:
                transactions_possible = int(balance / (gas_price * estimated_gas))
                print(f"📊 Possible Transactions: ~{transactions_possible}")
            
        except Exception as e:
            print(f"⚠️  Could not estimate gas: {e}")
    
    # Summary
    print("\n" + "="*60)
    print("Test Summary")
    print("="*60)
    print("✅ QuickNode connection: OK")
    print("✅ Network information: OK")
    
    if private_key:
        print("✅ Wallet configured: OK")
        if balance > 0:
            print("✅ Wallet funded: OK")
        else:
            print("⚠️  Wallet needs funding")
    else:
        print("⚠️  Wallet not configured (read-only mode)")
    
    print("\n" + "="*60)
    print("🎉 QuickNode setup complete!")
    print("="*60)
    print("\nNext steps:")
    print("1. Start backend: uvicorn server:app --reload")
    print("2. Check logs for blockchain integration status")
    print("3. Test MRV report generation in dMRV Studio")
    print("\n")
    
    return True

if __name__ == "__main__":
    try:
        success = test_connection()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n❌ Test cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
