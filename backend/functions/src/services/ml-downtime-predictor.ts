import { MLTrainingFeatures } from './satellite-availability-collector';

interface ModelPrediction {
  downtimeProbability: number;
  confidence: number;
  factors: {
    spaceWeather: number;
    environmental: number;
    temporal: number;
    historical: number;
  };
  recommendation: string;
}

class MLDowntimePredictor {
  private model: any;
  private isTrained: boolean = false;
  private featureWeights: Record<string, number>;
  private trainingData: MLTrainingFeatures[] = [];

  constructor() {
    // Initialize with default weights (will be trained with real data)
    this.featureWeights = {
      // Space weather factors
      kpIndex: 0.25,
      geomagneticStorm: 0.35,
      solarFlux: 0.15,
      
      // Environmental factors
      avgCloudCover: 0.20,
      avgRainfall: 0.10,
      temperature: 0.05,
      
      // Historical factors
      sceneCount: -0.30, // More scenes = lower downtime risk
      qualityScore: -0.25, // Higher quality = lower downtime risk
      
      // Temporal factors
      dayOfWeek: 0.05,
      month: 0.10,
      season: 0.15
    };
    
    this.isTrained = false;
  }

  // Train the model with real data
  async trainModel(trainingData: MLTrainingFeatures[]): Promise<void> {
    console.log(`Training ML model with ${trainingData.length} samples`);
    
    this.trainingData = trainingData;
    
    // Simple gradient descent training (in production, use proper ML libraries)
    await this.performGradientDescent();
    
    console.log('Model training completed');
    this.isTrained = true;
  }

  // Simple gradient descent implementation
  private async performGradientDescent(): Promise<void> {
    const learningRate = 0.01;
    const epochs = 100;
    
    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalError = 0;
      
      for (const sample of this.trainingData) {
        const prediction = this.calculateRawScore(sample);
        const error = sample.downtimeFlag - prediction;
        totalError += Math.abs(error);
        
        // Update weights based on error
        this.updateWeights(sample, error, learningRate);
      }
      
      const avgError = totalError / this.trainingData.length;
      if (epoch % 20 === 0) {
        console.log(`Epoch ${epoch}: Average Error = ${avgError.toFixed(4)}`);
      }
    }
  }

  private calculateRawScore(features: MLTrainingFeatures): number {
    let score = 0.5; // Base probability
    
    // Space weather contribution
    score += features.kpIndex * this.featureWeights.kpIndex;
    score += (features.geomagneticStorm ? 1 : 0) * this.featureWeights.geomagneticStorm;
    score += (features.solarFlux - 100) / 100 * this.featureWeights.solarFlux;
    
    // Environmental contribution
    score += features.avgCloudCover / 100 * this.featureWeights.avgCloudCover;
    score += features.avgRainfall / 20 * this.featureWeights.avgRainfall;
    score += (features.temperature - 20) / 20 * this.featureWeights.temperature;
    
    // Historical contribution
    score += (features.sceneCount - features.expectedScenes) / features.expectedScenes * this.featureWeights.sceneCount;
    score += (features.qualityScore - 0.5) * this.featureWeights.qualityScore;
    
    // Temporal contribution
    score += features.dayOfWeek / 7 * this.featureWeights.dayOfWeek;
    score += features.month / 12 * this.featureWeights.month;
    score += features.season / 4 * this.featureWeights.season;
    
    return Math.max(0, Math.min(1, score));
  }

  private updateWeights(features: MLTrainingFeatures, error: number, learningRate: number): void {
    // Update weights based on gradient
    this.featureWeights.kpIndex += learningRate * error * features.kpIndex;
    this.featureWeights.geomagneticStorm += learningRate * error * (features.geomagneticStorm ? 1 : 0);
    this.featureWeights.solarFlux += learningRate * error * (features.solarFlux - 100) / 100;
    this.featureWeights.avgCloudCover += learningRate * error * features.avgCloudCover / 100;
    this.featureWeights.avgRainfall += learningRate * error * features.avgRainfall / 20;
    this.featureWeights.temperature += learningRate * error * (features.temperature - 20) / 20;
    this.featureWeights.sceneCount += learningRate * error * (features.sceneCount - features.expectedScenes) / features.expectedScenes;
    this.featureWeights.qualityScore += learningRate * error * (features.qualityScore - 0.5);
    this.featureWeights.dayOfWeek += learningRate * error * features.dayOfWeek / 7;
    this.featureWeights.month += learningRate * error * features.month / 12;
    this.featureWeights.season += learningRate * error * features.season / 4;
  }

  // Predict downtime probability
  predictDowntime(features: MLTrainingFeatures): ModelPrediction {
    if (!this.isTrained) {
      throw new Error('Model not trained yet');
    }

    const downtimeProbability = this.calculateRawScore(features);
    const confidence = this.calculateConfidence(features);
    const factors = this.calculateFactorContributions(features);
    const recommendation = this.generateRecommendation(downtimeProbability, factors);

    return {
      downtimeProbability,
      confidence,
      factors,
      recommendation
    };
  }

  private calculateConfidence(features: MLTrainingFeatures): number {
    let confidence = 0.5; // Base confidence
    
    // More historical data = higher confidence
    confidence += Math.min(features.sceneCount / 100, 0.3);
    
    // Better quality data = higher confidence
    confidence += features.qualityScore * 0.2;
    
    // More training data = higher confidence
    confidence += Math.min(this.trainingData.length / 1000, 0.2);
    
    return Math.min(confidence, 1.0);
  }

  private calculateFactorContributions(features: MLTrainingFeatures): {
    spaceWeather: number;
    environmental: number;
    temporal: number;
    historical: number;
  } {
    const spaceWeather = features.kpIndex * 0.1 + (features.geomagneticStorm ? 0.3 : 0);
    const environmental = features.avgCloudCover / 100 * 0.2 + features.avgRainfall / 20 * 0.1;
    const temporal = features.season / 4 * 0.1 + features.month / 12 * 0.05;
    const historical = (features.expectedScenes - features.sceneCount) / features.expectedScenes * 0.3;
    
    return {
      spaceWeather: Math.max(0, Math.min(1, spaceWeather)),
      environmental: Math.max(0, Math.min(1, environmental)),
      temporal: Math.max(0, Math.min(1, temporal)),
      historical: Math.max(0, Math.min(1, historical))
    };
  }

  private generateRecommendation(probability: number, factors: any): string {
    if (probability > 0.7) {
      return 'High downtime risk - consider backup satellite or delay mission';
    } else if (probability > 0.4) {
      return 'Moderate downtime risk - monitor space weather conditions';
    } else if (probability > 0.2) {
      return 'Low downtime risk - normal operations expected';
    } else {
      return 'Very low downtime risk - optimal conditions';
    }
  }

  // Get model performance metrics
  getModelMetrics(): { 
    isTrained: boolean; 
    featureWeights: Record<string, number>;
    trainingSamples: number;
    accuracy: number;
  } {
    let accuracy = 0;
    if (this.trainingData.length > 0) {
      const correct = this.trainingData.filter(sample => {
        const prediction = this.calculateRawScore(sample);
        const predicted = prediction > 0.5 ? 1 : 0;
        return predicted === sample.downtimeFlag;
      }).length;
      accuracy = correct / this.trainingData.length;
    }

    return {
      isTrained: this.isTrained,
      featureWeights: this.featureWeights,
      trainingSamples: this.trainingData.length,
      accuracy
    };
  }
}

export const mlDowntimePredictor = new MLDowntimePredictor();
