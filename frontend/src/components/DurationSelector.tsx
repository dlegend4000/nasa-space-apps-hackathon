"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SatelliteService } from "@/lib/satellite-data";
import { Clock, Calculator, TrendingUp } from "lucide-react";

interface DurationSelectorProps {
  selectedServices: SatelliteService[];
  onDurationChange: (duration: number, unit: string) => void;
}

const DURATION_OPTIONS = [
  { value: 1, unit: 'hour', label: '1 Hour', multiplier: 1 },
  { value: 6, unit: 'hours', label: '6 Hours', multiplier: 1 },
  { value: 1, unit: 'day', label: '1 Day', multiplier: 24 },
  { value: 3, unit: 'days', label: '3 Days', multiplier: 24 },
  { value: 1, unit: 'week', label: '1 Week', multiplier: 24 * 7 },
  { value: 1, unit: 'month', label: '1 Month', multiplier: 24 * 30 },
  { value: 3, unit: 'months', label: '3 Months', multiplier: 24 * 30 * 3 },
  { value: 1, unit: 'year', label: '1 Year', multiplier: 24 * 365 }
];

export default function DurationSelector({
  selectedServices,
  onDurationChange
}: DurationSelectorProps) {
  const [selectedDuration, setSelectedDuration] = useState(DURATION_OPTIONS[2]); // Default to 1 day
  const [customDuration, setCustomDuration] = useState(1);
  const [customUnit, setCustomUnit] = useState('day');

  useEffect(() => {
    onDurationChange(selectedDuration.value * selectedDuration.multiplier, selectedDuration.unit);
  }, [selectedDuration, onDurationChange]);

  const calculateTotalCost = () => {
    if (selectedServices.length === 0) return 0;
    
    const totalHours = selectedDuration.value * selectedDuration.multiplier;
    return selectedServices.reduce((total, service) => {
      return total + (service.basePricePerHour * totalHours);
    }, 0);
  };

  const calculateCostBreakdown = () => {
    if (selectedServices.length === 0) return [];
    
    const totalHours = selectedDuration.value * selectedDuration.multiplier;
    return selectedServices.map(service => ({
      service: service.name,
      hourlyRate: service.basePricePerHour,
      totalHours,
      totalCost: service.basePricePerHour * totalHours
    }));
  };

  const getDiscountPercentage = () => {
    const totalHours = selectedDuration.value * selectedDuration.multiplier;
    if (totalHours >= 24 * 30 * 3) return 20; // 3+ months: 20% discount
    if (totalHours >= 24 * 7) return 15; // 1+ week: 15% discount
    if (totalHours >= 24) return 10; // 1+ day: 10% discount
    return 0;
  };

  const getFinalCost = () => {
    const baseCost = calculateTotalCost();
    const discount = getDiscountPercentage();
    return baseCost * (1 - discount / 100);
  };

  const costBreakdown = calculateCostBreakdown();
  const discount = getDiscountPercentage();
  const finalCost = getFinalCost();

  return (
    <Card className="linear-style-card">
      <CardHeader className="pb-2 md:pb-3">
        <CardTitle className="flex items-center space-x-2 text-sm md:text-base">
          <Clock className="w-4 h-4 md:w-5 md:h-5" />
          <span>Duration & Pricing</span>
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

        {/* Cost Breakdown */}
        {selectedServices.length > 0 && (
          <div>
            <h3 className="font-medium mb-2 md:mb-3 flex items-center space-x-2 text-sm md:text-base">
              <Calculator className="w-3 h-3 md:w-4 md:h-4" />
              <span>Cost Breakdown</span>
            </h3>
            
            <div className="space-y-2 md:space-y-3">
              {costBreakdown.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-2 md:p-3 bg-muted/30 rounded-lg">
                  <div>
                    <div className="font-medium text-xs md:text-sm">{item.service}</div>
                    <div className="text-xs text-muted-foreground">
                      ${item.hourlyRate}/hour × {item.totalHours} hours
                    </div>
                  </div>
                  <div className="font-medium text-xs md:text-sm">${item.totalCost.toFixed(2)}</div>
                </div>
              ))}
              
              {discount > 0 && (
                <div className="flex justify-between items-center p-2 md:p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
                    <span className="text-xs md:text-sm font-medium text-green-600">
                      Volume Discount ({discount}%)
                    </span>
                  </div>
                  <div className="text-xs md:text-sm font-medium text-green-600">
                    -${(calculateTotalCost() - finalCost).toFixed(2)}
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center p-3 md:p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="text-sm md:text-lg font-semibold">Total Cost</div>
                <div className="text-lg md:text-xl font-bold text-primary">
                  ${finalCost.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Service Summary */}
        {selectedServices.length > 0 && (
          <div>
            <h3 className="font-medium mb-3">Selected Services</h3>
            <div className="space-y-2">
              {selectedServices.map((service) => (
                <div key={service.id} className="flex justify-between items-center p-2 bg-muted/20 rounded">
                  <span className="text-sm">{service.name}</span>
                  <Badge variant="outline" className="text-xs">
                    ${service.basePricePerHour}/hour
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedServices.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Select services to see pricing</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
