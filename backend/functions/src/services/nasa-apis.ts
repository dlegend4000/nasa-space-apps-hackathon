import axios from 'axios';

// NASA Earthdata API configuration
const NASA_EARTHDATA_BASE_URL = 'https://cmr.earthdata.nasa.gov';
const USGS_EARTHEXPLORER_BASE_URL = 'https://earthexplorer.usgs.gov/inventory/json';

// Get environment variables from Firebase Functions config
const getConfig = () => {
  const functions = require('firebase-functions');
  return {
    nasaEarthdataToken: functions.config().nasa?.earthdata_token,
    usgsApiKey: functions.config().usgs?.api_key,
    googleEarthEngineApiKey: functions.config().google?.earth_engine_api_key,
    googleCloudProjectId: functions.config().google?.cloud_project_id
  };
};

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

// NASA Earthdata API functions
export class NASAEarthdataAPI {
  private static instance: NASAEarthdataAPI;
  private token: string;

  constructor() {
    const config = getConfig();
    this.token = config.nasaEarthdataToken || '';
    if (!this.token) {
      console.warn('NASA_EARTHDATA_TOKEN not found in Firebase Functions config');
    }
  }

  static getInstance(): NASAEarthdataAPI {
    if (!NASAEarthdataAPI.instance) {
      NASAEarthdataAPI.instance = new NASAEarthdataAPI();
    }
    return NASAEarthdataAPI.instance;
  }

