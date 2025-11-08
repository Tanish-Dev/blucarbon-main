"""
Test Sentinel Hub Integration
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

# Test import
try:
    from sentinel_hub_service import get_sentinel_service
    print("✅ Sentinel Hub service imported successfully")
    
    # Try to initialize
    service = get_sentinel_service()
    print("✅ Sentinel Hub service initialized")
    
    # Test authentication
    try:
        token = service.get_access_token()
        print(f"✅ Authentication successful! Token: {token[:50]}...")
    except Exception as e:
        print(f"❌ Authentication failed: {e}")
        
except ImportError as e:
    print(f"❌ Import error: {e}")
except Exception as e:
    print(f"❌ Error: {e}")
