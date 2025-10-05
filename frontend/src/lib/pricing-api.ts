// Frontend service to call Firebase Functions pricing API

export interface PricingQuoteRequest {
  coordinates: { lat: number; lon: number };
  serviceType: string;
  startDate: string;
  endDate: string;
  basePrice: number;
}

export interface PricingQuoteResponse {
  success: boolean;
  data: {
    quote: {
      basePrice: number;
      finalPrice: number;
      multiplier: number;
      confidence: number;
      factors: {
        supply: number;
        demand: number;
        environmental: number;
        temporal: number;
      };
    };
    analysis: {
      supply: {
        observationDensity: number;
        averageCloudCover: number;
        dataQuality: number;
        scenesAnalyzed: number;
      };
      demand: {
        demandVolume: number;
        seasonalDemand: number;
        bookingsAnalyzed: number;
      };
      environmental: {
        weatherRisk: number;
        rainfallFrequency: number;
        daysAnalyzed: number;
      };
      temporal: {
        season: string;
        month: string;
        dayOfWeek: string;
      };
    };
    recommendations: string[];
    metadata: {
      coordinates: { lat: number; lon: number };
      serviceType: string;
      dateRange: { startDate: string; endDate: string };
      dataCollectionPeriod: { start: string; end: string };
      timestamp: string;
    };
  };
}

class PricingAPIService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL || 'https://us-central1-quick-sat.cloudfunctions.net';
  }

  async getPricingQuote(request: PricingQuoteRequest): Promise<PricingQuoteResponse> {
    try {
      const response = await fetch(`${this.baseURL}/getPricingQuote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching pricing quote:', error);
      throw error;
    }
  }

  // Helper method to get pricing quote for a satellite service
  async getPricingForService(
    coordinates: { lat: number; lon: number },
    serviceId: string,
    basePrice: number,
    durationHours: number
  ): Promise<PricingQuoteResponse> {
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString().split('T')[0];

    return this.getPricingQuote({
      coordinates,
      serviceType: serviceId,
      startDate,
      endDate,
      basePrice
    });
  }

  // Helper method to get pricing for multiple services
  async getPricingForServices(
    coordinates: { lat: number; lon: number },
    services: Array<{ id: string; basePricePerHour: number }>,
    durationHours: number
  ): Promise<PricingQuoteResponse[]> {
    const promises = services.map(service => 
      this.getPricingForService(
        coordinates,
        service.id,
        service.basePricePerHour * durationHours,
        durationHours
      )
    );

    return Promise.all(promises);
  }
}

export const pricingAPIService = new PricingAPIService();
