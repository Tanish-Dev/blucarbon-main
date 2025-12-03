from web3 import Web3
from web3.exceptions import ContractLogicError
import json
import os
from typing import Optional, Dict, Any
import asyncio
from concurrent.futures import ThreadPoolExecutor
import logging

logger = logging.getLogger(__name__)

class BlockchainIntegration:
    def __init__(self):
        # Polygon Network Configuration via QuickNode
        # Default to public RPC if QuickNode URL not set
        self.rpc_url = os.environ.get('POLYGON_RPC_URL', 'https://rpc-amoy.polygon.technology/')
        self.private_key = os.environ.get('PRIVATE_KEY')
        self.project_registry_address = os.environ.get('PROJECT_REGISTRY_ADDRESS')
        self.carbon_credit_nft_address = os.environ.get('CARBON_CREDIT_NFT_ADDRESS')
        self.mrv_registry_address = os.environ.get('MRV_REGISTRY_ADDRESS')
        
        # Initialize Web3 with QuickNode endpoint
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        self.is_connected = False
        
        try:
            if self.w3.is_connected():
                self.is_connected = True
                logger.info(f"✅ Connected to Polygon network via QuickNode")
                logger.info(f"🔗 RPC: {self.rpc_url[:50]}...")
                logger.info(f"⛓️  Chain ID: {self.w3.eth.chain_id}")
                
                # Log network info
                if self.w3.eth.chain_id == 80002:
                    logger.info("🌐 Network: Polygon Amoy Testnet")
                elif self.w3.eth.chain_id == 137:
                    logger.info("🌐 Network: Polygon Mainnet")
                else:
                    logger.warning(f"⚠️  Unknown network (Chain ID: {self.w3.eth.chain_id})")
            else:
                logger.error("❌ Failed to connect to Polygon network")
                return
        except Exception as e:
            logger.error(f"❌ Error connecting to Polygon network: {e}")
            return
        
        # Set up account
        if self.private_key:
            try:
                # Remove 0x prefix if present
                pk = self.private_key.replace('0x', '')
                self.account = self.w3.eth.account.from_key(pk)
                self.w3.eth.default_account = self.account.address
                logger.info(f"✅ Account initialized: {self.account.address}")
                
                # Check balance
                balance = self.w3.eth.get_balance(self.account.address)
                logger.info(f"Account balance: {self.w3.from_wei(balance, 'ether')} MATIC")
            except Exception as e:
                logger.error(f"❌ Error initializing account: {e}")
                self.account = None
        else:
            logger.warning("⚠️ No private key provided - read-only mode")
            self.account = None
        
        # Load contract ABIs
        self.project_registry_abi = self._load_abi('ProjectRegistry')
        self.carbon_credit_nft_abi = self._load_abi('CarbonCreditNFT')
        self.mrv_registry_abi = self._load_abi('MRVRegistry')
        
        # Initialize MRV Registry contract (priority)
        if self.mrv_registry_address and self.mrv_registry_abi:
            try:
                self.mrv_registry = self.w3.eth.contract(
                    address=Web3.to_checksum_address(self.mrv_registry_address),
                    abi=self.mrv_registry_abi
                )
                logger.info(f"✅ MRV Registry contract initialized at {self.mrv_registry_address}")
            except Exception as e:
                logger.error(f"❌ Error initializing MRV Registry: {e}")
                self.mrv_registry = None
        else:
            logger.warning("⚠️ MRV Registry not configured - will use transaction-based storage")
            self.mrv_registry = None
        
        # Initialize contracts
        if self.project_registry_address and self.project_registry_abi:
            try:
                self.project_registry = self.w3.eth.contract(
                    address=Web3.to_checksum_address(self.project_registry_address),
                    abi=self.project_registry_abi
                )
                logger.info(f"✅ Project Registry contract initialized at {self.project_registry_address}")
            except Exception as e:
                logger.error(f"❌ Error initializing Project Registry: {e}")
                self.project_registry = None
        else:
            logger.warning("⚠️ Project Registry not configured")
            self.project_registry = None
        
        if self.carbon_credit_nft_address and self.carbon_credit_nft_abi:
            try:
                self.carbon_credit_nft = self.w3.eth.contract(
                    address=Web3.to_checksum_address(self.carbon_credit_nft_address),
                    abi=self.carbon_credit_nft_abi
                )
                logger.info(f"✅ Carbon Credit NFT contract initialized at {self.carbon_credit_nft_address}")
            except Exception as e:
                logger.error(f"❌ Error initializing Carbon Credit NFT: {e}")
                self.carbon_credit_nft = None
        else:
            logger.warning("⚠️ Carbon Credit NFT not configured")
            self.carbon_credit_nft = None
        
        # Thread pool for async blockchain operations
        self.executor = ThreadPoolExecutor(max_workers=3)

    def _load_abi(self, contract_name: str) -> Optional[list]:
        """Load contract ABI from file"""
        try:
            # Try multiple possible paths
            possible_paths = [
                f"blockchain/abi/{contract_name}.json",
                f"/app/backend/blockchain/abi/{contract_name}.json",
                f"{os.path.dirname(__file__)}/blockchain/abi/{contract_name}.json"
            ]
            
            for abi_path in possible_paths:
                if os.path.exists(abi_path):
                    with open(abi_path, 'r') as f:
                        abi = json.load(f)
                        logger.info(f"✅ Loaded ABI for {contract_name} from {abi_path}")
                        return abi
            
            logger.warning(f"⚠️ ABI file not found for {contract_name}")
        except Exception as e:
            logger.error(f"❌ Error loading ABI for {contract_name}: {e}")
        return None
    
    async def store_mrv_hash(self, project_id: str, mrv_hash: str, metadata: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Store MRV hash on blockchain
        This is a simplified version that stores the hash directly
        """
        if not self.is_connected:
            logger.error("Not connected to blockchain")
            return None
            
        if not self.account:
            logger.error("No account configured - cannot sign transactions")
            return None
        
        try:
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                self.executor,
                self._store_mrv_hash_sync,
                project_id,
                mrv_hash,
                metadata
            )
            return result
        except Exception as e:
            logger.error(f"Error storing MRV hash on blockchain: {e}")
            return None
    
    def _store_mrv_hash_sync(self, project_id: str, mrv_hash: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Synchronous MRV hash storage
        If contracts are not deployed, we'll store it as a transaction with data
        """
        try:
            # If we have a project registry contract, use it
            if self.project_registry:
                return self._store_via_contract(project_id, mrv_hash, metadata)
            else:
                # Fallback: Store as transaction data
                return self._store_via_transaction(project_id, mrv_hash, metadata)
        except Exception as e:
            logger.error(f"Error in _store_mrv_hash_sync: {e}")
            raise
    
    def _store_via_contract(self, project_id: str, mrv_hash: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Store MRV hash via smart contract"""
        
        # Prefer MRVRegistry if available
        contract = self.mrv_registry if self.mrv_registry else self.project_registry
        
        if not contract:
            raise Exception("No contract available for storage")
        
        metadata_json = json.dumps(metadata)
        
        # Try to use MRVRegistry contract first
        if self.mrv_registry:
            try:
                # MRVRegistry uses storeMRVHashHex function
                function = contract.functions.storeMRVHashHex(
                    project_id,
                    mrv_hash,  # Pass as hex string with 0x prefix
                    metadata_json
                )
            except Exception as e:
                logger.warning(f"Failed to use MRVRegistry, trying ProjectRegistry: {e}")
                if self.project_registry:
                    function = self.project_registry.functions.storeMRVHash(
                        project_id,
                        mrv_hash,
                        metadata_json
                    )
                else:
                    raise
        else:
            # Use ProjectRegistry
            function = contract.functions.storeMRVHash(
                project_id,
                mrv_hash,
                metadata_json
            )
        
        # Estimate gas
        gas_estimate = function.estimate_gas({'from': self.account.address})
        
        # Build transaction
        transaction = function.build_transaction({
            'from': self.account.address,
            'gas': int(gas_estimate * 1.2),  # Add 20% buffer
            'gasPrice': self.w3.eth.gas_price,
            'nonce': self.w3.eth.get_transaction_count(self.account.address),
        })
        
        # Sign and send
        signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        
        # Wait for confirmation
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
        
        logger.info(f"✅ MRV hash stored on blockchain via contract. TX: {receipt.transactionHash.hex()}")
        
        # Determine explorer URL
        if self.w3.eth.chain_id == 80002:
            explorer_url = f"https://amoy.polygonscan.com/tx/{receipt.transactionHash.hex()}"
        elif self.w3.eth.chain_id == 137:
            explorer_url = f"https://polygonscan.com/tx/{receipt.transactionHash.hex()}"
        else:
            explorer_url = f"https://polygonscan.com/tx/{receipt.transactionHash.hex()}"
        
        return {
            'transaction_hash': receipt.transactionHash.hex(),
            'block_number': receipt.blockNumber,
            'gas_used': receipt.gasUsed,
            'status': 'success' if receipt.status == 1 else 'failed',
            'explorer_url': explorer_url
        }
    
    def _store_via_transaction(self, project_id: str, mrv_hash: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Store MRV hash as transaction data (fallback when no contract is deployed)"""
        
        # Encode data
        data_dict = {
            'type': 'MRV_REPORT',
            'project_id': project_id,
            'mrv_hash': mrv_hash,
            'metadata': metadata
        }
        data_hex = '0x' + json.dumps(data_dict).encode('utf-8').hex()
        
        # Build transaction - sending to self with data
        transaction = {
            'from': self.account.address,
            'to': self.account.address,
            'value': 0,
            'gas': 100000,
            'gasPrice': self.w3.eth.gas_price,
            'nonce': self.w3.eth.get_transaction_count(self.account.address),
            'data': data_hex,
            'chainId': self.w3.eth.chain_id
        }
        
        # Sign and send
        signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        
        # Wait for confirmation
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
        
        logger.info(f"✅ MRV hash stored on blockchain via transaction. TX: {receipt.transactionHash.hex()}")
        
        return {
            'transaction_hash': receipt.transactionHash.hex(),
            'block_number': receipt.blockNumber,
            'gas_used': receipt.gasUsed,
            'status': 'success' if receipt.status == 1 else 'failed',
            'explorer_url': f"https://amoy.polygonscan.com/tx/{receipt.transactionHash.hex()}"
        }

    async def register_project_on_blockchain(self, project_data: Dict[str, Any]) -> Optional[str]:
        """Register project on blockchain"""
        if not self.project_registry:
            logger.error("Project registry contract not initialized")
            return None
        
        try:
            loop = asyncio.get_event_loop()
            tx_hash = await loop.run_in_executor(
                self.executor,
                self._register_project_sync,
                project_data
            )
            return tx_hash
        except Exception as e:
            logger.error(f"Error registering project on blockchain: {e}")
            return None

    def _register_project_sync(self, project_data: Dict[str, Any]) -> str:
        """Synchronous project registration"""
        # Convert area to wei (multiply by 1e18)
        area_wei = int(project_data['area_hectares'] * 1e18)
        
        # Build transaction
        function = self.project_registry.functions.registerProject(
            project_data['id'],
            project_data['title'],
            project_data['methodology'],
            project_data['ecosystem_type'],
            area_wei,
            project_data['vintage'],
            json.dumps(project_data['location']),
            project_data.get('ipfs_metadata_hash', '')
        )
        
        # Get gas estimate
        gas_estimate = function.estimate_gas({'from': self.account.address})
        
        # Build transaction
        transaction = function.build_transaction({
            'from': self.account.address,
            'gas': gas_estimate,
            'gasPrice': self.w3.eth.gas_price,
            'nonce': self.w3.eth.get_transaction_count(self.account.address),
        })
        
        # Sign and send transaction
        signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        
        # Wait for confirmation
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        
        return receipt.transactionHash.hex()

    async def issue_credit_on_blockchain(self, credit_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Issue carbon credit NFT on blockchain"""
        if not self.carbon_credit_nft:
            logger.error("Carbon credit NFT contract not initialized")
            return None
        
        try:
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                self.executor,
                self._issue_credit_sync,
                credit_data
            )
            return result
        except Exception as e:
            logger.error(f"Error issuing credit on blockchain: {e}")
            return None

    def _issue_credit_sync(self, credit_data: Dict[str, Any]) -> Dict[str, Any]:
        """Synchronous credit issuance"""
        # Convert amount to wei
        amount_wei = int(credit_data['amount'] * 1e18)
        
        # Build transaction
        function = self.carbon_credit_nft.functions.issueCredit(
            credit_data['issued_to_address'],
            credit_data['project_id'],
            amount_wei,
            credit_data['vintage'],
            credit_data['methodology'],
            credit_data['mrv_hash'],
            credit_data['data_bundle_uri'],
            credit_data['uncertainty_class'],
            credit_data['token_uri']
        )
        
        # Get gas estimate
        gas_estimate = function.estimate_gas({'from': self.account.address})
        
        # Build transaction
        transaction = function.build_transaction({
            'from': self.account.address,
            'gas': gas_estimate,
            'gasPrice': self.w3.eth.gas_price,
            'nonce': self.w3.eth.get_transaction_count(self.account.address),
        })
        
        # Sign and send transaction
        signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        
        # Wait for confirmation
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        
        # Get token ID from event logs
        token_id = None
        for log in receipt.logs:
            try:
                decoded_log = self.carbon_credit_nft.events.CreditIssued().process_log(log)
                token_id = decoded_log.args.tokenId
                break
            except:
                continue
        
        return {
            'transaction_hash': receipt.transactionHash.hex(),
            'token_id': token_id,
            'block_number': receipt.blockNumber,
            'gas_used': receipt.gasUsed
        }

    async def retire_credit_on_blockchain(self, token_id: int, user_address: str) -> Optional[str]:
        """Retire carbon credit on blockchain"""
        if not self.carbon_credit_nft:
            logger.error("Carbon credit NFT contract not initialized")
            return None
        
        try:
            loop = asyncio.get_event_loop()
            tx_hash = await loop.run_in_executor(
                self.executor,
                self._retire_credit_sync,
                token_id,
                user_address
            )
            return tx_hash
        except Exception as e:
            logger.error(f"Error retiring credit on blockchain: {e}")
            return None

    def _retire_credit_sync(self, token_id: int, user_address: str) -> str:
        """Synchronous credit retirement"""
        # Note: This would typically be called by the user's wallet, not the backend
        # For now, we'll assume the backend has permission to retire on behalf of the user
        
        function = self.carbon_credit_nft.functions.retireCredit(token_id)
        
        # Get gas estimate
        gas_estimate = function.estimate_gas({'from': user_address})
        
        # Build transaction
        transaction = function.build_transaction({
            'from': user_address,
            'gas': gas_estimate,
            'gasPrice': self.w3.eth.gas_price,
            'nonce': self.w3.eth.get_transaction_count(user_address),
        })
        
        # Note: In production, this should be signed by the user's wallet
        # For now, we'll use the backend account (this is not ideal for security)
        signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        
        # Wait for confirmation
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        
        return receipt.transactionHash.hex()

    async def get_project_from_blockchain(self, project_id: str) -> Optional[Dict[str, Any]]:
        """Get project data from blockchain"""
        if not self.project_registry:
            return None
        
        try:
            loop = asyncio.get_event_loop()
            project_data = await loop.run_in_executor(
                self.executor,
                self._get_project_sync,
                project_id
            )
            return project_data
        except Exception as e:
            logger.error(f"Error getting project from blockchain: {e}")
            return None

    def _get_project_sync(self, project_id: str) -> Dict[str, Any]:
        """Synchronous project retrieval"""
        project = self.project_registry.functions.getProject(project_id).call()
        
        return {
            'project_id': project[0],
            'title': project[1],
            'methodology': project[2],
            'ecosystem_type': project[3],
            'area_hectares': project[4] / 1e18,  # Convert from wei
            'vintage': project[5],
            'location': json.loads(project[6]) if project[6] else {},
            'owner': project[7],
            'validator': project[8],
            'status': project[9],
            'ipfs_metadata_hash': project[10],
            'created_at': project[11],
            'updated_at': project[12]
        }

    async def get_credit_from_blockchain(self, token_id: int) -> Optional[Dict[str, Any]]:
        """Get credit data from blockchain"""
        if not self.carbon_credit_nft:
            return None
        
        try:
            loop = asyncio.get_event_loop()
            credit_data = await loop.run_in_executor(
                self.executor,
                self._get_credit_sync,
                token_id
            )
            return credit_data
        except Exception as e:
            logger.error(f"Error getting credit from blockchain: {e}")
            return None

    def _get_credit_sync(self, token_id: int) -> Dict[str, Any]:
        """Synchronous credit retrieval"""
        credit = self.carbon_credit_nft.functions.getCreditData(token_id).call()
        
        return {
            'project_id': credit[0],
            'amount': credit[1] / 1e18,  # Convert from wei
            'vintage': credit[2],
            'methodology': credit[3],
            'mrv_hash': credit[4],
            'data_bundle_uri': credit[5],
            'uncertainty_class': credit[6],
            'issued_at': credit[7],
            'retired_at': credit[8],
            'status': credit[9],
            'issued_to': credit[10],
            'retired_by': credit[11]
        }

# Global blockchain integration instance
blockchain = BlockchainIntegration()