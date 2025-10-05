// Frontend service for satellite reliability predictions

export interface DowntimePrediction {
  success: boolean;
  data: {
    satellite: string;
    prediction: {
      downtimeProbability: number;
      confidence: number;
      recommendation: string;
    };
    factors: {
      spaceWeather: number;
      environmental: number;
      temporal: number;
      historical: number;
    };
    analysis: {
      historicalData: {
        totalScenes: number;
        dailyAvailability: number;
        downtimeEvents: number;
      };
      spaceWeather: {
        avgKpIndex: number;
        geomagneticStorms: number;
      };
      environmental: {
        avgCloudCover: number;
        avgRainfall: number;
      };
    };
    metadata: {
      dateRange: { startDate: string; endDate: string };
      timestamp: string;
    };
  };
}

export interface ModelPerformance {
  success: boolean;
  data: {
    modelMetrics: {
      isTrained: boolean;
      featureWeights: Record<string, number>;
      trainingSamples: number;
      accuracy: number;
      dataSources?: string[];
      latestSpaceWeather?: {
        kpIndex: number;
        solarFlux: number;
        geomagneticStorm: boolean;
      };
      latestEnvironmental?: {
        avgCloudCover: number;
        avgRainfall: number;
        temperature: number;
        humidity: number;
        pressure: number;
      };
    };
    featureImportance: Array<{ feature: string; weight: number }>;
    dataSourceStatus?: Record<string, string>;
    timestamp: string;
  };
}

class ReliabilityAPIService {
  protected baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL || 'https://us-central1-quick-sat.cloudfunctions.net';
  }

  async predictDowntime(satelliteId: string): Promise<DowntimePrediction> {
    try {
      const response = await fetch(`${this.baseURL}/predictDowntimeEnhanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          satellite: satelliteId,
          coordinates: { lat: 40.7128, lon: -74.006 }, // New York City - has weather data
          startDate: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching downtime prediction:', error);
      throw error;
    }
  }

  async getModelPerformance(): Promise<ModelPerformance> {
    try {
      const response = await fetch(`${this.baseURL}/getEnhancedModelPerformance`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching model performance:', error);
      throw error;
    }
  }
}

export const reliabilityAPIService = new ReliabilityAPIService();

export interface ForecastDay {
  date: string;
  dayName: string;
  downtimeRisk: number;
  reliability: number;
  factors: {
    spaceWeather: number;
    environmental: number;
    historical: number;
    temporal: number;
    weather: number;
    solar: number;
  };
  recommendation: string;
  forecastData: {
    cloudCover: number;
    kpIndex: number;
    temperature: number;
    precipitation: number;
  };
}

export interface SevenDayForecast {
  success: boolean;
  data: {
    satellite: string;
    forecast: ForecastDay[];
    metadata: {
      coordinates: { lat: number; lon: number };
      generatedAt: string;
      historicalDataPoints: number;
      dataSources: {
        landsat: boolean;
        spaceWeather: boolean;
        noaaWeather: boolean;
        solarActivity: boolean;
        gpmRainfall: boolean;
      };
    };
  };
}

class ReliabilityAPIServiceExtended extends ReliabilityAPIService {
  async get7DayForecast(satelliteId: string, coordinates?: { lat: number; lon: number }): Promise<SevenDayForecast> {
    try {
      const response = await fetch(`${this.baseURL}/get7DayForecast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          satellite: satelliteId,
          coordinates: coordinates || { lat: 40.7128, lon: -74.006 }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching 7-day forecast:', error);
      throw error;
    }
  }
}

export const reliabilityAPIServiceExtended = new ReliabilityAPIServiceExtended();
