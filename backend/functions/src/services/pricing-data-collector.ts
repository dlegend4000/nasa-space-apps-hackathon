import axios from 'axios';
import { getConfig } from './nasa-apis';

// Pricing data interfaces
export interface LandsatSTACMetadata {
  sceneId: string;
  timestamp: string;
  cloudCover: number;
  coordinates: {
    lat: number;
    lon: number;
  };
  quality: 'high' | 'medium' | 'low';
  season: 'spring' | 'summer' | 'fall' | 'winter';
}

export interface GPMRainfallData {
  date: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  precipitation: number;
  weatherRisk: 'low' | 'medium' | 'high';
}

export interface BookingLogEntry {
  region: string;
  date: string;
  serviceType: string;
  demandVolume: number;
  pricePaid: number;
  coordinates: {
    lat: number;
    lon: number;
  };
}

export interface PricingFeatures {
  // Supply factors
  observationDensity: number; // Scenes per month in region
  averageCloudCover: number; // 0-100%
  dataQuality: number; // 0-1 score
  
  // Demand factors
  demandVolume: number; // Bookings per month
  seasonalDemand: number; // Seasonal multiplier
  
  // Environmental factors
  weatherRisk: number; // 0-1 score
  rainfallFrequency: number; // Days with rain per month
  
  // Temporal factors
  season: number; // 0-3 (spring, summer, fall, winter)
  month: number; // 1-12
  dayOfWeek: number; // 0-6
}

export interface PricingModel {
  basePrice: number;
  multiplier: number; // 0.8x to 1.6x
  confidence: number; // 0-1
  factors: {
    supply: number;
    demand: number;
    environmental: number;
    temporal: number;
  };
}

class PricingDataCollector {
  private nasaToken: string;
  private usgsApiKey: string;

  constructor() {
    const config = getConfig();
    this.nasaToken = config.nasaEarthdataToken || '';
    this.usgsApiKey = config.usgsApiKey || '';
  }

  // 1. Collect Landsat STAC metadata for supply analysis
  async collectLandsatSTACData(
    coordinates: { lat: number; lon: number },
    startDate: string,
    endDate: string,
    radius: number = 0.1 // ~11km radius
  ): Promise<LandsatSTACMetadata[]> {
    try {
      // Query NASA CMR for Landsat scenes
      const cmrUrl = 'https://cmr.earthdata.nasa.gov/search/granules.json';
      const params = {
        collection_concept_id: 'C2021957657-LPCLOUD', // Landsat 8/9 Collection 2
        bounding_box: `${coordinates.lon - radius},${coordinates.lat - radius},${coordinates.lon + radius},${coordinates.lat + radius}`,
        temporal: `${startDate}T00:00:00Z,${endDate}T23:59:59Z`,
        page_size: 2000
      };

      const response = await axios.get(cmrUrl, {
        params,
        headers: {
          'Authorization': `Bearer ${this.nasaToken}`
        }
      });

      const granules = response.data.feed.entry || [];
      
      return granules.map((granule: any) => {
        const attributes = granule.umm?.AdditionalAttributes || [];
        const cloudCoverAttr = attributes.find((attr: any) => 
          attr.Name === 'CLOUD_COVER' || attr.Name === 'Cloud Cover'
        );
        
        const cloudCover = cloudCoverAttr ? parseFloat(cloudCoverAttr.Values[0]) : 0;
        const timestamp = granule.time_start;
        const season = this.getSeason(timestamp);
        
        return {
          sceneId: granule.concept_id,
          timestamp,
          cloudCover,
          coordinates,
          quality: this.assessDataQuality(cloudCover),
          season
        };
      });
    } catch (error) {
      console.error('Error collecting Landsat STAC data:', error);
      // Return mock data for development
      return this.generateMockLandsatData(coordinates, startDate, endDate);
    }
  }

  // 2. Collect GPM rainfall data for weather risk
  async collectGPMRainfallData(
    coordinates: { lat: number; lon: number },
    startDate: string,
    endDate: string
  ): Promise<GPMRainfallData[]> {
    try {
      // Query GPM data from NASA GES DISC
      const gpmUrl = 'https://gpm1.gesdisc.eosdis.nasa.gov/opendap/GPM_L3/GPM_3IMERGDF.06/';
      // This would require more complex API calls to GPM data
      // For now, return mock data structure
      
      return this.generateMockGPMData(coordinates, startDate, endDate);
    } catch (error) {
      console.error('Error collecting GPM rainfall data:', error);
      return this.generateMockGPMData(coordinates, startDate, endDate);
    }
  }

