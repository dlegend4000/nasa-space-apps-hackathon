import { PricingFeatures, PricingModel } from './pricing-data-collector';

interface ModelWeights {
  observationDensity: number;
  averageCloudCover: number;
  dataQuality: number;
  demandVolume: number;
  seasonalDemand: number;
  weatherRisk: number;
  rainfallFrequency: number;
  season: number;
  month: number;
  dayOfWeek: number;
}

interface ModelBias {
  intercept: number;
  supplyBias: number;
  demandBias: number;
  environmentalBias: number;
  temporalBias: number;
}

class PricingModelEngine {
  private weights: ModelWeights;
  private bias: ModelBias;
  private isTrained: boolean = false;

  constructor() {
    // Initialize with default weights (would be trained in production)
    this.weights = {
      observationDensity: -0.15, // More observations = lower price (more supply)
      averageCloudCover: 0.25,   // More clouds = higher price (less usable data)
      dataQuality: -0.20,        // Higher quality = lower price (more reliable)
      demandVolume: 0.30,        // More demand = higher price
      seasonalDemand: 0.10,      // Seasonal patterns
      weatherRisk: 0.35,         // Weather risk = higher price
      rainfallFrequency: 0.20,   // More rain = higher price
      season: 0.05,              // Seasonal effects
      month: 0.02,               // Monthly patterns
      dayOfWeek: 0.01            // Weekly patterns
    };

    this.bias = {
      intercept: 1.0,            // Base multiplier
      supplyBias: -0.1,          // Supply factor bias
      demandBias: 0.2,           // Demand factor bias
      environmentalBias: 0.15,   // Environmental factor bias
      temporalBias: 0.05         // Temporal factor bias
    };

    this.isTrained = true; // In production, this would be set after training
  }

  // Train the model (simplified version - in production, use proper ML libraries)
  async trainModel(trainingData: Array<{ features: PricingFeatures; actualMultiplier: number }>): Promise<void> {
    console.log('Training pricing model with', trainingData.length, 'samples');
    
    // Simplified training - in production, use proper regression algorithms
    // This is a placeholder for the actual training logic
    
    // Update weights based on training data
    const avgError = this.calculateAverageError(trainingData);
    console.log('Model training completed. Average error:', avgError);
    
    this.isTrained = true;
  }

  // Predict price multiplier for given features
  predictPriceMultiplier(features: PricingFeatures, basePrice: number): PricingModel {
    if (!this.isTrained) {
      throw new Error('Model not trained yet');
    }

    // Calculate factor contributions
    const supplyFactor = this.calculateSupplyFactor(features);
    const demandFactor = this.calculateDemandFactor(features);
    const environmentalFactor = this.calculateEnvironmentalFactor(features);
    const temporalFactor = this.calculateTemporalFactor(features);

    // Calculate base multiplier
    const baseMultiplier = this.bias.intercept + 
                          supplyFactor * this.bias.supplyBias +
                          demandFactor * this.bias.demandBias +
                          environmentalFactor * this.bias.environmentalBias +
                          temporalFactor * this.bias.temporalBias;

    // Apply individual feature weights
    const featureContribution = 
      features.observationDensity * this.weights.observationDensity +
      features.averageCloudCover * this.weights.averageCloudCover +
      features.dataQuality * this.weights.dataQuality +
      features.demandVolume * this.weights.demandVolume +
      features.seasonalDemand * this.weights.seasonalDemand +
      features.weatherRisk * this.weights.weatherRisk +
      features.rainfallFrequency * this.weights.rainfallFrequency +
      features.season * this.weights.season +
      features.month * this.weights.month +
      features.dayOfWeek * this.weights.dayOfWeek;

    // Calculate final multiplier (clamped between 0.8x and 1.6x)
    const rawMultiplier = baseMultiplier + featureContribution;
    const multiplier = Math.max(0.8, Math.min(1.6, rawMultiplier));

    // Calculate confidence based on data availability and quality
    const confidence = this.calculateConfidence(features);

    return {
      basePrice,
      multiplier,
      confidence,
      factors: {
        supply: supplyFactor,
        demand: demandFactor,
        environmental: environmentalFactor,
        temporal: temporalFactor
      }
    };
  }

  // Calculate individual factor contributions
  private calculateSupplyFactor(features: PricingFeatures): number {
    // Normalize observation density (0-10 scenes per month)
    const normalizedDensity = Math.min(features.observationDensity / 10, 1);
    
    // Higher density = lower price (more supply)
    return (1 - normalizedDensity) * 0.5 + (1 - features.dataQuality) * 0.5;
  }

  private calculateDemandFactor(features: PricingFeatures): number {
    // Normalize demand volume (0-100 bookings per month)
    const normalizedDemand = Math.min(features.demandVolume / 100, 1);
    
    return normalizedDemand * 0.7 + (features.seasonalDemand - 1) * 0.3;
  }

  private calculateEnvironmentalFactor(features: PricingFeatures): number {
    return features.weatherRisk * 0.6 + features.rainfallFrequency * 0.4;
  }

  private calculateTemporalFactor(features: PricingFeatures): number {
    // Seasonal patterns
    const seasonalEffect = Math.sin((features.season / 4) * 2 * Math.PI) * 0.1;
    
    // Monthly patterns (higher in growing seasons)
    const monthlyEffect = features.month >= 3 && features.month <= 8 ? 0.1 : -0.05;
    
    // Weekly patterns (higher on weekdays)
    const weeklyEffect = features.dayOfWeek >= 1 && features.dayOfWeek <= 5 ? 0.05 : -0.05;
    
    return seasonalEffect + monthlyEffect + weeklyEffect;
  }

  private calculateConfidence(features: PricingFeatures): number {
    // Confidence based on data availability and quality
    let confidence = 0.5; // Base confidence
    
    // More observations = higher confidence
    confidence += Math.min(features.observationDensity / 5, 0.3);
    
    // Better data quality = higher confidence
    confidence += features.dataQuality * 0.2;
    
    // More demand data = higher confidence
    confidence += Math.min(features.demandVolume / 50, 0.2);
    
    return Math.min(confidence, 1.0);
  }

  private calculateAverageError(trainingData: Array<{ features: PricingFeatures; actualMultiplier: number }>): number {
    let totalError = 0;
    
    for (const sample of trainingData) {
      const prediction = this.predictPriceMultiplier(sample.features, 100); // Base price doesn't matter for error
      const error = Math.abs(prediction.multiplier - sample.actualMultiplier);
      totalError += error;
    }
    
    return totalError / trainingData.length;
  }

  // Get model performance metrics
  getModelMetrics(): { isTrained: boolean; weights: ModelWeights; bias: ModelBias } {
    return {
      isTrained: this.isTrained,
      weights: this.weights,
      bias: this.bias
    };
  }
}

export const pricingModelEngine = new PricingModelEngine();
