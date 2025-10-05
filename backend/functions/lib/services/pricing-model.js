"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pricingModelEngine = void 0;
class PricingModelEngine {
    constructor() {
        this.isTrained = false;
        // Initialize with default weights (would be trained in production)
        this.weights = {
            observationDensity: -0.15,
            averageCloudCover: 0.25,
            dataQuality: -0.20,
            demandVolume: 0.30,
            seasonalDemand: 0.10,
            weatherRisk: 0.35,
            rainfallFrequency: 0.20,
            season: 0.05,
            month: 0.02,
            dayOfWeek: 0.01 // Weekly patterns
        };
        this.bias = {
            intercept: 1.0,
            supplyBias: -0.1,
            demandBias: 0.2,
            environmentalBias: 0.15,
            temporalBias: 0.05 // Temporal factor bias
        };
        this.isTrained = true; // In production, this would be set after training
    }
    // Train the model (simplified version - in production, use proper ML libraries)
    async trainModel(trainingData) {
        console.log('Training pricing model with', trainingData.length, 'samples');
        // Simplified training - in production, use proper regression algorithms
        // This is a placeholder for the actual training logic
        // Update weights based on training data
        const avgError = this.calculateAverageError(trainingData);
        console.log('Model training completed. Average error:', avgError);
        this.isTrained = true;
    }
    // Predict price multiplier for given features
    predictPriceMultiplier(features, basePrice) {
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
        const featureContribution = features.observationDensity * this.weights.observationDensity +
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
    calculateSupplyFactor(features) {
        // Normalize observation density (0-10 scenes per month)
        const normalizedDensity = Math.min(features.observationDensity / 10, 1);
        // Higher density = lower price (more supply)
        return (1 - normalizedDensity) * 0.5 + (1 - features.dataQuality) * 0.5;
    }
    calculateDemandFactor(features) {
        // Normalize demand volume (0-100 bookings per month)
        const normalizedDemand = Math.min(features.demandVolume / 100, 1);
        return normalizedDemand * 0.7 + (features.seasonalDemand - 1) * 0.3;
    }
    calculateEnvironmentalFactor(features) {
        return features.weatherRisk * 0.6 + features.rainfallFrequency * 0.4;
    }
    calculateTemporalFactor(features) {
        // Seasonal patterns
        const seasonalEffect = Math.sin((features.season / 4) * 2 * Math.PI) * 0.1;
        // Monthly patterns (higher in growing seasons)
        const monthlyEffect = features.month >= 3 && features.month <= 8 ? 0.1 : -0.05;
        // Weekly patterns (higher on weekdays)
        const weeklyEffect = features.dayOfWeek >= 1 && features.dayOfWeek <= 5 ? 0.05 : -0.05;
        return seasonalEffect + monthlyEffect + weeklyEffect;
    }
    calculateConfidence(features) {
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
    calculateAverageError(trainingData) {
        let totalError = 0;
        for (const sample of trainingData) {
            const prediction = this.predictPriceMultiplier(sample.features, 100); // Base price doesn't matter for error
            const error = Math.abs(prediction.multiplier - sample.actualMultiplier);
            totalError += error;
        }
        return totalError / trainingData.length;
    }
    // Get model performance metrics
    getModelMetrics() {
        return {
            isTrained: this.isTrained,
            weights: this.weights,
            bias: this.bias
        };
    }
}
exports.pricingModelEngine = new PricingModelEngine();
//# sourceMappingURL=pricing-model.js.map