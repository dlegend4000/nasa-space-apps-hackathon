"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Clock, MapPin, Zap, DollarSign, CheckCircle } from "lucide-react";

interface RentalConfiguration {
  capability: string;
  duration: number;
  dataQuota: number;
  sensorType: string;
  coverageRegion: string;
  priority: 'standard' | 'premium' | 'urgent';
  startTime: string;
}

interface PricingBreakdown {
  basePrice: number;
  durationMultiplier: number;
  priorityMultiplier: number;
  regionMultiplier: number;
  totalPrice: number;
  estimatedCost: number;
}

const capabilityTypes = [
  { id: 'imaging', name: 'Earth Imaging', basePrice: 50, unit: 'minute' },
  { id: 'downlink', name: 'Data Downlink', basePrice: 25, unit: 'GB' },
  { id: 'compute', name: 'Compute Cycles', basePrice: 100, unit: 'hour' },
  { id: 'power', name: 'Power Allocation', basePrice: 75, unit: 'hour' },
  { id: 'payload', name: 'Hosted Payloads', basePrice: 500, unit: 'day' },
  { id: 'communication', name: 'Communication', basePrice: 30, unit: 'minute' },
  { id: 'navigation', name: 'Navigation', basePrice: 40, unit: 'hour' },
  { id: 'weather', name: 'Weather Data', basePrice: 60, unit: 'hour' }
];

const sensorTypes = [
  'Multispectral',
  'Hyperspectral',
  'SAR (Synthetic Aperture Radar)',
  'LiDAR',
  'Thermal Infrared',
  'Visible Light',
  'Near Infrared',
  'Shortwave Infrared'
];

const coverageRegions = [
  'Global',
  'North America',
  'Europe',
  'Asia',
  'Africa',
  'South America',
  'Australia',
  'Arctic',
  'Antarctic'
];

