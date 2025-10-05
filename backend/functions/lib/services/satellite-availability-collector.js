"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.satelliteAvailabilityCollector = void 0;
const axios_1 = __importDefault(require("axios"));
const nasa_apis_1 = require("./nasa-apis");
class SatelliteAvailabilityCollector {
    constructor() {
        const config = (0, nasa_apis_1.getConfig)();
        this.nasaToken = config.nasaEarthdataToken || '';
    }
    // 1. Collect Landsat historical data using STAC API
    async collectLandsatHistoricalData(startDate, endDate, satellite = 'landsat-9') {
        var _a;
        try {
            console.log(`Collecting Landsat data for ${satellite} from ${startDate} to ${endDate}`);
            const url = "https://landsatlook.usgs.gov/stac-server/search";
            // Map satellite names to correct platform identifiers
            const platformMap = {
                'landsat-8': 'landsat-8',
                'landsat-9': 'landsat-9'
            };
            const platform = platformMap[satellite] || satellite;
            const params = {
                collections: ["landsat-c2l2-sr"],
                datetime: `${startDate}T00:00:00Z/${endDate}T23:59:59Z`,
                limit: 1000
            };
            const response = await axios_1.default.get(url, { params });
            const features = response.data.features || [];
            const scenes = features.map((feature) => {
                const props = feature.properties;
                const cloudCover = props["eo:cloud_cover"] || 0;
                return {
                    date: props.datetime.substring(0, 10),
                    satId: props.platform,
                    cloudCover,
                    sceneId: props["landsat:scene_id"],
                    quality: this.assessSceneQuality(cloudCover)
                };
            });
            console.log(`Collected ${scenes.length} scenes for ${satellite}`);
            return scenes;
        }
        catch (error) {
            console.error('Error collecting Landsat data:', error);
            console.error('Error details:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            // Don't fall back to mock data - throw the error so we can debug
            throw new Error(`Failed to collect Landsat data for ${satellite}: ${error.message}`);
        }
    }
    // 2. Calculate daily availability metrics
    calculateDailyAvailability(scenes, satellite) {
        const dailyScenes = scenes.reduce((acc, scene) => {
            if (!acc[scene.date]) {
                acc[scene.date] = [];
            }
            acc[scene.date].push(scene);
            return acc;
        }, {});
        const expectedScenesPerDay = this.getExpectedScenesPerDay(satellite);
        const dailyData = Object.entries(dailyScenes).map(([date, dayScenes]) => {
            const sceneCount = dayScenes.length;
            const avgCloudCover = dayScenes.reduce((sum, scene) => sum + scene.cloudCover, 0) / sceneCount;
            const qualityScore = dayScenes.filter(scene => scene.quality === 'high').length / sceneCount;
            // Calculate rolling average for comparison
            const recentDates = Object.keys(dailyScenes).sort().slice(-7);
            const recentSceneCounts = recentDates.map(d => { var _a; return ((_a = dailyScenes[d]) === null || _a === void 0 ? void 0 : _a.length) || 0; });
            const avgRecentScenes = recentSceneCounts.reduce((sum, count) => sum + count, 0) / recentSceneCounts.length;
            // Downtime flag: significantly fewer scenes than expected
            const downtimeFlag = (sceneCount < avgRecentScenes * 0.6 || sceneCount < expectedScenesPerDay * 0.5) ? 1 : 0;
            return {
                date,
                satId: satellite,
                sceneCount,
                expectedScenes: expectedScenesPerDay,
                downtimeFlag,
                avgCloudCover,
                qualityScore
            };
        });
        return dailyData.sort((a, b) => a.date.localeCompare(b.date));
    }
    // 3. Collect space weather data from NOAA SWPC
    async collectSpaceWeatherData(startDate, endDate) {
        var _a;
        try {
            console.log('Collecting space weather data from NOAA SWPC');
            // Collect Kp index data
            const kpResponse = await axios_1.default.get('https://services.swpc.noaa.gov/json/planetary_k_index_1m.json', {
                timeout: 10000
            });
            const kpData = kpResponse.data;
            // Collect solar flux data (using a working endpoint)
            let solarFluxData = [];
            try {
                const solarFluxResponse = await axios_1.default.get('https://services.swpc.noaa.gov/json/goes/goes-16-magnetics.json', {
                    timeout: 10000
                });
                solarFluxData = solarFluxResponse.data;
            }
            catch (solarError) {
                console.warn('Solar flux API failed, using default values:', solarError.message);
                // Use default solar flux data
                solarFluxData = [];
            }
            const kpByDate = this.processKpData(kpData, startDate, endDate);
            const solarFluxByDate = this.processSolarFluxData(solarFluxData, startDate, endDate);
            const spaceWeatherData = [];
            const start = new Date(startDate);
            const end = new Date(endDate);
            for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
                const dateStr = date.toISOString().split('T')[0];
                const kpIndex = kpByDate[dateStr] || 0;
                const solarFlux = solarFluxByDate[dateStr] || 100; // Default to 100 if no data
                spaceWeatherData.push({
                    date: dateStr,
                    kpIndex,
                    solarFlux,
                    geomagneticStorm: kpIndex >= 5
                });
            }
            console.log(`Collected space weather data for ${spaceWeatherData.length} days`);
            return spaceWeatherData;
        }
        catch (error) {
            console.error('Error collecting space weather data:', error);
            console.error('Error details:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            // Don't fall back to mock data - throw the error so we can debug
            throw new Error(`Failed to collect space weather data: ${error.message}`);
        }
    }
    // 4. Create ML training features
    createMLFeatures(availabilityData, spaceWeatherData) {
        const spaceWeatherMap = new Map(spaceWeatherData.map(sw => [sw.date, sw]));
        return availabilityData.map(avail => {
            const spaceWeather = spaceWeatherMap.get(avail.date);
            const date = new Date(avail.date);
            return {
                // Satellite features
                sceneCount: avail.sceneCount,
                expectedScenes: avail.expectedScenes,
                avgCloudCover: avail.avgCloudCover,
                qualityScore: avail.qualityScore,
                // Space weather features
                kpIndex: (spaceWeather === null || spaceWeather === void 0 ? void 0 : spaceWeather.kpIndex) || 0,
                solarFlux: (spaceWeather === null || spaceWeather === void 0 ? void 0 : spaceWeather.solarFlux) || 0,
                geomagneticStorm: (spaceWeather === null || spaceWeather === void 0 ? void 0 : spaceWeather.geomagneticStorm) || false,
                // Environmental features (will be populated by weather data collector)
                avgRainfall: 0,
                temperature: 0,
                // Temporal features
                dayOfWeek: date.getDay(),
                month: date.getMonth(),
                season: this.getSeason(date.getMonth()),
                // Target variable
                downtimeFlag: avail.downtimeFlag
            };
        });
    }
    // Helper methods
    assessSceneQuality(cloudCover) {
        if (cloudCover < 20)
            return 'high';
        if (cloudCover < 50)
            return 'medium';
        return 'low';
    }
    getExpectedScenesPerDay(satellite) {
        const expectedScenes = {
            'landsat-8': 250,
            'landsat-9': 250,
            'smap': 1000,
            'gpm': 2000,
            'oco-2': 100,
            'oco-3': 100
        };
        return expectedScenes[satellite.toLowerCase()] || 200;
    }
    getSeason(month) {
        if (month >= 2 && month <= 4)
            return 0; // Spring
        if (month >= 5 && month <= 7)
            return 1; // Summer
        if (month >= 8 && month <= 10)
            return 2; // Fall
        return 3; // Winter
    }
    processKpData(kpData, startDate, endDate) {
        const kpByDate = {};
        kpData.forEach(entry => {
            const date = new Date(entry.time_tag).toISOString().split('T')[0];
            if (date >= startDate && date <= endDate) {
                if (!kpByDate[date]) {
                    kpByDate[date] = [];
                }
                kpByDate[date].push(entry.kp_index);
            }
        });
        const result = {};
        Object.keys(kpByDate).forEach(date => {
            const values = kpByDate[date];
            result[date] = values.reduce((sum, val) => sum + val, 0) / values.length;
        });
        return result;
    }
    processSolarFluxData(solarFluxData, startDate, endDate) {
        const result = {};
        const start = new Date(startDate);
        const end = new Date(endDate);
        // Process solar flux data by date
        const fluxByDate = {};
        solarFluxData.forEach((entry) => {
            if (entry.time_tag) {
                const date = entry.time_tag.substring(0, 10);
                if (date >= startDate && date <= endDate) {
                    if (!fluxByDate[date]) {
                        fluxByDate[date] = [];
                    }
                    // Use XRS-A (0.5-4 Å) flux as primary metric
                    if (entry.flux && !isNaN(entry.flux)) {
                        fluxByDate[date].push(entry.flux);
                    }
                }
            }
        });
        // Calculate daily averages
        Object.keys(fluxByDate).forEach(date => {
            const values = fluxByDate[date];
            if (values.length > 0) {
                result[date] = values.reduce((sum, val) => sum + val, 0) / values.length;
            }
        });
        return result;
    }
    // Mock data generators
    generateMockLandsatData(startDate, endDate, satellite) {
        const scenes = [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        const expectedScenesPerDay = this.getExpectedScenesPerDay(satellite);
        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
            const dateStr = date.toISOString().split('T')[0];
            const isDowntime = Math.random() < 0.1; // 10% downtime
            const sceneCount = isDowntime ? Math.floor(expectedScenesPerDay * 0.3) : expectedScenesPerDay;
            for (let i = 0; i < sceneCount; i++) {
                scenes.push({
                    date: dateStr,
                    satId: satellite,
                    cloudCover: Math.random() * 100,
                    sceneId: `${satellite}_${dateStr}_${i}`,
                    quality: this.assessSceneQuality(Math.random() * 100)
                });
            }
        }
        return scenes;
    }
    generateMockSpaceWeatherData(startDate, endDate) {
        const data = [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
            const dateStr = date.toISOString().split('T')[0];
            const kpIndex = Math.random() * 9;
            data.push({
                date: dateStr,
                kpIndex,
                solarFlux: Math.random() * 200 + 50,
                geomagneticStorm: kpIndex >= 5
            });
        }
        return data;
    }
}
exports.satelliteAvailabilityCollector = new SatelliteAvailabilityCollector();
//# sourceMappingURL=satellite-availability-collector.js.map