  // Search for OCO-2/3 atmospheric data
  async searchAtmosphericData(
    satellite: 'OCO-2' | 'OCO-3',
    startDate: string,
    endDate: string,
    bbox?: [number, number, number, number]
  ): Promise<AtmosphericData[]> {
    try {
      const params = {
        collection_concept_id: satellite === 'OCO-2' ? 'C179003030-ORNL_DAAC' : 'C179003030-ORNL_DAAC',
        temporal: `${startDate}T00:00:00Z,${endDate}T23:59:59Z`,
        page_size: 100,
        ...(bbox && { bounding_box: bbox.join(',') })
      };

      const response = await axios.get(`${NASA_EARTHDATA_BASE_URL}/search/granules.json`, {
        params,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.feed.entry.map((entry: any) => ({
        satellite,
        date: entry.time_start,
        co2Concentration: 0, // Would need to parse from actual data
        latitude: 0, // Would need to extract from geometry
        longitude: 0,
        downloadUrl: entry.links?.find((link: any) => link.rel === 'http://esipfed.org/ns/fedsearch/1.1/data#')?.href || ''
      }));
    } catch (error) {
      console.error('Error fetching atmospheric data:', error);
      throw new Error('Failed to fetch atmospheric data');
    }
  }

  // Search for GPM precipitation data
  async searchPrecipitationData(
    startDate: string,
    endDate: string,
    bbox?: [number, number, number, number]
  ): Promise<WeatherData[]> {
    try {
      const params = {
        collection_concept_id: 'C179003030-GES_DISC',
        temporal: `${startDate}T00:00:00Z,${endDate}T23:59:59Z`,
        page_size: 100,
        ...(bbox && { bounding_box: bbox.join(',') })
      };

      const response = await axios.get(`${NASA_EARTHDATA_BASE_URL}/search/granules.json`, {
        params,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.feed.entry.map((entry: any) => ({
        satellite: 'GPM',
        date: entry.time_start,
        precipitation: 0, // Would need to parse from actual data
        latitude: 0,
        longitude: 0,
        downloadUrl: entry.links?.find((link: any) => link.rel === 'http://esipfed.org/ns/fedsearch/1.1/data#')?.href || ''
      }));
    } catch (error) {
      console.error('Error fetching precipitation data:', error);
      throw new Error('Failed to fetch precipitation data');
    }
  }

  // Search for SMAP soil moisture data
  async searchSoilMoistureData(
    startDate: string,
    endDate: string,
    bbox?: [number, number, number, number]
  ): Promise<SoilMoistureData[]> {
    try {
      const params = {
        collection_concept_id: 'C179003030-NSIDC_TS1',
        temporal: `${startDate}T00:00:00Z,${endDate}T23:59:59Z`,
        page_size: 100,
        ...(bbox && { bounding_box: bbox.join(',') })
      };

      const response = await axios.get(`${NASA_EARTHDATA_BASE_URL}/search/granules.json`, {
        params,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.feed.entry.map((entry: any) => ({
        satellite: 'SMAP',
        date: entry.time_start,
        soilMoisture: 0, // Would need to parse from actual data
        latitude: 0,
        longitude: 0,
        downloadUrl: entry.links?.find((link: any) => link.rel === 'http://esipfed.org/ns/fedsearch/1.1/data#')?.href || ''
      }));
    } catch (error) {
      console.error('Error fetching soil moisture data:', error);
      throw new Error('Failed to fetch soil moisture data');
    }
  }
}

// USGS EarthExplorer API functions
export class USGSEarthExplorerAPI {
  private static instance: USGSEarthExplorerAPI;
  private apiKey: string;

  constructor() {
    const config = getConfig();
    this.apiKey = config.usgsApiKey || '';
    if (!this.apiKey) {
      console.warn('USGS_API_KEY not found in Firebase Functions config');
    }
  }

  static getInstance(): USGSEarthExplorerAPI {
    if (!USGSEarthExplorerAPI.instance) {
      USGSEarthExplorerAPI.instance = new USGSEarthExplorerAPI();
    }
    return USGSEarthExplorerAPI.instance;
  }

  // Search for Landsat imagery
  async searchLandsatImagery(
    satellite: 'LANDSAT_8' | 'LANDSAT_9',
    startDate: string,
    endDate: string,
    bbox?: [number, number, number, number]
  ): Promise<SatelliteImagery[]> {
    try {
      const params = {
        apiKey: this.apiKey,
        datasetName: satellite,
        spatialFilter: bbox ? {
          filterType: 'mbr',
          lowerLeft: {
            latitude: bbox[1],
            longitude: bbox[0]
          },
          upperRight: {
            latitude: bbox[3],
            longitude: bbox[2]
          }
        } : undefined,
        temporalFilter: {
          startDate,
          endDate
        },
        maxResults: 100
      };

      const response = await axios.post(`${USGS_EARTHEXPLORER_BASE_URL}/search`, params, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data.data.results.map((result: any) => ({
        satellite: satellite.replace('LANDSAT_', 'Landsat-'),
        date: result.acquisitionDate,
        cloudCover: result.cloudCover,
        downloadUrl: result.downloadUrl || '',
        thumbnailUrl: result.browseUrl || '',
        coordinates: {
          lat: result.spatialCoverage.coordinates[0][0][1],
          lon: result.spatialCoverage.coordinates[0][0][0]
        }
      }));
    } catch (error) {
      console.error('Error fetching Landsat imagery:', error);
      throw new Error('Failed to fetch Landsat imagery');
    }
  }
}

// Google Earth Engine API functions (placeholder)
export class GoogleEarthEngineAPI {
  private static instance: GoogleEarthEngineAPI;
  private apiKey: string;
  private projectId: string;

  constructor() {
    const config = getConfig();
    this.apiKey = config.googleEarthEngineApiKey || '';
    this.projectId = config.googleCloudProjectId || '';
    if (!this.apiKey || !this.projectId) {
      console.warn('Google Earth Engine API credentials not found in Firebase Functions config');
    }
  }

  static getInstance(): GoogleEarthEngineAPI {
    if (!GoogleEarthEngineAPI.instance) {
      GoogleEarthEngineAPI.instance = new GoogleEarthEngineAPI();
    }
    return GoogleEarthEngineAPI.instance;
  }

  // Process satellite imagery (placeholder implementation)
  async processSatelliteImagery(
    satellite: string,
    startDate: string,
    endDate: string,
    coordinates: { lat: number; lon: number }
  ): Promise<any> {
    // This would require Google Earth Engine API setup
    // For now, return mock data
    return {
      satellite,
      processedData: 'Mock processed data',
      coordinates,
      dateRange: { startDate, endDate }
    };
  }
}

// Main API service class
export class SatelliteDataService {
  private nasaAPI: NASAEarthdataAPI;
  private usgsAPI: USGSEarthExplorerAPI;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private googleAPI: GoogleEarthEngineAPI;

  constructor() {
    this.nasaAPI = NASAEarthdataAPI.getInstance();
    this.usgsAPI = USGSEarthExplorerAPI.getInstance();
    this.googleAPI = GoogleEarthEngineAPI.getInstance();
  }

  // Get all satellite data for a specific location and time range
  async getSatelliteDataForLocation(
    coordinates: { lat: number; lon: number },
    startDate: string,
    endDate: string,
    radius: number = 0.1
  ) {
    const bbox: [number, number, number, number] = [
      coordinates.lon - radius, // west
      coordinates.lat - radius, // south
      coordinates.lon + radius, // east
      coordinates.lat + radius  // north
    ];

    try {
      const [atmosphericData, precipitationData, soilMoistureData, landsat8Data, landsat9Data] = await Promise.allSettled([
        this.nasaAPI.searchAtmosphericData('OCO-2', startDate, endDate, bbox),
        this.nasaAPI.searchPrecipitationData(startDate, endDate, bbox),
        this.nasaAPI.searchSoilMoistureData(startDate, endDate, bbox),
        this.usgsAPI.searchLandsatImagery('LANDSAT_8', startDate, endDate, bbox),
        this.usgsAPI.searchLandsatImagery('LANDSAT_9', startDate, endDate, bbox)
      ]);

      return {
        atmospheric: atmosphericData.status === 'fulfilled' ? atmosphericData.value : [],
        precipitation: precipitationData.status === 'fulfilled' ? precipitationData.value : [],
        soilMoisture: soilMoistureData.status === 'fulfilled' ? soilMoistureData.value : [],
        landsat8: landsat8Data.status === 'fulfilled' ? landsat8Data.value : [],
        landsat9: landsat9Data.status === 'fulfilled' ? landsat9Data.value : [],
        coordinates,
        dateRange: { startDate, endDate }
      };
    } catch (error) {
      console.error('Error fetching satellite data:', error);
      throw new Error('Failed to fetch satellite data');
    }
  }

  // Get data for a specific satellite
  async getDataForSatellite(
    satellite: string,
    startDate: string,
    endDate: string,
    coordinates?: { lat: number; lon: number }
  ) {
    const bbox = coordinates ? [
      coordinates.lon - 0.1,
      coordinates.lat - 0.1,
      coordinates.lon + 0.1,
      coordinates.lat + 0.1
    ] as [number, number, number, number] : undefined;

    switch (satellite.toUpperCase()) {
      case 'LANDSAT-8':
        return this.usgsAPI.searchLandsatImagery('LANDSAT_8', startDate, endDate, bbox);
      case 'LANDSAT-9':
        return this.usgsAPI.searchLandsatImagery('LANDSAT_9', startDate, endDate, bbox);
      case 'OCO-2':
        return this.nasaAPI.searchAtmosphericData('OCO-2', startDate, endDate, bbox);
      case 'OCO-3':
        return this.nasaAPI.searchAtmosphericData('OCO-3', startDate, endDate, bbox);
      case 'GPM':
        return this.nasaAPI.searchPrecipitationData(startDate, endDate, bbox);
      case 'SMAP':
        return this.nasaAPI.searchSoilMoistureData(startDate, endDate, bbox);
      default:
        throw new Error(`Unsupported satellite: ${satellite}`);
    }
  }
}

// Export singleton instance
export const satelliteDataService = new SatelliteDataService();