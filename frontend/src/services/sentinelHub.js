/**
 * Sentinel Hub Integration Service
 * Fetches real satellite imagery from backend
 */

import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

class SentinelHubService {
  /**
   * Get real satellite imagery for a project
   * @param {string} projectId - Project ID
   * @returns {Promise} - Imagery data
   */
  async getProjectImagery(projectId) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/satellite/imagery/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching project imagery:', error);
      throw error;
    }
  }

  /**
   * Get custom satellite imagery for any polygon and date
   * @param {Array} polygon - Array of {lat, lng} coordinates
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} type - 'rgb' or 'ndvi'
   * @param {number} cloudCoverage - Max cloud coverage (0-100)
   * @returns {Promise} - Imagery data
   */
  async getCustomImagery(polygon, date, type = 'rgb', cloudCoverage = 20) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/satellite/custom-imagery`,
        {
          polygon,
          date,
          type,
          cloud_coverage: cloudCoverage
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching custom imagery:', error);
      throw error;
    }
  }

  /**
   * Load imagery data and convert to image layers
   * @param {object} imageryData - Response from getProjectImagery
   * @returns {object} - Image layers ready for display
   */
  processImageryData(imageryData) {
    if (!imageryData || !imageryData.change_detected) {
      return null;
    }

    return {
      baseline: {
        rgb: imageryData.baseline.rgb.success ? imageryData.baseline.rgb.image : null,
        ndvi: imageryData.baseline.ndvi.success ? imageryData.baseline.ndvi.image : null,
        date: imageryData.baseline.date,
        dateRange: imageryData.baseline.rgb.date_range
      },
      monitoring: {
        rgb: imageryData.monitoring.rgb.success ? imageryData.monitoring.rgb.image : null,
        ndvi: imageryData.monitoring.ndvi.success ? imageryData.monitoring.ndvi.image : null,
        date: imageryData.monitoring.date,
        dateRange: imageryData.monitoring.rgb.date_range
      }
    };
  }
}

export default new SentinelHubService();
