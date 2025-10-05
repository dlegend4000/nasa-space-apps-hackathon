import axios from 'axios';
import { getConfig } from './nasa-apis';

// Satellite availability data interfaces
export interface SatelliteScene {
  date: string;
  satId: string;
  cloudCover: number;
  sceneId: string;
  quality: 'high' | 'medium' | 'low';
}

export interface DailyAvailability {
  date: string;
  satId: string;
  sceneCount: number;
  expectedScenes: number;
  downtimeFlag: number; // 0 = normal, 1 = downtime
  avgCloudCover: number;
  qualityScore: number;
}

export interface SpaceWeatherData {
  date: string;
  kpIndex: number; // Geomagnetic activity (0-9)
  solarFlux: number;
  geomagneticStorm: boolean;
}

export interface MLTrainingFeatures {
  // Satellite features
  sceneCount: number;
  expectedScenes: number;
  avgCloudCover: number;
  qualityScore: number;
  
  // Space weather features
  kpIndex: number;
  solarFlux: number;
  geomagneticStorm: boolean;
  
  // Environmental features
  avgRainfall: number;
  temperature: number;
  
  // Temporal features
  dayOfWeek: number;
  month: number;
  season: number;
  
  // Target variable
  downtimeFlag: number;
}

class SatelliteAvailabilityCollector {
  private nasaToken: string;

  constructor() {
    const config = getConfig();
    this.nasaToken = config.nasaEarthdataToken || '';
  }

  // 1. Collect Landsat historical data using STAC API
  async collectLandsatHistoricalData(
    startDate: string,
    endDate: string,
    satellite: string = 'landsat-9'
  ): Promise<SatelliteScene[]> {
    try {
      console.log(`Collecting Landsat data for ${satellite} from ${startDate} to ${endDate}`);
      
      const url = "https://landsatlook.usgs.gov/stac-server/search";
      
      // Map satellite names to correct platform identifiers
      const platformMap: Record<string, string> = {
        'landsat-8': 'landsat-8',
        'landsat-9': 'landsat-9'
      };
      
      const platform = platformMap[satellite] || satellite;
      
      const params = {
        collections: ["landsat-c2l2-sr"],
        datetime: `${startDate}T00:00:00Z/${endDate}T23:59:59Z`,
        limit: 1000
      };

      const response = await axios.get(url, { params });
      const features = response.data.features || [];
      
      const scenes: SatelliteScene[] = features.map((feature: any) => {
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
    } catch (error) {
      console.error('Error collecting Landsat data:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // Don't fall back to mock data - throw the error so we can debug
      throw new Error(`Failed to collect Landsat data for ${satellite}: ${error.message}`);
    }
  }

  // 2. Calculate daily availability metrics
  calculateDailyAvailability(
    scenes: SatelliteScene[],
    satellite: string
  ): DailyAvailability[] {
    const dailyScenes = scenes.reduce((acc, scene) => {
      if (!acc[scene.date]) {
        acc[scene.date] = [];
      }
      acc[scene.date].push(scene);
      return acc;
    }, {} as Record<string, SatelliteScene[]>);

    const expectedScenesPerDay = this.getExpectedScenesPerDay(satellite);

    const dailyData: DailyAvailability[] = Object.entries(dailyScenes).map(([date, dayScenes]) => {
      const sceneCount = dayScenes.length;
      const avgCloudCover = dayScenes.reduce((sum, scene) => sum + scene.cloudCover, 0) / sceneCount;
      const qualityScore = dayScenes.filter(scene => scene.quality === 'high').length / sceneCount;
      
      // Calculate rolling average for comparison
      const recentDates = Object.keys(dailyScenes).sort().slice(-7);
      const recentSceneCounts = recentDates.map(d => dailyScenes[d]?.length || 0);
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
  async collectSpaceWeatherData(
    startDate: string,
    endDate: string
  ): Promise<SpaceWeatherData[]> {
    try {
      console.log('Collecting space weather data from NOAA SWPC');
      
      // Collect Kp index data
      const kpResponse = await axios.get('https://services.swpc.noaa.gov/json/planetary_k_index_1m.json', {
        timeout: 10000
      });
      const kpData = kpResponse.data;
      
      // Collect solar flux data (using a working endpoint)
      let solarFluxData = [];
      try {
        const solarFluxResponse = await axios.get('https://services.swpc.noaa.gov/json/goes/goes-16-magnetics.json', {
          timeout: 10000
        });
        solarFluxData = solarFluxResponse.data;
      } catch (solarError) {
        console.warn('Solar flux API failed, using default values:', solarError.message);
        // Use default solar flux data
        solarFluxData = [];
      }
      
      const kpByDate = this.processKpData(kpData, startDate, endDate);
      const solarFluxByDate = this.processSolarFluxData(solarFluxData, startDate, endDate);
      
      const spaceWeatherData: SpaceWeatherData[] = [];
      
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
    } catch (error) {
      console.error('Error collecting space weather data:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // Don't fall back to mock data - throw the error so we can debug
      throw new Error(`Failed to collect space weather data: ${error.message}`);
    }
  }

  // 4. Create ML training features
  createMLFeatures(
    availabilityData: DailyAvailability[],
    spaceWeatherData: SpaceWeatherData[]
  ): MLTrainingFeatures[] {
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
        kpIndex: spaceWeather?.kpIndex || 0,
        solarFlux: spaceWeather?.solarFlux || 0,
        geomagneticStorm: spaceWeather?.geomagneticStorm || false,
        
        // Environmental features (will be populated by weather data collector)
        avgRainfall: 0, // Will be set by weather data collector
        temperature: 0, // Will be set by weather data collector
        
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
  private assessSceneQuality(cloudCover: number): 'high' | 'medium' | 'low' {
    if (cloudCover < 20) return 'high';
    if (cloudCover < 50) return 'medium';
    return 'low';
  }

  private getExpectedScenesPerDay(satellite: string): number {
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

  private getSeason(month: number): number {
    if (month >= 2 && month <= 4) return 0; // Spring
    if (month >= 5 && month <= 7) return 1; // Summer
    if (month >= 8 && month <= 10) return 2; // Fall
    return 3; // Winter
  }

  private processKpData(kpData: any[], startDate: string, endDate: string): Record<string, number> {
    const kpByDate: Record<string, number[]> = {};
    
    kpData.forEach(entry => {
      const date = new Date(entry.time_tag).toISOString().split('T')[0];
      if (date >= startDate && date <= endDate) {
        if (!kpByDate[date]) {
          kpByDate[date] = [];
        }
        kpByDate[date].push(entry.kp_index);
      }
    });

    const result: Record<string, number> = {};
    Object.keys(kpByDate).forEach(date => {
      const values = kpByDate[date];
      result[date] = values.reduce((sum, val) => sum + val, 0) / values.length;
    });

    return result;
  }

  private processSolarFluxData(solarFluxData: any[], startDate: string, endDate: string): Record<string, number> {
    const result: Record<string, number> = {};
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Process solar flux data by date
    const fluxByDate: Record<string, number[]> = {};
    
    solarFluxData.forEach((entry: any) => {
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
  private generateMockLandsatData(startDate: string, endDate: string, satellite: string): SatelliteScene[] {
    const scenes: SatelliteScene[] = [];
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

  private generateMockSpaceWeatherData(startDate: string, endDate: string): SpaceWeatherData[] {
    const data: SpaceWeatherData[] = [];
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

export const satelliteAvailabilityCollector = new SatelliteAvailabilityCollector();
