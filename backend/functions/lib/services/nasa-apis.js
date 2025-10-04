"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.satelliteDataService = exports.SatelliteDataService = exports.GoogleEarthEngineAPI = exports.USGSEarthExplorerAPI = exports.NASAEarthdataAPI = void 0;
const axios_1 = __importDefault(require("axios"));
// NASA Earthdata API configuration
const NASA_EARTHDATA_BASE_URL = 'https://cmr.earthdata.nasa.gov';
const USGS_EARTHEXPLORER_BASE_URL = 'https://earthexplorer.usgs.gov/inventory/json';
// Get environment variables from Firebase Functions config
const getConfig = () => {
    var _a, _b, _c, _d;
    const functions = require('firebase-functions');
    return {
        nasaEarthdataToken: (_a = functions.config().nasa) === null || _a === void 0 ? void 0 : _a.earthdata_token,
        usgsApiKey: (_b = functions.config().usgs) === null || _b === void 0 ? void 0 : _b.api_key,
        googleEarthEngineApiKey: (_c = functions.config().google) === null || _c === void 0 ? void 0 : _c.earth_engine_api_key,
        googleCloudProjectId: (_d = functions.config().google) === null || _d === void 0 ? void 0 : _d.cloud_project_id
    };
};
// NASA Earthdata API functions
class NASAEarthdataAPI {
    constructor() {
        const config = getConfig();
        this.token = config.nasaEarthdataToken || '';
        if (!this.token) {
            console.warn('NASA_EARTHDATA_TOKEN not found in Firebase Functions config');
        }
    }
    static getInstance() {
        if (!NASAEarthdataAPI.instance) {
            NASAEarthdataAPI.instance = new NASAEarthdataAPI();
        }
        return NASAEarthdataAPI.instance;
    }
    // Search for OCO-2/3 atmospheric data
    async searchAtmosphericData(satellite, startDate, endDate, bbox) {
        try {
            const params = {
                collection_concept_id: satellite === 'OCO-2' ? 'C179003030-ORNL_DAAC' : 'C179003030-ORNL_DAAC',
                temporal: `${startDate}T00:00:00Z,${endDate}T23:59:59Z`,
                page_size: 100,
                ...(bbox && { bounding_box: bbox.join(',') })
            };
            const response = await axios_1.default.get(`${NASA_EARTHDATA_BASE_URL}/search/granules.json`, {
                params,
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.feed.entry.map((entry) => {
                var _a, _b;
                return ({
                    satellite,
                    date: entry.time_start,
                    co2Concentration: 0,
                    latitude: 0,
                    longitude: 0,
                    downloadUrl: ((_b = (_a = entry.links) === null || _a === void 0 ? void 0 : _a.find((link) => link.rel === 'http://esipfed.org/ns/fedsearch/1.1/data#')) === null || _b === void 0 ? void 0 : _b.href) || ''
                });
            });
        }
        catch (error) {
            console.error('Error fetching atmospheric data:', error);
            throw new Error('Failed to fetch atmospheric data');
        }
    }
    // Search for GPM precipitation data
    async searchPrecipitationData(startDate, endDate, bbox) {
        try {
            const params = {
                collection_concept_id: 'C179003030-GES_DISC',
                temporal: `${startDate}T00:00:00Z,${endDate}T23:59:59Z`,
                page_size: 100,
                ...(bbox && { bounding_box: bbox.join(',') })
            };
            const response = await axios_1.default.get(`${NASA_EARTHDATA_BASE_URL}/search/granules.json`, {
                params,
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.feed.entry.map((entry) => {
                var _a, _b;
                return ({
                    satellite: 'GPM',
                    date: entry.time_start,
                    precipitation: 0,
                    latitude: 0,
                    longitude: 0,
                    downloadUrl: ((_b = (_a = entry.links) === null || _a === void 0 ? void 0 : _a.find((link) => link.rel === 'http://esipfed.org/ns/fedsearch/1.1/data#')) === null || _b === void 0 ? void 0 : _b.href) || ''
                });
            });
        }
        catch (error) {
            console.error('Error fetching precipitation data:', error);
            throw new Error('Failed to fetch precipitation data');
        }
    }
    // Search for SMAP soil moisture data
    async searchSoilMoistureData(startDate, endDate, bbox) {
        try {
            const params = {
                collection_concept_id: 'C179003030-NSIDC_TS1',
                temporal: `${startDate}T00:00:00Z,${endDate}T23:59:59Z`,
                page_size: 100,
                ...(bbox && { bounding_box: bbox.join(',') })
            };
            const response = await axios_1.default.get(`${NASA_EARTHDATA_BASE_URL}/search/granules.json`, {
                params,
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.feed.entry.map((entry) => {
                var _a, _b;
                return ({
                    satellite: 'SMAP',
                    date: entry.time_start,
                    soilMoisture: 0,
                    latitude: 0,
                    longitude: 0,
                    downloadUrl: ((_b = (_a = entry.links) === null || _a === void 0 ? void 0 : _a.find((link) => link.rel === 'http://esipfed.org/ns/fedsearch/1.1/data#')) === null || _b === void 0 ? void 0 : _b.href) || ''
                });
            });
        }
        catch (error) {
            console.error('Error fetching soil moisture data:', error);
            throw new Error('Failed to fetch soil moisture data');
        }
    }
}
exports.NASAEarthdataAPI = NASAEarthdataAPI;
// USGS EarthExplorer API functions
class USGSEarthExplorerAPI {
    constructor() {
        const config = getConfig();
        this.apiKey = config.usgsApiKey || '';
        if (!this.apiKey) {
            console.warn('USGS_API_KEY not found in Firebase Functions config');
        }
    }
    static getInstance() {
        if (!USGSEarthExplorerAPI.instance) {
            USGSEarthExplorerAPI.instance = new USGSEarthExplorerAPI();
        }
        return USGSEarthExplorerAPI.instance;
    }
    // Search for Landsat imagery
    async searchLandsatImagery(satellite, startDate, endDate, bbox) {
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
            const response = await axios_1.default.post(`${USGS_EARTHEXPLORER_BASE_URL}/search`, params, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data.data.results.map((result) => ({
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
        }
        catch (error) {
            console.error('Error fetching Landsat imagery:', error);
            throw new Error('Failed to fetch Landsat imagery');
        }
    }
}
exports.USGSEarthExplorerAPI = USGSEarthExplorerAPI;
// Google Earth Engine API functions (placeholder)
class GoogleEarthEngineAPI {
    constructor() {
        const config = getConfig();
        this.apiKey = config.googleEarthEngineApiKey || '';
        this.projectId = config.googleCloudProjectId || '';
        if (!this.apiKey || !this.projectId) {
            console.warn('Google Earth Engine API credentials not found in Firebase Functions config');
        }
    }
    static getInstance() {
        if (!GoogleEarthEngineAPI.instance) {
            GoogleEarthEngineAPI.instance = new GoogleEarthEngineAPI();
        }
        return GoogleEarthEngineAPI.instance;
    }
    // Process satellite imagery (placeholder implementation)
    async processSatelliteImagery(satellite, startDate, endDate, coordinates) {
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
exports.GoogleEarthEngineAPI = GoogleEarthEngineAPI;
// Main API service class
class SatelliteDataService {
    constructor() {
        this.nasaAPI = NASAEarthdataAPI.getInstance();
        this.usgsAPI = USGSEarthExplorerAPI.getInstance();
        this.googleAPI = GoogleEarthEngineAPI.getInstance();
    }
    // Get all satellite data for a specific location and time range
    async getSatelliteDataForLocation(coordinates, startDate, endDate, radius = 0.1) {
        const bbox = [
            coordinates.lon - radius,
            coordinates.lat - radius,
            coordinates.lon + radius,
            coordinates.lat + radius // north
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
        }
        catch (error) {
            console.error('Error fetching satellite data:', error);
            throw new Error('Failed to fetch satellite data');
        }
    }
    // Get data for a specific satellite
    async getDataForSatellite(satellite, startDate, endDate, coordinates) {
        const bbox = coordinates ? [
            coordinates.lon - 0.1,
            coordinates.lat - 0.1,
            coordinates.lon + 0.1,
            coordinates.lat + 0.1
        ] : undefined;
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
exports.SatelliteDataService = SatelliteDataService;
// Export singleton instance
exports.satelliteDataService = new SatelliteDataService();
//# sourceMappingURL=nasa-apis.js.map