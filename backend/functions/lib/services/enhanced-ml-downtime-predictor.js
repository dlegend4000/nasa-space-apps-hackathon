"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enhancedMLDowntimePredictor = void 0;
class EnhancedMLDowntimePredictor {
    constructor() {
        this.isTrained = false;
        this.trainingData = [];
        // Initialize with enhanced weights for new data sources
        this.featureWeights = {
            // Original satellite features
            sceneCount: -0.30,
            expectedScenes: 0.0,
            avgCloudCover: 0.35,
            qualityScore: -0.25,
            // Enhanced space weather features
            kpIndex: 0.40,
            geomagneticStorm: 0.35,
            solarFlux: 0.20,
            sunspotNumber: 0.15,
            solarWindSpeed: 0.10,
            // Enhanced environmental features
            avgRainfall: 0.20,
            temperature: 0.05,
            humidity: 0.08,
            pressure: 0.05,
            windSpeed: 0.03,
            visibility: 0.05,
            gpmRainfall: 0.12,
            weatherQuality: -0.10,
            // Temporal features
            dayOfWeek: 0.05,
            month: 0.10,
            season: 0.15
        };
        this.isTrained = false;
    }
    // Create enhanced ML features from all data sources
    createEnhancedMLFeatures(satelliteFeatures, weatherData, solarData, rainfallData) {
        return {
            // Original satellite features
            sceneCount: satelliteFeatures.sceneCount,
            expectedScenes: satelliteFeatures.expectedScenes,
            avgCloudCover: satelliteFeatures.avgCloudCover,
            qualityScore: satelliteFeatures.qualityScore,
            // Enhanced space weather features
            kpIndex: satelliteFeatures.kpIndex,
            solarFlux: (solarData === null || solarData === void 0 ? void 0 : solarData.solarFlux) || satelliteFeatures.solarFlux,
            geomagneticStorm: satelliteFeatures.geomagneticStorm,
            sunspotNumber: (solarData === null || solarData === void 0 ? void 0 : solarData.sunspotNumber) || 0,
            solarWindSpeed: (solarData === null || solarData === void 0 ? void 0 : solarData.solarWindSpeed) || 400,
            // Enhanced environmental features
            avgRainfall: satelliteFeatures.avgRainfall,
            temperature: (weatherData === null || weatherData === void 0 ? void 0 : weatherData.temperature) || satelliteFeatures.temperature,
            humidity: (weatherData === null || weatherData === void 0 ? void 0 : weatherData.humidity) || 50,
            pressure: (weatherData === null || weatherData === void 0 ? void 0 : weatherData.pressure) || 1013.25,
            windSpeed: (weatherData === null || weatherData === void 0 ? void 0 : weatherData.windSpeed) || 0,
            visibility: (weatherData === null || weatherData === void 0 ? void 0 : weatherData.visibility) || 10,
            gpmRainfall: (rainfallData === null || rainfallData === void 0 ? void 0 : rainfallData.precipitation) || 0,
            weatherQuality: this.calculateWeatherQuality(weatherData),
            // Temporal features
            dayOfWeek: satelliteFeatures.dayOfWeek,
            month: satelliteFeatures.month,
            season: satelliteFeatures.season,
            // Target variable
            downtimeFlag: satelliteFeatures.downtimeFlag
        };
    }
    // Train the enhanced model
    async trainModel(trainingData) {
        console.log(`Training enhanced ML model with ${trainingData.length} samples`);
        console.log('Sample training data:', JSON.stringify(trainingData.slice(0, 2), null, 2));
        this.trainingData = trainingData;
        // Enhanced gradient descent with more sophisticated learning
        await this.performEnhancedGradientDescent();
        console.log('Enhanced model training completed');
        console.log(`Model is now trained with ${this.trainingData.length} samples`);
        this.isTrained = true;
    }
    // Enhanced gradient descent with adaptive learning rates
    async performEnhancedGradientDescent() {
        const baseLearningRate = 0.01;
        const epochs = 150; // More epochs for better convergence
        for (let epoch = 0; epoch < epochs; epoch++) {
            let totalError = 0;
            let featureUpdates = {};
            // Initialize feature updates
            Object.keys(this.featureWeights).forEach(feature => {
                featureUpdates[feature] = 0;
            });
            for (const sample of this.trainingData) {
                const prediction = this.calculateEnhancedScore(sample);
                const error = sample.downtimeFlag - prediction;
                totalError += Math.abs(error);
                // Calculate gradients for each feature
                Object.keys(this.featureWeights).forEach(feature => {
                    const featureValue = this.getFeatureValue(sample, feature);
                    featureUpdates[feature] += error * featureValue;
                });
            }
            // Apply updates with adaptive learning rate
            const adaptiveLearningRate = baseLearningRate * (1 - epoch / epochs);
            Object.keys(this.featureWeights).forEach(feature => {
                this.featureWeights[feature] += adaptiveLearningRate * featureUpdates[feature] / this.trainingData.length;
            });
            const avgError = totalError / this.trainingData.length;
            if (epoch % 30 === 0) {
                console.log(`Epoch ${epoch}: Average Error = ${avgError.toFixed(4)}`);
            }
        }
    }
    // Enhanced score calculation with realistic downtime prediction
    calculateEnhancedScore(features) {
        let score = 0.25; // Base probability - more realistic baseline (25% downtime risk)
        // Satellite features - normalize to prevent extreme values
        score += Math.min(features.sceneCount / 10, 1) * this.featureWeights.sceneCount;
        score += features.avgCloudCover / 100 * this.featureWeights.avgCloudCover;
        score += features.qualityScore * this.featureWeights.qualityScore;
        // Enhanced space weather features - add more realistic risk
        score += Math.min(features.kpIndex / 9, 1) * this.featureWeights.kpIndex;
        score += (features.geomagneticStorm ? 1 : 0) * this.featureWeights.geomagneticStorm;
        score += Math.max(0, (features.solarFlux - 100) / 100) * this.featureWeights.solarFlux;
        score += Math.min(features.sunspotNumber / 200, 1) * this.featureWeights.sunspotNumber;
        score += Math.max(0, (features.solarWindSpeed - 400) / 200) * this.featureWeights.solarWindSpeed;
        // Enhanced environmental features - add weather risk
        score += Math.min(features.avgRainfall / 50, 1) * this.featureWeights.avgRainfall;
        score += Math.abs(features.temperature - 20) / 20 * this.featureWeights.temperature;
        score += Math.abs(features.humidity - 50) / 50 * this.featureWeights.humidity;
        score += Math.abs(features.pressure - 1013.25) / 50 * this.featureWeights.pressure;
        score += Math.min(features.windSpeed / 30, 1) * this.featureWeights.windSpeed;
        score += Math.max(0, (10 - features.visibility) / 10) * this.featureWeights.visibility;
        score += Math.min(features.gpmRainfall / 20, 1) * this.featureWeights.gpmRainfall;
        score += (1 - features.weatherQuality) * Math.abs(this.featureWeights.weatherQuality); // Invert weather quality
        // Temporal features - add seasonal and weekly patterns
        score += features.dayOfWeek / 7 * this.featureWeights.dayOfWeek;
        score += features.month / 12 * this.featureWeights.month;
        score += features.season / 4 * this.featureWeights.season;
        // Add some realistic noise and minimum risk
        const noise = (Math.random() - 0.5) * 0.05; // ±2.5% random variation
        score += noise;
        // Ensure minimum 5% and maximum 95% downtime risk for realism
        return Math.max(0.02, Math.min(0.95, score));
    }
    // Predict downtime with enhanced features
    predictDowntime(features) {
        if (!this.isTrained) {
            throw new Error('Enhanced model not trained yet');
        }
        const downtimeProbability = this.calculateEnhancedScore(features);
        const confidence = this.calculateEnhancedConfidence(features);
        const factors = this.calculateEnhancedFactorContributions(features);
        const recommendation = this.generateEnhancedRecommendation(downtimeProbability, factors);
        return {
            downtimeProbability,
            confidence,
            factors,
            recommendation
        };
    }
    calculateEnhancedConfidence(features) {
        let confidence = 0.5; // Base confidence
        // More data sources = higher confidence
        confidence += Math.min(features.sceneCount / 100, 0.2);
        confidence += features.qualityScore * 0.15;
        confidence += features.weatherQuality * 0.1;
        confidence += Math.min(this.trainingData.length / 1000, 0.2);
        // Real data sources boost confidence
        if (features.solarFlux > 0)
            confidence += 0.1;
        if (features.gpmRainfall > 0)
            confidence += 0.1;
        if (features.humidity > 0)
            confidence += 0.05;
        return Math.min(confidence, 1.0);
    }
    calculateEnhancedFactorContributions(features) {
        const spaceWeather = features.kpIndex * 0.1 + (features.geomagneticStorm ? 0.3 : 0);
        const environmental = features.avgCloudCover / 100 * 0.2 + features.gpmRainfall / 10 * 0.1;
        const temporal = features.season / 4 * 0.1 + features.month / 12 * 0.05;
        const historical = (features.expectedScenes - features.sceneCount) / features.expectedScenes * 0.3;
        const weather = features.weatherQuality * 0.2 + features.humidity / 100 * 0.1;
        const solar = features.solarFlux / 200 * 0.15 + features.sunspotNumber / 100 * 0.1;
        return {
            spaceWeather: Math.max(0, Math.min(1, spaceWeather)),
            environmental: Math.max(0, Math.min(1, environmental)),
            temporal: Math.max(0, Math.min(1, temporal)),
            historical: Math.max(0, Math.min(1, historical)),
            weather: Math.max(0, Math.min(1, weather)),
            solar: Math.max(0, Math.min(1, solar))
        };
    }
    generateEnhancedRecommendation(probability, factors) {
        if (probability > 0.7) {
            return 'High downtime risk - consider backup satellite or delay mission';
        }
        else if (probability > 0.4) {
            return 'Moderate downtime risk - monitor space weather and environmental conditions';
        }
        else if (probability > 0.2) {
            return 'Low downtime risk - normal operations expected';
        }
        else {
            return 'Very low downtime risk - optimal conditions for satellite operations';
        }
    }
    calculateWeatherQuality(weatherData) {
        if (!weatherData)
            return 0.5;
        let quality = 0.5;
        // Good visibility = higher quality
        if (weatherData.visibility > 10)
            quality += 0.2;
        else if (weatherData.visibility > 5)
            quality += 0.1;
        // Low cloud cover = higher quality
        if (weatherData.cloudCover < 30)
            quality += 0.2;
        else if (weatherData.cloudCover < 60)
            quality += 0.1;
        // Low precipitation = higher quality
        if (weatherData.precipitation < 1)
            quality += 0.1;
        return Math.max(0, Math.min(1, quality));
    }
    getFeatureValue(features, featureName) {
        return features[featureName] || 0;
    }
    // Get enhanced model performance metrics
    getEnhancedModelMetrics() {
        let accuracy = 0;
        if (this.trainingData.length > 0) {
            const correct = this.trainingData.filter(sample => {
                const prediction = this.calculateEnhancedScore(sample);
                const predicted = prediction > 0.5 ? 1 : 0;
                return predicted === sample.downtimeFlag;
            }).length;
            accuracy = correct / this.trainingData.length;
        }
        return {
            isTrained: this.isTrained,
            featureWeights: this.featureWeights,
            trainingSamples: this.trainingData.length,
            accuracy,
            dataSources: [
                'Landsat STAC API',
                'NOAA Space Weather',
                'NOAA Weather Service',
                'NASA GPM Rainfall',
                'Solar Activity Data'
            ]
        };
    }
}
exports.enhancedMLDowntimePredictor = new EnhancedMLDowntimePredictor();
//# sourceMappingURL=enhanced-ml-downtime-predictor.js.map