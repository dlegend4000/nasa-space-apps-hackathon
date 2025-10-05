"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Zap
} from "lucide-react";
import ReliabilityGauge from "./ReliabilityGauge";
import { DowntimePrediction } from "@/lib/reliability-api";

interface SatelliteStatusGridProps {
  predictions: DowntimePrediction[];
  loading: boolean;
}

export default function SatelliteStatusGrid({ predictions, loading }: SatelliteStatusGridProps) {
  const getStatusColor = (reliability: number) => {
    if (reliability >= 0.9) return 'text-green-500';
    if (reliability >= 0.7) return 'text-blue-500';
    if (reliability >= 0.5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusIcon = (reliability: number) => {
    if (reliability >= 0.9) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (reliability >= 0.7) return <Activity className="w-4 h-4 text-blue-500" />;
    if (reliability >= 0.5) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <AlertTriangle className="w-4 h-4 text-red-500" />;
  };

  const getRecommendationColor = (recommendation: string) => {
    if (recommendation.includes('High')) return 'destructive';
    if (recommendation.includes('Moderate')) return 'secondary';
    if (recommendation.includes('Low')) return 'default';
    return 'outline';
  };

  if (loading) {
    return (
      <Card className="linear-style-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Satellite Status</span>
          </CardTitle>
          <CardDescription>
            Loading reliability predictions...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-4 border rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="linear-style-card">
      <CardHeader className="pb-2 md:pb-6">
        <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
          <Activity className="w-4 h-4 md:w-5 md:h-5" />
          <span>Satellite Status</span>
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Real-time reliability predictions for all satellites
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
          {predictions.map((prediction, index) => {
            const reliability = 1 - prediction.data.prediction.downtimeProbability;
            const downtimeRisk = prediction.data.prediction.downtimeProbability;
            
            return (
              <Card key={index} className="border-border/50">
                <CardHeader className="pb-2 md:pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm md:text-base">{prediction.data.satellite}</CardTitle>
                      <CardDescription className="text-xs">
                        {prediction.data.analysis.historicalData.totalScenes} scenes analyzed
                      </CardDescription>
                    </div>
                    {getStatusIcon(reliability)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 md:space-y-4 p-2 md:p-6">
                  {/* Reliability Gauge */}
                  <div className="flex justify-center">
                    <ReliabilityGauge 
                      reliability={reliability} 
                      size="small" 
                      showDetails={false}
                    />
                  </div>
                  
                  {/* Key Metrics */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Reliability</span>
                      <span className={`font-medium ${getStatusColor(reliability)}`}>
                        {Math.round(reliability * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Downtime Risk</span>
                      <span className="font-medium">
                        {Math.round(downtimeRisk * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Confidence</span>
                      <span className="font-medium">
                        {Math.round(prediction.data.prediction.confidence * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="pt-2 border-t border-border/50">
                    <Badge 
                      variant={getRecommendationColor(prediction.data.prediction.recommendation)}
                      className="text-xs"
                    >
                      {prediction.data.prediction.recommendation}
                    </Badge>
                  </div>

                  {/* Factor Indicators */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${
                        prediction.data.factors.spaceWeather > 0.5 ? 'bg-red-500' : 
                        prediction.data.factors.spaceWeather > 0.3 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <span>Space</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${
                        prediction.data.factors.environmental > 0.5 ? 'bg-red-500' : 
                        prediction.data.factors.environmental > 0.3 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <span>Weather</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${
                        prediction.data.factors.historical > 0.5 ? 'bg-red-500' : 
                        prediction.data.factors.historical > 0.3 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <span>History</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${
                        prediction.data.factors.temporal > 0.5 ? 'bg-red-500' : 
                        prediction.data.factors.temporal > 0.3 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <span>Timing</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
