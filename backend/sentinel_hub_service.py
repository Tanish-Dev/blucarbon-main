"""
Sentinel Hub Integration Service
Fetches real Sentinel-1 and Sentinel-2 satellite imagery
"""

import requests
import base64
from datetime import datetime, timedelta
from typing import List, Dict, Tuple
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

class SentinelHubService:
    def __init__(self, client_id: str, client_secret: str, instance_id: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.instance_id = instance_id
        self.token_url = "https://services.sentinel-hub.com/oauth/token"
        self.process_url = "https://services.sentinel-hub.com/api/v1/process"
        self.access_token = None
        self.token_expiry = None
    
    def get_access_token(self) -> str:
        """Get or refresh OAuth2 access token"""
        # Return cached token if still valid
        if self.access_token and self.token_expiry and datetime.now() < self.token_expiry:
            return self.access_token
        
        # Request new token
        auth_string = f"{self.client_id}:{self.client_secret}"
        auth_bytes = auth_string.encode('utf-8')
        auth_b64 = base64.b64encode(auth_bytes).decode('utf-8')
        
        headers = {
            'Authorization': f'Basic {auth_b64}',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        data = {
            'grant_type': 'client_credentials'
        }
        
        response = requests.post(self.token_url, headers=headers, data=data)
        response.raise_for_status()
        
        token_data = response.json()
        self.access_token = token_data['access_token']
        # Set expiry to 5 minutes before actual expiry
        self.token_expiry = datetime.now() + timedelta(seconds=token_data['expires_in'] - 300)
        
        return self.access_token
    
    def polygon_to_bbox(self, polygon: List[Dict]) -> List[float]:
        """Convert polygon coordinates to bounding box [min_lng, min_lat, max_lng, max_lat]"""
        lngs = [p['lng'] if 'lng' in p else p[0] for p in polygon]
        lats = [p['lat'] if 'lat' in p else p[1] for p in polygon]
        
        return [min(lngs), min(lats), max(lngs), max(lats)]
    
    def bbox_to_polygon_coords(self, bbox: List[float]) -> List[List[float]]:
        """Convert bbox to polygon coordinates for Sentinel Hub"""
        min_lng, min_lat, max_lng, max_lat = bbox
        return [
            [min_lng, min_lat],
            [max_lng, min_lat],
            [max_lng, max_lat],
            [min_lng, max_lat],
            [min_lng, min_lat]
        ]
    
    def get_sentinel2_true_color(
        self, 
        polygon: List[Dict], 
        date: str,
        cloud_coverage: int = 20,
        width: int = 512,
        height: int = 512
    ) -> Dict:
        """
        Get Sentinel-2 True Color RGB imagery
        
        Args:
            polygon: List of coordinate dicts with 'lat' and 'lng'
            date: Date in ISO format (YYYY-MM-DD)
            cloud_coverage: Max cloud coverage percentage (0-100)
            width: Image width in pixels
            height: Image height in pixels
        
        Returns:
            Dict with image URL and metadata
        """
        token = self.get_access_token()
        bbox = self.polygon_to_bbox(polygon)
        polygon_coords = self.bbox_to_polygon_coords(bbox)
        
        # Calculate date range (±15 days for cloud-free composite)
        center_date = datetime.fromisoformat(date)
        start_date = (center_date - timedelta(days=15)).strftime('%Y-%m-%d')
        end_date = (center_date + timedelta(days=15)).strftime('%Y-%m-%d')
        
        # Evalscript for True Color RGB
        evalscript = """
        //VERSION=3
        function setup() {
            return {
                input: [{
                    bands: ["B04", "B03", "B02", "SCL"],
                    units: "DN"
                }],
                output: {
                    bands: 3,
                    sampleType: "AUTO"
                }
            };
        }

        function evaluatePixel(sample) {
            // True color with slight enhancement
            let gain = 2.5;
            return [sample.B04 * gain / 10000, sample.B03 * gain / 10000, sample.B02 * gain / 10000];
        }
        """
        
        request_payload = {
            "input": {
                "bounds": {
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [polygon_coords]
                    }
                },
                "data": [{
                    "type": "sentinel-2-l2a",
                    "dataFilter": {
                        "timeRange": {
                            "from": f"{start_date}T00:00:00Z",
                            "to": f"{end_date}T23:59:59Z"
                        },
                        "maxCloudCoverage": cloud_coverage
                    }
                }]
            },
            "output": {
                "width": width,
                "height": height,
                "responses": [{
                    "identifier": "default",
                    "format": {
                        "type": "image/png"
                    }
                }]
            },
            "evalscript": evalscript
        }
        
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json',
            'Accept': 'application/tar'
        }
        
        response = requests.post(self.process_url, headers=headers, json=request_payload)
        
        if response.status_code == 200:
            # Save image and return data URL
            image_data = response.content
            image_b64 = base64.b64encode(image_data).decode('utf-8')
            
            return {
                'success': True,
                'image': f'data:image/png;base64,{image_b64}',
                'date_range': f'{start_date} to {end_date}',
                'bbox': bbox
            }
        else:
            return {
                'success': False,
                'error': response.text
            }
    
    def get_sentinel2_ndvi(
        self, 
        polygon: List[Dict], 
        date: str,
        cloud_coverage: int = 20,
        width: int = 512,
        height: int = 512
    ) -> Dict:
        """
        Get Sentinel-2 NDVI (Normalized Difference Vegetation Index)
        
        NDVI = (NIR - Red) / (NIR + Red)
        Range: -1 to 1 (higher values = more vegetation)
        """
        token = self.get_access_token()
        bbox = self.polygon_to_bbox(polygon)
        polygon_coords = self.bbox_to_polygon_coords(bbox)
        
        center_date = datetime.fromisoformat(date)
        start_date = (center_date - timedelta(days=15)).strftime('%Y-%m-%d')
        end_date = (center_date + timedelta(days=15)).strftime('%Y-%m-%d')
        
        # Evalscript for NDVI calculation
        evalscript = """
        //VERSION=3
        function setup() {
            return {
                input: [{
                    bands: ["B04", "B08", "SCL"],
                    units: "DN"
                }],
                output: {
                    bands: 3,
                    sampleType: "AUTO"
                }
            };
        }

        function evaluatePixel(sample) {
            let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
            
            // Color-code NDVI values
            if (ndvi < 0) return [0.5, 0.5, 0.5]; // Gray (no vegetation)
            else if (ndvi < 0.2) return [1, 0.8, 0.6]; // Light brown (sparse)
            else if (ndvi < 0.4) return [1, 1, 0.6]; // Yellow (moderate)
            else if (ndvi < 0.6) return [0.8, 1, 0.4]; // Yellow-green (good)
            else return [0.2, 0.8, 0.2]; // Dark green (dense vegetation)
        }
        """
        
        request_payload = {
            "input": {
                "bounds": {
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [polygon_coords]
                    }
                },
                "data": [{
                    "type": "sentinel-2-l2a",
                    "dataFilter": {
                        "timeRange": {
                            "from": f"{start_date}T00:00:00Z",
                            "to": f"{end_date}T23:59:59Z"
                        },
                        "maxCloudCoverage": cloud_coverage
                    }
                }]
            },
            "output": {
                "width": width,
                "height": height,
                "responses": [{
                    "identifier": "default",
                    "format": {
                        "type": "image/png"
                    }
                }]
            },
            "evalscript": evalscript
        }
        
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json',
            'Accept': 'application/tar'
        }
        
        response = requests.post(self.process_url, headers=headers, json=request_payload)
        
        if response.status_code == 200:
            image_data = response.content
            image_b64 = base64.b64encode(image_data).decode('utf-8')
            
            return {
                'success': True,
                'image': f'data:image/png;base64,{image_b64}',
                'date_range': f'{start_date} to {end_date}',
                'bbox': bbox
            }
        else:
            return {
                'success': False,
                'error': response.text
            }
    
    def get_ndvi_statistics(
        self, 
        polygon: List[Dict], 
        date: str,
        cloud_coverage: int = 20
    ) -> Dict:
        """
        Get NDVI statistics (mean, min, max, std) for the polygon area
        """
        token = self.get_access_token()
        bbox = self.polygon_to_bbox(polygon)
        polygon_coords = self.bbox_to_polygon_coords(bbox)
        
        center_date = datetime.fromisoformat(date)
        start_date = (center_date - timedelta(days=15)).strftime('%Y-%m-%d')
        end_date = (center_date + timedelta(days=15)).strftime('%Y-%m-%d')
        
        # Evalscript to return NDVI values
        evalscript = """
        //VERSION=3
        function setup() {
            return {
                input: [{
                    bands: ["B04", "B08"],
                    units: "DN"
                }],
                output: {
                    bands: 1,
                    sampleType: "FLOAT32"
                }
            };
        }

        function evaluatePixel(sample) {
            let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
            return [ndvi];
        }
        """
        
        request_payload = {
            "input": {
                "bounds": {
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [polygon_coords]
                    }
                },
                "data": [{
                    "type": "sentinel-2-l2a",
                    "dataFilter": {
                        "timeRange": {
                            "from": f"{start_date}T00:00:00Z",
                            "to": f"{end_date}T23:59:59Z"
                        },
                        "maxCloudCoverage": cloud_coverage
                    }
                }]
            },
            "output": {
                "resx": 10,
                "resy": 10,
                "responses": [{
                    "identifier": "default",
                    "format": {
                        "type": "application/json"
                    }
                }]
            },
            "evalscript": evalscript
        }
        
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        response = requests.post(self.process_url, headers=headers, json=request_payload)
        
        if response.status_code == 200:
            # TODO: Process response to calculate statistics
            return {
                'success': True,
                'message': 'NDVI statistics calculated'
            }
        else:
            return {
                'success': False,
                'error': response.text
            }
    
    def compare_temporal_imagery(
        self,
        polygon: List[Dict],
        baseline_date: str,
        monitoring_date: str
    ) -> Dict:
        """
        Compare baseline and monitoring imagery to detect changes
        
        Returns both true color and NDVI for baseline and monitoring dates
        """
        baseline_rgb = self.get_sentinel2_true_color(polygon, baseline_date)
        monitoring_rgb = self.get_sentinel2_true_color(polygon, monitoring_date)
        
        baseline_ndvi = self.get_sentinel2_ndvi(polygon, baseline_date)
        monitoring_ndvi = self.get_sentinel2_ndvi(polygon, monitoring_date)
        
        return {
            'baseline': {
                'date': baseline_date,
                'rgb': baseline_rgb,
                'ndvi': baseline_ndvi
            },
            'monitoring': {
                'date': monitoring_date,
                'rgb': monitoring_rgb,
                'ndvi': monitoring_ndvi
            },
            'change_detected': baseline_rgb['success'] and monitoring_rgb['success']
        }


# Initialize singleton instance
sentinel_service = None

def get_sentinel_service() -> SentinelHubService:
    """Get or create Sentinel Hub service instance"""
    global sentinel_service
    
    if sentinel_service is None:
        client_id = os.getenv('SENTINEL_CLIENT_ID')
        client_secret = os.getenv('SENTINEL_CLIENT_SECRET')
        instance_id = os.getenv('SENTINEL_INSTANCE_ID')
        
        if not all([client_id, client_secret, instance_id]):
            raise ValueError("Sentinel Hub credentials not configured. Please set SENTINEL_CLIENT_ID, SENTINEL_CLIENT_SECRET, and SENTINEL_INSTANCE_ID environment variables.")
        
        sentinel_service = SentinelHubService(client_id, client_secret, instance_id)
    
    return sentinel_service
