"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SatelliteData, SatelliteService } from "@/lib/satellite-data";
import { Check, Clock, MapPin, Zap } from "lucide-react";

interface ServiceSelectorProps {
  satellites: SatelliteData[];
  selectedServices: string[];
  onServiceSelect: (serviceId: string) => void;
  onServiceDeselect: (serviceId: string) => void;
}

export default function ServiceSelector({
  satellites,
  selectedServices,
  onServiceSelect,
  onServiceDeselect
}: ServiceSelectorProps) {
  const [expandedSatellite, setExpandedSatellite] = useState<string | null>(null);

  const toggleSatellite = (satelliteId: string) => {
    setExpandedSatellite(expandedSatellite === satelliteId ? null : satelliteId);
  };

  const getServicePrice = (service: SatelliteService) => {
    return `$${service.basePricePerHour}/hour`;
  };

  const getIndustryColor = (industry: string) => {
    const colors: Record<string, string> = {
      'Agriculture': 'bg-green-500',
      'Climate': 'bg-blue-500',
      'Environment': 'bg-emerald-500',
      'Defense': 'bg-red-500',
      'Urban Planning': 'bg-gray-500',
      'Mining': 'bg-amber-500',
      'Forestry': 'bg-green-600',
      'Research': 'bg-purple-500',
      'Weather': 'bg-cyan-500',
      'Disaster Management': 'bg-orange-500',
      'Policy': 'bg-indigo-500'
    };
    return colors[industry] || 'bg-gray-500';
  };

  return (
    <Card className="linear-style-card">
      <CardHeader>
        <CardTitle className="text-lg">Available Services</CardTitle>
        <p className="text-sm text-muted-foreground">
          Select services from {satellites.length} available satellites
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {satellites.map((satellite) => (
            <div key={satellite.id} className="border border-border/50 rounded-lg">
              <div
                className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleSatellite(satellite.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      satellite.status === 'active' ? 'bg-green-500' : 
                      satellite.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <h3 className="font-medium">{satellite.name}</h3>
                      <p className="text-sm text-muted-foreground">{satellite.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex flex-wrap gap-1">
                      {satellite.industry.slice(0, 2).map((industry) => (
                        <div
                          key={industry}
                          className={`w-2 h-2 rounded-full ${getIndustryColor(industry)}`}
                          title={industry}
                        />
                      ))}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {satellite.services.length} services
                    </Badge>
                  </div>
                </div>
              </div>
              
              {expandedSatellite === satellite.id && (
                <div className="border-t border-border/50 p-4 space-y-3">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {satellite.industry.map((industry) => (
                      <Badge
                        key={industry}
                        variant="secondary"
                        className="text-xs"
                      >
                        {industry}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="grid gap-3">
                    {satellite.services.map((service) => {
                      const isSelected = selectedServices.includes(service.id);
                      
                      return (
                        <div
                          key={service.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-chart-1 bg-chart-1/10'
                              : 'border-border/50 hover:border-border'
                          }`}
                          onClick={() => 
                            isSelected 
                              ? onServiceDeselect(service.id)
                              : onServiceSelect(service.id)
                          }
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-medium text-sm">{service.name}</h4>
                                {isSelected && (
                                  <Check className="w-4 h-4 text-chart-1" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">
                                {service.description}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{service.resolution}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{service.coverage}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Zap className="w-3 h-3" />
                                  <span>{service.dataType}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-sm">
                                {getServicePrice(service)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {selectedServices.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectedServices.forEach(onServiceDeselect)}
                className="text-xs"
              >
                Clear Selection
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
