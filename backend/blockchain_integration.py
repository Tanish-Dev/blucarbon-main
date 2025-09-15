from web3 import Web3
from web3.exceptions import ContractLogicError
import json
import os
from typing import Optional, Dict, Any
import asyncio
from concurrent.futures import ThreadPoolExecutor
from .server import logger

class BlockchainIntegration:
    def __init__(self):
        # Polygon Mumbai Testnet Configuration
        self.rpc_url = os.environ.get('POLYGON_RPC_URL', 'https://rpc-mumbai.maticvigil.com')
        self.private_key = os.environ.get('PRIVATE_KEY')
        self.project_registry_address = os.environ.get('PROJECT_REGISTRY_ADDRESS')
        self.carbon_credit_nft_address = os.environ.get('CARBON_CREDIT_NFT_ADDRESS')
        
        # Initialize Web3
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        
        if not self.w3.is_connected():
            logger.error("Failed to connect to Polygon Mumbai network")
            return
        
        # Set up account
        if self.private_key:
            self.account = self.w3.eth.account.from_key(self.private_key)
            self.w3.eth.default_account = self.account.address
        
        # Load contract ABIs (you'll need to compile the contracts and get these)
        self.project_registry_abi = self._load_abi('ProjectRegistry')
        self.carbon_credit_nft_abi = self._load_abi('CarbonCreditNFT')
        
        # Initialize contracts
        if self.project_registry_address and self.project_registry_abi:
            self.project_registry = self.w3.eth.contract(
                address=self.project_registry_address,
                abi=self.project_registry_abi
            )
        
        if self.carbon_credit_nft_address and self.carbon_credit_nft_abi:
            self.carbon_credit_nft = self.w3.eth.contract(
                address=self.carbon_credit_nft_address,
                abi=self.carbon_credit_nft_abi
            )
        
        # Thread pool for async blockchain operations
        self.executor = ThreadPoolExecutor(max_workers=3)

    def _load_abi(self, contract_name: str) -> Optional[list]:
        """Load contract ABI from file"""
        try:
            abi_path = f"/app/backend/blockchain/abi/{contract_name}.json"
            if os.path.exists(abi_path):
                with open(abi_path, 'r') as f:
                    return json.load(f)
        except Exception as e:
            logger.error(f"Error loading ABI for {contract_name}: {e}")
        return None

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