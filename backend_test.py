import requests
import sys
import json
import tempfile
import os
from datetime import datetime
from typing import Dict, Any, Optional

class CarbonCreditAPITester:
    def __init__(self, base_url="https://carbon-trust-ai.preview.emergentagent.com"):
        self.base_url = base_url
        self.admin_token = None
        self.user_token = None
        self.validator_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_resources = {
            'users': [],
            'projects': [],
            'field_data': [],
            'credits': []
        }

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, 
                 data: Optional[Dict] = None, files: Optional[Dict] = None, 
                 token: Optional[str] = None) -> tuple[bool, Dict]:
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'
        
        if files:
            # Remove Content-Type for file uploads
            headers.pop('Content-Type', None)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files, data=data, headers=headers)
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "health",
            200
        )
        return success

    def test_register_users(self):
        """Test user registration for different roles"""
        timestamp = datetime.now().strftime('%H%M%S')
        
        # Register admin user
        admin_data = {
            "email": f"admin_{timestamp}@test.com",
            "username": f"admin_{timestamp}",
            "full_name": "Test Admin",
            "password": "TestPass123!",
            "role": "admin",
            "blockchain_address": "0x1234567890123456789012345678901234567890"
        }
        
        success, response = self.run_test(
            "Register Admin User",
            "POST",
            "auth/register",
            200,
            data=admin_data
        )
        
        if success and 'access_token' in response:
            self.admin_token = response['access_token']
            self.created_resources['users'].append(response['user'])
            print(f"   Admin token obtained: {self.admin_token[:20]}...")
        
        # Register regular user
        user_data = {
            "email": f"user_{timestamp}@test.com",
            "username": f"user_{timestamp}",
            "full_name": "Test User",
            "password": "TestPass123!",
            "role": "user"
        }
        
        success, response = self.run_test(
            "Register Regular User",
            "POST",
            "auth/register",
            200,
            data=user_data
        )
        
        if success and 'access_token' in response:
            self.user_token = response['access_token']
            self.created_resources['users'].append(response['user'])
            print(f"   User token obtained: {self.user_token[:20]}...")
        
        # Register validator user
        validator_data = {
            "email": f"validator_{timestamp}@test.com",
            "username": f"validator_{timestamp}",
            "full_name": "Test Validator",
            "password": "TestPass123!",
            "role": "validator"
        }
        
        success, response = self.run_test(
            "Register Validator User",
            "POST",
            "auth/register",
            200,
            data=validator_data
        )
        
        if success and 'access_token' in response:
            self.validator_token = response['access_token']
            self.created_resources['users'].append(response['user'])
            print(f"   Validator token obtained: {self.validator_token[:20]}...")
        
        return self.admin_token and self.user_token and self.validator_token

    def test_login(self):
        """Test login functionality"""
        if not self.created_resources['users']:
            print("❌ No users created to test login")
            return False
        
        user = self.created_resources['users'][0]  # Use admin user
        login_data = {
            "username": user['username'],
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        return success and 'access_token' in response

    def test_get_user_profile(self):
        """Test getting user profile"""
        success, response = self.run_test(
            "Get User Profile",
            "GET",
            "auth/me",
            200,
            token=self.user_token
        )
        
        return success and 'id' in response

    def test_create_project(self):
        """Test creating a carbon project"""
        project_data = {
            "title": "Test Mangrove Restoration Project",
            "description": "A test project for mangrove restoration and carbon sequestration",
            "methodology": "VM0033",
            "ecosystem_type": "Mangrove",
            "location": {
                "lat": -6.2088,
                "lng": 106.8456,
                "address": "Jakarta Bay, Indonesia"
            },
            "area_hectares": 150.5,
            "vintage": "2024"
        }
        
        success, response = self.run_test(
            "Create Project",
            "POST",
            "projects",
            200,
            data=project_data,
            token=self.user_token
        )
        
        if success and 'id' in response:
            self.created_resources['projects'].append(response)
            print(f"   Project created with ID: {response['id']}")
        
        return success

    def test_get_projects(self):
        """Test getting projects list"""
        success, response = self.run_test(
            "Get Projects List",
            "GET",
            "projects",
            200,
            token=self.user_token
        )
        
        return success and isinstance(response, list)

    def test_get_specific_project(self):
        """Test getting a specific project"""
        if not self.created_resources['projects']:
            print("❌ No projects created to test")
            return False
        
        project_id = self.created_resources['projects'][0]['id']
        success, response = self.run_test(
            "Get Specific Project",
            "GET",
            f"projects/{project_id}",
            200,
            token=self.user_token
        )
        
        return success and response.get('id') == project_id

    def test_update_project(self):
        """Test updating a project"""
        if not self.created_resources['projects']:
            print("❌ No projects created to test")
            return False
        
        project_id = self.created_resources['projects'][0]['id']
        update_data = {
            "title": "Updated Test Mangrove Project",
            "description": "Updated description for the test project",
            "methodology": "VM0033",
            "ecosystem_type": "Mangrove",
            "location": {
                "lat": -6.2088,
                "lng": 106.8456,
                "address": "Jakarta Bay, Indonesia"
            },
            "area_hectares": 200.0,
            "vintage": "2024"
        }
        
        success, response = self.run_test(
            "Update Project",
            "PUT",
            f"projects/{project_id}",
            200,
            data=update_data,
            token=self.user_token
        )
        
        return success and response.get('title') == "Updated Test Mangrove Project"

    def test_create_field_data(self):
        """Test creating field data entry"""
        if not self.created_resources['projects']:
            print("❌ No projects created to test")
            return False
        
        project_id = self.created_resources['projects'][0]['id']
        field_data = {
            "project_id": project_id,
            "plot_id": "PLOT_001",
            "gps_coordinates": {
                "lat": -6.2088,
                "lng": 106.8456,
                "accuracy": 5.0
            },
            "species": "Rhizophora mucronata",
            "canopy_cover": 75.5,
            "soil_type": "Clay",
            "notes": "Healthy mangrove stand with good regeneration",
            "measurements": "Height: 3.2m, DBH: 15cm"
        }
        
        success, response = self.run_test(
            "Create Field Data",
            "POST",
            "field-data",
            200,
            data=field_data,
            token=self.user_token
        )
        
        if success and 'id' in response:
            self.created_resources['field_data'].append(response)
            print(f"   Field data created with ID: {response['id']}")
        
        return success

    def test_upload_field_images(self):
        """Test uploading images for field data"""
        if not self.created_resources['field_data']:
            print("❌ No field data created to test")
            return False
        
        field_data_id = self.created_resources['field_data'][0]['id']
        
        # Create a temporary test image file
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as temp_file:
            # Write some dummy image data
            temp_file.write(b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00')
            temp_file_path = temp_file.name
        
        try:
            with open(temp_file_path, 'rb') as f:
                files = {'files': ('test_image.jpg', f, 'image/jpeg')}
                
                success, response = self.run_test(
                    "Upload Field Images",
                    "POST",
                    f"field-data/{field_data_id}/upload-images",
                    200,
                    files=files,
                    token=self.user_token
                )
        finally:
            os.unlink(temp_file_path)
        
        return success and 'ipfs_hashes' in response

    def test_get_field_data(self):
        """Test getting field data list"""
        success, response = self.run_test(
            "Get Field Data List",
            "GET",
            "field-data",
            200,
            token=self.user_token
        )
        
        return success and isinstance(response, list)

    def test_validate_field_data(self):
        """Test validating field data as validator"""
        if not self.created_resources['field_data']:
            print("❌ No field data created to test")
            return False
        
        field_data_id = self.created_resources['field_data'][0]['id']
        success, response = self.run_test(
            "Validate Field Data",
            "PUT",
            f"field-data/{field_data_id}/validate",
            200,
            token=self.validator_token
        )
        
        return success

    def test_create_credit(self):
        """Test creating carbon credit"""
        if not self.created_resources['projects']:
            print("❌ No projects created to test")
            return False
        
        project_id = self.created_resources['projects'][0]['id']
        credit_data = {
            "project_id": project_id,
            "amount": 100.5,
            "vintage": "2024",
            "methodology": "VM0033",
            "metadata": {
                "mrv_hash": "QmTestMRVHash123456789",
                "data_bundle_uri": "ipfs://QmTestDataBundle123456789",
                "uncertainty_class": "Low",
                "verification_standard": "VCS",
                "project_id": project_id
            }
        }
        
        success, response = self.run_test(
            "Create Carbon Credit",
            "POST",
            "credits",
            200,
            data=credit_data,
            token=self.admin_token
        )
        
        if success and 'id' in response:
            self.created_resources['credits'].append(response)
            print(f"   Credit created with ID: {response['id']}")
        
        return success

    def test_get_credits(self):
        """Test getting credits list"""
        success, response = self.run_test(
            "Get Credits List",
            "GET",
            "credits",
            200,
            token=self.admin_token
        )
        
        return success and isinstance(response, list)

    def test_issue_credit(self):
        """Test issuing credit"""
        if not self.created_resources['credits']:
            print("❌ No credits created to test")
            return False
        
        credit_id = self.created_resources['credits'][0]['id']
        issue_data = {
            "issued_to": "test_buyer_address"
        }
        
        success, response = self.run_test(
            "Issue Credit",
            "PUT",
            f"credits/{credit_id}/issue?issued_to=test_buyer_address",
            200,
            token=self.admin_token
        )
        
        return success

    def test_get_credit_stats(self):
        """Test getting credit statistics"""
        success, response = self.run_test(
            "Get Credit Statistics",
            "GET",
            "credits/stats/summary",
            200,
            token=self.admin_token
        )
        
        return success and 'total_credits' in response

    def test_blockchain_project_registration(self):
        """Test blockchain project registration"""
        if not self.created_resources['projects']:
            print("❌ No projects created to test")
            return False
        
        project_id = self.created_resources['projects'][0]['id']
        success, response = self.run_test(
            "Register Project on Blockchain",
            "POST",
            f"projects/{project_id}/register-blockchain",
            200,
            token=self.admin_token
        )
        
        return success and 'transaction_hash' in response

    def test_blockchain_credit_issuance(self):
        """Test blockchain credit issuance"""
        if not self.created_resources['credits']:
            print("❌ No credits created to test")
            return False
        
        credit_id = self.created_resources['credits'][0]['id']
        success, response = self.run_test(
            "Issue Credit on Blockchain",
            "POST",
            f"credits/{credit_id}/issue-blockchain",
            200,
            token=self.admin_token
        )
        
        return success and 'transaction_hash' in response

    def test_authorization_errors(self):
        """Test role-based authorization"""
        print("\n🔒 Testing Authorization Controls...")
        
        # Test user trying to create credit (should fail)
        if self.created_resources['projects']:
            project_id = self.created_resources['projects'][0]['id']
            credit_data = {
                "project_id": project_id,
                "amount": 50.0,
                "vintage": "2024",
                "methodology": "VM0033",
                "metadata": {
                    "mrv_hash": "QmTestHash",
                    "data_bundle_uri": "ipfs://QmTestBundle",
                    "uncertainty_class": "Low",
                    "verification_standard": "VCS",
                    "project_id": project_id
                }
            }
            
            success, response = self.run_test(
                "User Create Credit (Should Fail)",
                "POST",
                "credits",
                403,  # Expecting forbidden
                data=credit_data,
                token=self.user_token
            )
            
            if success:
                print("✅ Authorization working - User correctly denied credit creation")
            
        # Test accessing without token
        success, response = self.run_test(
            "Access Without Token (Should Fail)",
            "GET",
            "auth/me",
            401  # Expecting unauthorized
        )
        
        if success:
            print("✅ Authorization working - Unauthenticated access correctly denied")
        
        return True

def main():
    print("🚀 Starting Carbon Credit Management System API Tests")
    print("=" * 60)
    
    tester = CarbonCreditAPITester()
    
    # Test sequence
    test_sequence = [
        ("Health Check", tester.test_health_check),
        ("User Registration", tester.test_register_users),
        ("User Login", tester.test_login),
        ("Get User Profile", tester.test_get_user_profile),
        ("Create Project", tester.test_create_project),
        ("Get Projects", tester.test_get_projects),
        ("Get Specific Project", tester.test_get_specific_project),
        ("Update Project", tester.test_update_project),
        ("Create Field Data", tester.test_create_field_data),
        ("Upload Field Images", tester.test_upload_field_images),
        ("Get Field Data", tester.test_get_field_data),
        ("Validate Field Data", tester.test_validate_field_data),
        ("Create Credit", tester.test_create_credit),
        ("Get Credits", tester.test_get_credits),
        ("Issue Credit", tester.test_issue_credit),
        ("Get Credit Stats", tester.test_get_credit_stats),
        ("Blockchain Project Registration", tester.test_blockchain_project_registration),
        ("Blockchain Credit Issuance", tester.test_blockchain_credit_issuance),
        ("Authorization Controls", tester.test_authorization_errors)
    ]
    
    failed_tests = []
    
    for test_name, test_func in test_sequence:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            if not test_func():
                failed_tests.append(test_name)
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
            failed_tests.append(test_name)
    
    # Print final results
    print(f"\n{'='*60}")
    print(f"📊 FINAL TEST RESULTS")
    print(f"{'='*60}")
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if failed_tests:
        print(f"\n❌ Failed tests:")
        for test in failed_tests:
            print(f"   - {test}")
    else:
        print(f"\n✅ All test categories completed successfully!")
    
    print(f"\n📋 Created Resources Summary:")
    print(f"   Users: {len(tester.created_resources['users'])}")
    print(f"   Projects: {len(tester.created_resources['projects'])}")
    print(f"   Field Data: {len(tester.created_resources['field_data'])}")
    print(f"   Credits: {len(tester.created_resources['credits'])}")
    
    return 0 if not failed_tests else 1

if __name__ == "__main__":
    sys.exit(main())