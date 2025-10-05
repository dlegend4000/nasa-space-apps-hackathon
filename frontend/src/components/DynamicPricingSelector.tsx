"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, Calculator, TrendingUp, MapPin, Cloud, Users, AlertTriangle } from "lucide-react";
import { SatelliteService } from "@/lib/satellite-data";
import { pricingAPIService, PricingQuoteResponse } from "@/lib/pricing-api";

interface DynamicPricingSelectorProps {
  selectedServices: SatelliteService[];
  onDurationChange: (hours: number, unit: string) => void;
  selectedSatellite?: {
    position?: { latitude: number; longitude: number };
  } | null;
}

const DURATION_OPTIONS = [
  { label: '1 Hour', value: 1, unit: 'hour', multiplier: 1 },
  { label: '6 Hours', value: 6, unit: 'hour', multiplier: 1 },
  { label: '12 Hours', value: 12, unit: 'hour', multiplier: 1 },
  { label: '1 Day', value: 1, unit: 'day', multiplier: 24 },
  { label: '3 Days', value: 3, unit: 'day', multiplier: 24 },
  { label: '1 Week', value: 1, unit: 'week', multiplier: 24 * 7 },
  { label: '2 Weeks', value: 2, unit: 'week', multiplier: 24 * 7 },
  { label: '1 Month', value: 1, unit: 'month', multiplier: 24 * 30 },
  { label: '3 Months', value: 3, unit: 'month', multiplier: 24 * 30 },
  { label: '6 Months', value: 6, unit: 'month', multiplier: 24 * 30 },
];

