"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentSatelliteData = exports.getDataForSatellite = exports.getSatelliteDataForLocation = exports.getSatellites = exports.healthCheck = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const nasa_apis_1 = require("./services/nasa-apis");
const cors_1 = __importDefault(require("cors"));
// Initialize Firebase Admin
admin.initializeApp();
// CORS middleware
const corsHandler = (0, cors_1.default)({ origin: true });
// Health check function
exports.healthCheck = functions.https.onRequest((req, res) => {
    return corsHandler(req, res, () => {
        var _a, _b, _c, _d;
        const apiStatus = {
            nasaEarthdata: !!((_a = functions.config().nasa) === null || _a === void 0 ? void 0 : _a.earthdata_token),
            usgsEarthExplorer: !!((_b = functions.config().usgs) === null || _b === void 0 ? void 0 : _b.api_key),
            googleEarthEngine: !!(((_c = functions.config().google) === null || _c === void 0 ? void 0 : _c.earth_engine_api_key) && ((_d = functions.config().google) === null || _d === void 0 ? void 0 : _d.cloud_project_id))
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
exports.getSatellites = functions.https.onRequest((req, res) => {
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
exports.getSatelliteDataForLocation = functions.https.onRequest(async (req, res) => {
    return corsHandler(req, res, async () => {
        try {
            const { lat, lon } = req.params;
            const { startDate, endDate, radius } = req.query;
            const coordinates = {
                lat: parseFloat(lat),
                lon: parseFloat(lon)
            };
            const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const end = endDate || new Date().toISOString().split('T')[0];
            const searchRadius = radius ? parseFloat(radius) : 0.1;
            const data = await nasa_apis_1.satelliteDataService.getSatelliteDataForLocation(coordinates, start, end, searchRadius);
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
        }
        catch (error) {
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
exports.getDataForSatellite = functions.https.onRequest(async (req, res) => {
    return corsHandler(req, res, async () => {
        try {
            const { satelliteName } = req.params;
            const { startDate, endDate, lat, lon } = req.query;
            const start = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const end = endDate || new Date().toISOString().split('T')[0];
            const coordinates = (lat && lon) ? {
                lat: parseFloat(lat),
                lon: parseFloat(lon)
            } : undefined;
            const data = await nasa_apis_1.satelliteDataService.getDataForSatellite(satelliteName, start, end, coordinates);
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
        }
        catch (error) {
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
exports.getRecentSatelliteData = functions.https.onRequest(async (req, res) => {
    return corsHandler(req, res, async () => {
        try {
            const { satelliteName } = req.params;
            const { lat, lon } = req.query;
            const endDate = new Date().toISOString().split('T')[0];
            const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const coordinates = (lat && lon) ? {
                lat: parseFloat(lat),
                lon: parseFloat(lon)
            } : undefined;
            const data = await nasa_apis_1.satelliteDataService.getDataForSatellite(satelliteName, startDate, endDate, coordinates);
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
        }
        catch (error) {
            console.error('Error fetching recent satellite data:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch recent satellite data',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
});
//# sourceMappingURL=index.js.map