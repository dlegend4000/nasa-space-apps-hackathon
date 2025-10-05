"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import { DowntimePrediction, reliabilityAPIServiceExtended, ForecastDay } from "@/lib/reliability-api";

interface DowntimeTimelineProps {
  predictions: DowntimePrediction[];
}

export default function DowntimeTimeline({ predictions }: DowntimeTimelineProps) {
  const [forecastData, setForecastData] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real 7-day forecast with actual predictions for each day
  const fetchRealForecastData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get the primary satellite from predictions (Landsat-9)
      const primarySatellite = predictions.length > 0 ? predictions[0].data.satellite : 'landsat-9';
      
      console.log(`Fetching 7-day forecast for ${primarySatellite}...`);
      
      // Call the new 7-day forecast API
      const forecastResponse = await reliabilityAPIServiceExtended.get7DayForecast(primarySatellite);
      
      if (forecastResponse.success && forecastResponse.data.forecast) {
        setForecastData(forecastResponse.data.forecast);
        console.log('7-day forecast loaded successfully:', forecastResponse.data.forecast.length, 'days');
      } else {
        throw new Error('Invalid forecast response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch forecast data');
      console.error('Error fetching forecast data:', err);
      
      // Fallback to mock data if API fails
      const today = new Date();
      const fallbackForecast: ForecastDay[] = [];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dateSeed = date.getTime() % 1000;
        const seededRandom = (seed: number) => {
          const x = Math.sin(seed) * 10000;
          return x - Math.floor(x);
        };
        
        const baseRisk = 0.2 + seededRandom(dateSeed) * 0.3;
        const seasonalAdjustment = Math.sin((date.getMonth() / 12) * 2 * Math.PI) * 0.1;
        const weeklyPattern = date.getDay() === 0 || date.getDay() === 6 ? 0.05 : 0;
        
        const downtimeRisk = Math.max(0, Math.min(1, baseRisk + seasonalAdjustment + weeklyPattern));
        
        fallbackForecast.push({
          date: dateStr,
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          downtimeRisk,
          reliability: 1 - downtimeRisk,
          factors: {
            spaceWeather: seededRandom(dateSeed + 1) * 0.3,
            environmental: seededRandom(dateSeed + 2) * 0.4,
            historical: seededRandom(dateSeed + 3) * 0.2,
            temporal: seededRandom(dateSeed + 4) * 0.1,
            weather: seededRandom(dateSeed + 5) * 0.2,
            solar: seededRandom(dateSeed + 6) * 0.15
          },
          recommendation: 'Fallback prediction - limited data',
          forecastData: {
            cloudCover: 30 + seededRandom(dateSeed + 7) * 40,
            kpIndex: 2 + seededRandom(dateSeed + 8) * 3,
            temperature: 15 + seededRandom(dateSeed + 9) * 15,
            precipitation: seededRandom(dateSeed + 10) * 5
          }
        });
      }
      
      setForecastData(fallbackForecast);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealForecastData();
  }, [predictions]);

  const getRiskColor = (risk: number) => {
    if (risk > 0.6) return 'text-red-500';
    if (risk > 0.4) return 'text-yellow-500';
    if (risk > 0.2) return 'text-blue-500';
    return 'text-green-500';
  };

  const getRiskBadge = (risk: number) => {
    if (risk > 0.6) return { variant: 'destructive' as const, text: 'High Risk' };
    if (risk > 0.4) return { variant: 'secondary' as const, text: 'Moderate Risk' };
    if (risk > 0.2) return { variant: 'outline' as const, text: 'Low Risk' };
    return { variant: 'default' as const, text: 'Minimal Risk' };
  };

  const getTrendIcon = (index: number) => {
    if (index === 0) return <Minus className="w-4 h-4 text-gray-500" />;
    
    const current = forecastData[index]?.downtimeRisk || 0;
    const previous = forecastData[index - 1]?.downtimeRisk || 0;
    
    if (current > previous + 0.05) return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (current < previous - 0.05) return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  // Show loading state while fetching real data
  if (loading || forecastData.length === 0) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <h3 className="text-base md:text-lg font-semibold">7-Day Forecast</h3>
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <div className="text-xs md:text-sm text-muted-foreground">
              Generating real ML predictions for each day...
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-2 md:gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-2 md:p-4">
                <div className="text-center space-y-2 md:space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <h3 className="text-base md:text-lg font-semibold">7-Day Forecast</h3>
          <div className="text-xs md:text-sm text-red-500">
            Error: {error}
          </div>
        </div>
        <div className="text-center py-8">
          <div className="text-muted-foreground">Failed to load forecast data</div>
          <button 
            onClick={fetchRealForecastData}
            className="mt-2 text-sm text-primary hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Timeline Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
        <h3 className="text-base md:text-lg font-semibold">7-Day Forecast</h3>
        <div className="text-xs md:text-sm text-muted-foreground">
          Real predictions with forecast data for each day
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-2 md:gap-4">
        {forecastData.map((day, index) => {
          const riskBadge = getRiskBadge(day.downtimeRisk);
          
          return (
            <Card key={day.date} className="border-border/50">
              <CardContent className="p-2 md:p-4">
                <div className="text-center space-y-2 md:space-y-3">
                  {/* Date */}
                  <div>
                    <div className="text-xs md:text-sm font-medium">{day.dayName}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>

                  {/* Trend Icon */}
                  <div className="flex justify-center">
                    {getTrendIcon(index)}
                  </div>

                  {/* Reliability Percentage */}
                  <div className={`text-lg md:text-2xl font-bold ${getRiskColor(day.downtimeRisk)}`}>
                    {Math.round(day.reliability * 100)}%
                  </div>

                  {/* Risk Badge */}
                  <Badge variant={riskBadge.variant} className="text-xs">
                    {riskBadge.text}
                  </Badge>

                  {/* Downtime Risk */}
                  <div className="text-xs text-muted-foreground">
                    {Math.round(day.downtimeRisk * 100)}% downtime risk
                  </div>

                  {/* Factor Indicators */}
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div className="flex items-center space-x-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        day.factors.spaceWeather > 0.3 ? 'bg-red-500' : 
                        day.factors.spaceWeather > 0.15 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <span>Space</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        day.factors.environmental > 0.3 ? 'bg-red-500' : 
                        day.factors.environmental > 0.15 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <span>Weather</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <div className="pt-2 md:pt-4 border-t border-border/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 text-xs md:text-sm">
          <div className="text-center">
            <div className="font-medium">Avg Reliability</div>
            <div className="text-lg font-bold text-blue-500">
              {Math.round(forecastData.reduce((sum, day) => sum + day.reliability, 0) / forecastData.length * 100)}%
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium">Peak Risk Day</div>
            <div className="text-lg font-bold text-red-500">
              {forecastData.reduce((max, day) => day.downtimeRisk > max.downtimeRisk ? day : max).dayName}
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium">Best Day</div>
            <div className="text-lg font-bold text-green-500">
              {forecastData.reduce((min, day) => day.downtimeRisk < min.downtimeRisk ? day : min).dayName}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