export default function DynamicPricingSelector({ 
  selectedServices, 
  onDurationChange, 
  selectedSatellite 
}: DynamicPricingSelectorProps) {
  const [selectedDuration, setSelectedDuration] = useState(DURATION_OPTIONS[3]);
  const [pricingQuote, setPricingQuote] = useState<PricingQuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onDurationChange(selectedDuration.value * selectedDuration.multiplier, selectedDuration.unit);
  }, [selectedDuration, onDurationChange]);

  useEffect(() => {
    if (selectedServices.length > 0 && selectedSatellite?.position) {
      fetchDynamicPricing();
    }
  }, [selectedServices, selectedSatellite]);

  const fetchDynamicPricing = async () => {
    if (!selectedSatellite?.position || selectedServices.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const totalHours = selectedDuration.value * selectedDuration.multiplier;
      const basePrice = selectedServices.reduce((total, service) => 
        total + (service.basePricePerHour * totalHours), 0
      );

      const quote = await pricingAPIService.getPricingQuote({
        coordinates: {
          lat: selectedSatellite.position.latitude,
          lon: selectedSatellite.position.longitude
        },
        serviceType: selectedServices[0].id, // Use first service type
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + totalHours * 60 * 60 * 1000).toISOString().split('T')[0],
        basePrice
      });

      setPricingQuote(quote);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dynamic pricing');
    } finally {
      setLoading(false);
    }
  };

  const calculateBaseCost = () => {
    const totalHours = selectedDuration.value * selectedDuration.multiplier;
    return selectedServices.reduce((total, service) => {
      return total + (service.basePricePerHour * totalHours);
    }, 0);
  };

  const getDiscountPercentage = () => {
    const totalHours = selectedDuration.value * selectedDuration.multiplier;
    if (totalHours >= 24 * 30 * 3) return 20;
    if (totalHours >= 24 * 7) return 15;
    if (totalHours >= 24) return 10;
    return 0;
  };

  const getFinalCost = () => {
    const baseCost = calculateBaseCost();
    const discount = getDiscountPercentage();
    const volumeDiscount = baseCost * (1 - discount / 100);
    
    if (pricingQuote?.data.quote) {
      return volumeDiscount * pricingQuote.data.quote.multiplier;
    }
    
    return volumeDiscount;
  };

  const baseCost = calculateBaseCost();
  const discount = getDiscountPercentage();
  const finalCost = getFinalCost();

  return (
    <Card className="linear-style-card">
      <CardHeader className="pb-2 md:pb-3">
        <CardTitle className="flex items-center space-x-2 text-sm md:text-base">
          <Clock className="w-4 h-4 md:w-5 md:h-5" />
          <span>Dynamic Pricing & Duration</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6 p-2 md:p-6">
        {/* Duration Selection */}
        <div>
          <h3 className="font-medium mb-2 md:mb-3 text-sm md:text-base">Select Duration</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-2">
            {DURATION_OPTIONS.map((option) => (
              <Button
                key={`${option.value}-${option.unit}`}
                variant={selectedDuration === option ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDuration(option)}
                className="text-xs"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Dynamic Pricing Analysis */}
        {pricingQuote && (
          <div>
            <h3 className="font-medium mb-2 md:mb-3 flex items-center space-x-2 text-sm md:text-base">
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
              <span>Market Analysis</span>
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
              <div className="p-2 md:p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-1 mb-1">
                  <MapPin className="w-3 h-3 text-blue-500" />
                  <span className="text-xs font-medium">Supply</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {pricingQuote.data.analysis.supply.scenesAnalyzed} scenes
                </div>
                <div className="text-xs">
                  {pricingQuote.data.analysis.supply.averageCloudCover.toFixed(0)}% clouds
                </div>
              </div>

              <div className="p-2 md:p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-1 mb-1">
                  <Users className="w-3 h-3 text-green-500" />
                  <span className="text-xs font-medium">Demand</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {pricingQuote.data.analysis.demand.bookingsAnalyzed} bookings
                </div>
                <div className="text-xs">
                  {pricingQuote.data.analysis.demand.seasonalDemand.toFixed(1)}x seasonal
                </div>
              </div>

              <div className="p-2 md:p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-1 mb-1">
                  <Cloud className="w-3 h-3 text-orange-500" />
                  <span className="text-xs font-medium">Weather</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {pricingQuote.data.analysis.environmental.weatherRisk.toFixed(0)}% risk
                </div>
                <div className="text-xs">
                  {pricingQuote.data.analysis.environmental.rainfallFrequency.toFixed(0)}% rain days
                </div>
              </div>

              <div className="p-2 md:p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-1 mb-1">
                  <Clock className="w-3 h-3 text-purple-500" />
                  <span className="text-xs font-medium">Timing</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {pricingQuote.data.analysis.temporal.season}
                </div>
                <div className="text-xs">
                  {pricingQuote.data.analysis.temporal.dayOfWeek}
                </div>
              </div>
            </div>

            {/* Pricing Multiplier */}
            <div className="mt-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Market Multiplier</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">
                    {pricingQuote.data.quote.multiplier.toFixed(2)}x
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {pricingQuote.data.quote.confidence.toFixed(0)}% confidence
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {pricingQuote.data.recommendations.length > 0 && (
              <Alert className="mt-3">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <div className="space-y-1">
                    {pricingQuote.data.recommendations.map((rec, index) => (
                      <div key={index}>• {rec}</div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Cost Breakdown */}
        {selectedServices.length > 0 && (
          <div>
            <h3 className="font-medium mb-2 md:mb-3 flex items-center space-x-2 text-sm md:text-base">
              <Calculator className="w-3 h-3 md:w-4 md:h-4" />
              <span>Pay-as-You-Go Pricing Estimate</span>
            </h3>
            
            <div className="space-y-2 md:space-y-3">
              <div className="flex justify-between items-center p-2 md:p-3 bg-muted/30 rounded-lg">
                <div>
                  <div className="font-medium text-xs md:text-sm">Estimated Base Cost</div>
                  <div className="text-xs text-muted-foreground">
                    {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} × {selectedDuration.value * selectedDuration.multiplier} hours
                  </div>
                </div>
                <div className="font-medium text-xs md:text-sm">${baseCost.toFixed(2)}</div>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between items-center p-2 md:p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
                    <span className="text-xs md:text-sm font-medium text-green-600">
                      Volume Discount ({discount}%)
                    </span>
                  </div>
                  <div className="text-xs md:text-sm font-medium text-green-600">
                    -${(baseCost - baseCost * (1 - discount / 100)).toFixed(2)}
                  </div>
                </div>
              )}
              
              {pricingQuote && (
                <div className="flex justify-between items-center p-2 md:p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
                    <span className="text-xs md:text-sm font-medium text-blue-600">
                      Market Adjustment ({pricingQuote.data.quote.multiplier.toFixed(2)}x)
                    </span>
                  </div>
                  <div className="text-xs md:text-sm font-medium text-blue-600">
                    {pricingQuote.data.quote.multiplier > 1 ? '+' : ''}${(finalCost - baseCost * (1 - discount / 100)).toFixed(2)}
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center p-3 md:p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="text-sm md:text-lg font-semibold">Estimated Total Cost</div>
                <div className="text-lg md:text-xl font-bold text-primary">
                  ${finalCost.toFixed(2)}
                </div>
              </div>
              
              {/* Pay-as-you-go disclaimer */}
              <div className="text-xs text-muted-foreground text-center p-2 bg-muted/20 rounded-lg">
                💡 Pay-as-you-go pricing • Final cost may vary based on actual usage and market conditions
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-4">
            <div className="text-sm text-muted-foreground">Analyzing market conditions...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Service Summary */}
        {selectedServices.length === 0 && (
          <p className="text-muted-foreground text-sm">Select services to see dynamic pricing</p>
        )}
      </CardContent>
    </Card>
  );
}
