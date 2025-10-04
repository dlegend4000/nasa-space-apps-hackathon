import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { satelliteDataService } from './services/nasa-apis';
import cors from 'cors';

// Initialize Firebase Admin
admin.initializeApp();

// CORS middleware
const corsHandler = cors({ origin: true });

// Types for satellite data
export interface SatelliteImagery {
  satellite: string;
  date: string;
  cloudCover: number;
  downloadUrl: string;
  thumbnailUrl: string;
  coordinates: {
    lat: number;
    lon: number;
  };
}

export interface AtmosphericData {
  satellite: string;
  date: string;
  co2Concentration: number;
  latitude: number;
  longitude: number;
  downloadUrl: string;
}

export interface WeatherData {
  satellite: string;
  date: string;
  precipitation: number;
  latitude: number;
  longitude: number;
  downloadUrl: string;
}

export interface SoilMoistureData {
  satellite: string;
  date: string;
  soilMoisture: number;
  latitude: number;
  longitude: number;
  downloadUrl: string;
}

// Health check function
export const healthCheck = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, () => {
    const apiStatus = {
      nasaEarthdata: !!functions.config().nasa?.earthdata_token,
      usgsEarthExplorer: !!functions.config().usgs?.api_key,
      googleEarthEngine: !!(functions.config().google?.earth_engine_api_key && functions.config().google?.cloud_project_id)
    };

    res.json({
      success: true,
      status: 'healthy',
      apis: apiStatus,
      timestamp: new Date().toISOString()
    });
  });
});

// Get available satellites
export const getSatellites = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, () => {
    const satellites = [
      {
        name: 'Landsat-8',
        type: 'Earth Imaging',
        operator: 'USGS + NASA',
        dataTypes: ['Surface Reflectance', 'Thermal Imagery', 'Land Cover'],
        apis: ['USGS EarthExplorer']
      },
      {
        name: 'Landsat-9',
        type: 'Earth Imaging',
        operator: 'USGS + NASA',
        dataTypes: ['Surface Reflectance', 'Thermal Imagery', 'Land Cover'],
        apis: ['USGS EarthExplorer']
      },
      {
        name: 'OCO-2',
        type: 'Atmospheric Monitoring',
        operator: 'NASA JPL',
        dataTypes: ['CO₂ Concentration', 'Atmospheric Data', 'Climate Data'],
        apis: ['NASA Earthdata']
      },
      {
        name: 'OCO-3',
        type: 'Atmospheric Monitoring',
        operator: 'NASA JPL',
        dataTypes: ['CO₂ Concentration', 'Atmospheric Data', 'Climate Data'],
        apis: ['NASA Earthdata']
      },
      {
        name: 'GPM',
        type: 'Weather Monitoring',
        operator: 'NASA + JAXA',
        dataTypes: ['Precipitation', 'Rainfall', 'Snowfall', 'Weather Data'],
        apis: ['NASA Earthdata']
      },
      {
        name: 'SMAP',
        type: 'Environmental Monitoring',
        operator: 'NASA JPL',
        dataTypes: ['Soil Moisture', 'Freeze/Thaw State', 'Environmental Data'],
        apis: ['NASA Earthdata']
      }
    ];

    res.json({
      success: true,
      data: satellites,
      metadata: {
        count: satellites.length,
        timestamp: new Date().toISOString()
      }
    });
  });
});

// Get satellite data for a specific location
export const getSatelliteDataForLocation = functions.https.onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    try {
      const { lat, lon } = req.params;
      const { startDate, endDate, radius } = req.query;

      const coordinates = {
        lat: parseFloat(lat),
        lon: parseFloat(lon)
      };

      const start = startDate as string || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const end = endDate as string || new Date().toISOString().split('T')[0];
      const searchRadius = radius ? parseFloat(radius as string) : 0.1;

      const data = await satelliteDataService.getSatelliteDataForLocation(
        coordinates,
        start,
        end,
        searchRadius
      );

      res.json({
        success: true,
        data,
        metadata: {
          coordinates,
          dateRange: { start, end },
          radius: searchRadius,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error fetching satellite data for location:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch satellite data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
});

// Get data for a specific satellite
export const getDataForSatellite = functions.https.onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    try {
      const { satelliteName } = req.params;
      const { startDate, endDate, lat, lon } = req.query;

      const start = startDate as string || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const end = endDate as string || new Date().toISOString().split('T')[0];

      const coordinates = (lat && lon) ? {
        lat: parseFloat(lat as string),
        lon: parseFloat(lon as string)
      } : undefined;

      const data = await satelliteDataService.getDataForSatellite(
        satelliteName,
        start,
        end,
        coordinates
      );

      res.json({
        success: true,
        data,
        metadata: {
          satellite: satelliteName,
          dateRange: { start, end },
          coordinates,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error fetching satellite data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch satellite data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
});

// Get recent data for a satellite (last 7 days)
export const getRecentSatelliteData = functions.https.onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    try {
      const { satelliteName } = req.params;
      const { lat, lon } = req.query;

      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const coordinates = (lat && lon) ? {
        lat: parseFloat(lat as string),
        lon: parseFloat(lon as string)
      } : undefined;

      const data = await satelliteDataService.getDataForSatellite(
        satelliteName,
        startDate,
        endDate,
        coordinates
      );

      res.json({
        success: true,
        data,
        metadata: {
          satellite: satelliteName,
          dateRange: { startDate, endDate },
          coordinates,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error fetching recent satellite data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch recent satellite data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
});