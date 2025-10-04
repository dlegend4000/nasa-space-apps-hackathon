// Frontend service to call Firebase Functions satellite data APIs

const API_BASE_URL = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL || 'https://us-central1-your-project-id.cloudfunctions.net';

export interface SatelliteDataResponse {
  success: boolean;
  data: Record<string, unknown>;
  metadata: {
    coordinates?: { lat: number; lon: number };
    dateRange?: { start: string; end: string };
    satellite?: string;
    radius?: number;
    timestamp: string;
  };
}

export interface SatelliteListResponse {
  success: boolean;
  data: Array<{
    name: string;
    type: string;
    operator: string;
    dataTypes: string[];
    apis: string[];
  }>;
  metadata: {
    count: number;
    timestamp: string;
  };
}

export interface HealthCheckResponse {
  success: boolean;
  status: string;
  apis: {
    nasaEarthdata: boolean;
    usgsEarthExplorer: boolean;
    googleEarthEngine: boolean;
  };
  timestamp: string;
}

class SatelliteAPIService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Health check
  async checkHealth(): Promise<HealthCheckResponse> {
    return this.makeRequest<HealthCheckResponse>('/healthCheck');
  }

  // Get list of available satellites
  async getAvailableSatellites(): Promise<SatelliteListResponse> {
    return this.makeRequest<SatelliteListResponse>('/getSatellites');
  }

  // Get satellite data for a specific location
  async getSatelliteDataForLocation(
    lat: number,
    lon: number,
    startDate?: string,
    endDate?: string,
    radius?: number
  ): Promise<SatelliteDataResponse> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (radius) params.append('radius', radius.toString());

    const queryString = params.toString();
    const endpoint = `/getSatelliteDataForLocation/${lat}/${lon}${queryString ? `?${queryString}` : ''}`;

    return this.makeRequest<SatelliteDataResponse>(endpoint);
  }

  // Get data for a specific satellite
  async getDataForSatellite(
    satelliteName: string,
    startDate?: string,
    endDate?: string,
    coordinates?: { lat: number; lon: number }
  ): Promise<SatelliteDataResponse> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (coordinates) {
      params.append('lat', coordinates.lat.toString());
      params.append('lon', coordinates.lon.toString());
    }

    const queryString = params.toString();
    const endpoint = `/getDataForSatellite/${satelliteName}${queryString ? `?${queryString}` : ''}`;

    return this.makeRequest<SatelliteDataResponse>(endpoint);
  }

  // Get recent data for a satellite (last 7 days)
  async getRecentSatelliteData(
    satelliteName: string,
    coordinates?: { lat: number; lon: number }
  ): Promise<SatelliteDataResponse> {
    const params = new URLSearchParams();
    if (coordinates) {
      params.append('lat', coordinates.lat.toString());
      params.append('lon', coordinates.lon.toString());
    }

    const queryString = params.toString();
    const endpoint = `/getRecentSatelliteData/${satelliteName}${queryString ? `?${queryString}` : ''}`;

    return this.makeRequest<SatelliteDataResponse>(endpoint);
  }

  // Get satellite data for current satellite position
  async getDataForCurrentPosition(
    satelliteName: string,
    position: { latitude: number; longitude: number }
  ): Promise<SatelliteDataResponse> {
    return this.getDataForSatellite(
      satelliteName,
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
      new Date().toISOString().split('T')[0], // today
      { lat: position.latitude, lon: position.longitude }
    );
  }
}

// Export singleton instance
export const satelliteAPIService = new SatelliteAPIService();

// Types are already exported above, no need to re-export