export default function RentalConfigurator() {
  const [config, setConfig] = useState<RentalConfiguration>({
    capability: 'imaging',
    duration: 60,
    dataQuota: 10,
    sensorType: 'Multispectral',
    coverageRegion: 'Global',
    priority: 'standard',
    startTime: new Date().toISOString().slice(0, 16)
  });

  const [pricing, setPricing] = useState<PricingBreakdown>({
    basePrice: 50,
    durationMultiplier: 1,
    priorityMultiplier: 1,
    regionMultiplier: 1,
    totalPrice: 50,
    estimatedCost: 50
  });

  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate pricing when configuration changes
  useEffect(() => {
    setIsCalculating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const selectedCapability = capabilityTypes.find(c => c.id === config.capability);
      const basePrice = selectedCapability?.basePrice || 50;
      
      // Duration multiplier (bulk discount)
      const durationMultiplier = config.duration > 120 ? 0.8 : config.duration > 60 ? 0.9 : 1;
      
      // Priority multiplier
      const priorityMultiplier = config.priority === 'urgent' ? 2 : config.priority === 'premium' ? 1.5 : 1;
      
      // Region multiplier (some regions are more expensive)
      const regionMultiplier = config.coverageRegion === 'Arctic' || config.coverageRegion === 'Antarctic' ? 1.5 : 1;
      
      const totalPrice = basePrice * durationMultiplier * priorityMultiplier * regionMultiplier;
      const estimatedCost = totalPrice * config.duration;
      
      setPricing({
        basePrice,
        durationMultiplier,
        priorityMultiplier,
        regionMultiplier,
        totalPrice,
        estimatedCost
      });
      
      setIsCalculating(false);
    }, 500);
  }, [config]);

  const handleConfigChange = (key: keyof RentalConfiguration, value: string | number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const selectedCapability = capabilityTypes.find(c => c.id === config.capability);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Configure Your Rental</h2>
        <p className="text-muted-foreground">
          Customize your satellite capability rental with real-time pricing
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <Card className="linear-style-card">
          <CardHeader>
            <CardTitle>Rental Configuration</CardTitle>
            <CardDescription>
              Select your requirements and see real-time pricing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Capability Type */}
            <div className="space-y-2">
              <Label htmlFor="capability">Capability Type</Label>
              <Select value={config.capability} onValueChange={(value) => handleConfigChange('capability', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select capability" />
                </SelectTrigger>
                <SelectContent>
                  {capabilityTypes.map((capability) => (
                    <SelectItem key={capability.id} value={capability.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{capability.name}</span>
                        <Badge variant="secondary" className="ml-2">
                          ${capability.basePrice}/{capability.unit}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration ({selectedCapability?.unit})</Label>
              <div className="space-y-2">
                <Slider
                  value={[config.duration]}
                  onValueChange={(value) => handleConfigChange('duration', value[0])}
                  max={480}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>1 {selectedCapability?.unit}</span>
                  <span className="font-medium">{config.duration} {selectedCapability?.unit}</span>
                  <span>480 {selectedCapability?.unit}</span>
                </div>
              </div>
            </div>

            {/* Data Quota (for applicable capabilities) */}
            {(config.capability === 'downlink' || config.capability === 'imaging') && (
              <div className="space-y-2">
                <Label htmlFor="dataQuota">Data Quota (GB)</Label>
                <div className="space-y-2">
                  <Slider
                    value={[config.dataQuota]}
                    onValueChange={(value) => handleConfigChange('dataQuota', value[0])}
                    max={1000}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>1 GB</span>
                    <span className="font-medium">{config.dataQuota} GB</span>
                    <span>1000 GB</span>
                  </div>
                </div>
              </div>
            )}

            {/* Sensor Type (for imaging) */}
            {config.capability === 'imaging' && (
              <div className="space-y-2">
                <Label htmlFor="sensorType">Sensor Type</Label>
                <Select value={config.sensorType} onValueChange={(value) => handleConfigChange('sensorType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sensor type" />
                  </SelectTrigger>
                  <SelectContent>
                    {sensorTypes.map((sensor) => (
                      <SelectItem key={sensor} value={sensor}>
                        {sensor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Coverage Region */}
            <div className="space-y-2">
              <Label htmlFor="coverageRegion">Coverage Region</Label>
              <Select value={config.coverageRegion} onValueChange={(value) => handleConfigChange('coverageRegion', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {coverageRegions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority Level */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level</Label>
              <Select value={config.priority} onValueChange={(value) => handleConfigChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">
                    <div className="flex items-center justify-between w-full">
                      <span>Standard</span>
                      <Badge variant="secondary" className="ml-2">1x</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="premium">
                    <div className="flex items-center justify-between w-full">
                      <span>Premium</span>
                      <Badge variant="secondary" className="ml-2">1.5x</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <div className="flex items-center justify-between w-full">
                      <span>Urgent</span>
                      <Badge variant="secondary" className="ml-2">2x</Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Time */}
            <div className="space-y-2">
              <Label htmlFor="startTime">Preferred Start Time</Label>
              <Input
                type="datetime-local"
                value={config.startTime}
                onChange={(e) => handleConfigChange('startTime', e.target.value)}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing Panel */}
        <Card className="linear-style-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Pricing Breakdown</span>
            </CardTitle>
            <CardDescription>
              Real-time pricing based on your configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isCalculating ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-chart-1 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Calculating pricing...</p>
              </div>
            ) : (
              <>
                {/* Price Summary */}
                <div className="space-y-4">
                  <div className="text-center p-6 bg-chart-1/10 rounded-lg border border-chart-1/20">
                    <div className="text-3xl font-bold text-chart-1 mb-2">
                      ${pricing.estimatedCost.toFixed(2)}
                    </div>
                    <div className="text-muted-foreground">
                      Total estimated cost
                    </div>
                  </div>

                  {/* Pricing Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Base price</span>
                      <span>${pricing.basePrice}/{selectedCapability?.unit}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Duration ({config.duration} {selectedCapability?.unit})</span>
                      <span>${(pricing.basePrice * config.duration).toFixed(2)}</span>
                    </div>
                    {pricing.durationMultiplier !== 1 && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Bulk discount</span>
                        <span className="text-green-400">-{((1 - pricing.durationMultiplier) * 100).toFixed(0)}%</span>
                      </div>
                    )}
                    {pricing.priorityMultiplier !== 1 && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Priority ({config.priority})</span>
                        <span className="text-yellow-400">+{((pricing.priorityMultiplier - 1) * 100).toFixed(0)}%</span>
                      </div>
                    )}
                    {pricing.regionMultiplier !== 1 && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Region ({config.coverageRegion})</span>
                        <span className="text-blue-400">+{((pricing.regionMultiplier - 1) * 100).toFixed(0)}%</span>
                      </div>
                    )}
                    <div className="border-t border-border/50 pt-3">
                      <div className="flex justify-between items-center font-medium">
                        <span>Final price per {selectedCapability?.unit}</span>
                        <span>${pricing.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Configuration Summary */}
                <div className="space-y-3">
                  <h4 className="font-medium">Configuration Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>{selectedCapability?.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span>{config.duration} {selectedCapability?.unit}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-purple-400" />
                      <span>{config.coverageRegion}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span>{config.priority} priority</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <Button className="w-full linear-style-button" size="lg">
                    Proceed to Booking
                  </Button>
                  <Button variant="outline" className="w-full border-border/50">
                    Save Configuration
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