  // 3. Generate simulated booking log (in production, this would come from your database)
  generateBookingLog(
    coordinates: { lat: number; lon: number },
    startDate: string,
    endDate: string
  ): BookingLogEntry[] {
    // Simulate realistic booking patterns
    const bookings: BookingLogEntry[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay();
      const month = date.getMonth();
      
      // Simulate higher demand on weekdays and certain seasons
      const baseDemand = dayOfWeek >= 1 && dayOfWeek <= 5 ? 0.8 : 0.3;
      const seasonalMultiplier = month >= 3 && month <= 8 ? 1.2 : 0.8; // Higher in spring/summer
      
      const demandVolume = Math.random() * baseDemand * seasonalMultiplier;
      
      if (demandVolume > 0.2) {
        bookings.push({
          region: `${coordinates.lat.toFixed(2)},${coordinates.lon.toFixed(2)}`,
          date: date.toISOString().split('T')[0],
          serviceType: this.getRandomServiceType(),
          demandVolume,
          pricePaid: this.getRandomPrice(),
          coordinates
        });
      }
    }
    
    return bookings;
  }

  // 4. Extract features for ML model
  extractPricingFeatures(
    landsatData: LandsatSTACMetadata[],
    gpmData: GPMRainfallData[],
    bookingData: BookingLogEntry[],
    targetDate: string
  ): PricingFeatures {
    const targetMonth = new Date(targetDate).getMonth();
    const targetSeason = this.getSeason(targetDate);
    
    // Supply factors
    const observationDensity = landsatData.length / 30; // Scenes per month
    const averageCloudCover = landsatData.length > 0 ? 
      landsatData.reduce((sum, scene) => sum + scene.cloudCover, 0) / landsatData.length : 50;
    const dataQuality = landsatData.length > 0 ? 
      landsatData.filter(scene => scene.quality === 'high').length / landsatData.length : 0.5;
    
    // Demand factors
    const demandVolume = bookingData.reduce((sum, booking) => sum + booking.demandVolume, 0);
    const seasonalDemand = this.getSeasonalDemandMultiplier(targetSeason);
    
    // Environmental factors
    const weatherRisk = gpmData.length > 0 ? 
      gpmData.reduce((sum, day) => sum + (day.precipitation > 5 ? 1 : 0), 0) / gpmData.length : 0.3;
    const rainfallFrequency = gpmData.length > 0 ? 
      gpmData.filter(day => day.precipitation > 0.1).length / gpmData.length : 0.2;
    
    return {
      observationDensity,
      averageCloudCover: averageCloudCover / 100, // Normalize to 0-1
      dataQuality,
      demandVolume,
      seasonalDemand,
      weatherRisk,
      rainfallFrequency,
      season: targetSeason,
      month: targetMonth,
      dayOfWeek: new Date(targetDate).getDay()
    };
  }

  // Helper methods
  private getSeason(dateString: string): number {
    const month = new Date(dateString).getMonth();
    if (month >= 2 && month <= 4) return 0; // Spring
    if (month >= 5 && month <= 7) return 1; // Summer
    if (month >= 8 && month <= 10) return 2; // Fall
    return 3; // Winter
  }

  private assessDataQuality(cloudCover: number): 'high' | 'medium' | 'low' {
    if (cloudCover < 20) return 'high';
    if (cloudCover < 50) return 'medium';
    return 'low';
  }

  private getSeasonalDemandMultiplier(season: number): number {
    const multipliers = [1.1, 1.3, 0.9, 0.7]; // Spring, Summer, Fall, Winter
    return multipliers[season];
  }

  private getRandomServiceType(): string {
    const services = ['yield-prediction', 'irrigation-optimization', 'property-valuation', 'emission-monitoring'];
    return services[Math.floor(Math.random() * services.length)];
  }

  private getRandomPrice(): number {
    return Math.random() * 200 + 100; // $100-$300
  }

  private generateMockLandsatData(
    coordinates: { lat: number; lon: number },
    startDate: string,
    endDate: string
  ): LandsatSTACMetadata[] {
    const data: LandsatSTACMetadata[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Generate 2-3 scenes per month
    const daysBetweenScenes = 15;
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + daysBetweenScenes)) {
      const cloudCover = Math.random() * 80; // 0-80% cloud cover
      data.push({
        sceneId: `LANDSAT_${date.getTime()}`,
        timestamp: date.toISOString(),
        cloudCover,
        coordinates,
        quality: this.assessDataQuality(cloudCover),
        season: this.getSeasonName(date.getMonth())
      });
    }
    
    return data;
  }

  private generateMockGPMData(
    coordinates: { lat: number; lon: number },
    startDate: string,
    endDate: string
  ): GPMRainfallData[] {
    const data: GPMRainfallData[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const precipitation = Math.random() * 20; // 0-20mm
      data.push({
        date: date.toISOString().split('T')[0],
        coordinates,
        precipitation,
        weatherRisk: precipitation > 10 ? 'high' : precipitation > 5 ? 'medium' : 'low'
      });
    }
    
    return data;
  }

  private getSeasonName(month: number): 'spring' | 'summer' | 'fall' | 'winter' {
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }
}

export const pricingDataCollector = new PricingDataCollector();
