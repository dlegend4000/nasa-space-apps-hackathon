"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sprout, 
  Cloud, 
  Shield, 
  Building, 
  Mountain, 
  TreePine, 
  Beaker, 
  Globe,
  X
} from "lucide-react";

export interface Industry {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
  marketSize: string;
  satellites: string[];
  services: string[];
}

export const marketSizes = {
  agriculture: {
    satellites: ["Landsat", "MODIS", "SMAP", "GPM"],
    addressable_market: "$4B/year",
    services: ["Yield prediction", "Irrigation optimization", "Crop insurance"]
  },
  
  carbon_markets: {
    satellites: ["OCO-2/3", "ICESat-2", "Landsat"],
    addressable_market: "$2B/year",
    services: ["Emission verification", "Forest carbon", "Offset validation"]
  },
  
  insurance: {
    satellites: ["GPM", "CYGNSS", "MODIS", "Sentinel-6"],
    addressable_market: "$3B/year",
    services: ["Risk assessment", "Damage estimation", "Flood prediction"]
  },
  
  real_estate: {
    satellites: ["Landsat", "ICESat-2", "GRACE-FO"],
    addressable_market: "$1B/year",
    services: ["Property valuation", "Flood risk", "Water availability"]
  },
  
  environmental_compliance: {
    satellites: ["EMIT", "OCO-2", "Aura"],
    addressable_market: "$500M/year",
    services: ["Emission monitoring", "Leak detection", "Air quality"]
  }
};

export const INDUSTRIES: Industry[] = [
  {
    id: 'agriculture',
    name: 'Agriculture',
    icon: Sprout,
    description: 'Crop monitoring, soil analysis, irrigation management',
    color: 'bg-green-500',
    marketSize: marketSizes.agriculture.addressable_market,
    satellites: marketSizes.agriculture.satellites,
    services: marketSizes.agriculture.services
  },
  {
    id: 'carbon_markets',
    name: 'Carbon Markets',
    icon: Cloud,
    description: 'Carbon tracking, emission verification, offset validation',
    color: 'bg-blue-500',
    marketSize: marketSizes.carbon_markets.addressable_market,
    satellites: marketSizes.carbon_markets.satellites,
    services: marketSizes.carbon_markets.services
  },
  {
    id: 'insurance',
    name: 'Insurance',
    icon: Shield,
    description: 'Risk assessment, damage estimation, flood prediction',
    color: 'bg-red-500',
    marketSize: marketSizes.insurance.addressable_market,
    satellites: marketSizes.insurance.satellites,
    services: marketSizes.insurance.services
  },
  {
    id: 'real_estate',
    name: 'Real Estate',
    icon: Building,
    description: 'Property valuation, flood risk, water availability',
    color: 'bg-gray-500',
    marketSize: marketSizes.real_estate.addressable_market,
    satellites: marketSizes.real_estate.satellites,
    services: marketSizes.real_estate.services
  },
  {
    id: 'environmental_compliance',
    name: 'Environmental Compliance',
    icon: Globe,
    description: 'Emission monitoring, leak detection, air quality',
    color: 'bg-emerald-500',
    marketSize: marketSizes.environmental_compliance.addressable_market,
    satellites: marketSizes.environmental_compliance.satellites,
    services: marketSizes.environmental_compliance.services
  }
];

interface IndustryFilterProps {
  selectedIndustries: string[];
  onIndustrySelect: (industryId: string) => void;
  onIndustryDeselect: (industryId: string) => void;
  onClearAll: () => void;
}

export default function IndustryFilter({
  selectedIndustries,
  onIndustrySelect,
  onIndustryDeselect,
  onClearAll
}: IndustryFilterProps) {
  return (
    <Card className="linear-style-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Industry Filter</CardTitle>
          {selectedIndustries.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {INDUSTRIES.map((industry) => {
            const Icon = industry.icon;
            const isSelected = selectedIndustries.includes(industry.id);
            
            return (
              <div
                key={industry.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-muted/50 ${
                  isSelected
                    ? 'border-chart-1 bg-chart-1/10'
                    : 'border-border/50 hover:border-border'
                }`}
                onClick={() => 
                  isSelected 
                    ? onIndustryDeselect(industry.id)
                    : onIndustrySelect(industry.id)
                }
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full ${industry.color} flex items-center justify-center`}>
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{industry.name}</h3>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 bg-chart-1 rounded-full" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {selectedIndustries.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex flex-wrap gap-2">
              {selectedIndustries.map((industryId) => {
                const industry = INDUSTRIES.find(i => i.id === industryId);
                if (!industry) return null;
                
                return (
                  <Badge
                    key={industryId}
                    variant="secondary"
                    className="flex items-center space-x-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => onIndustryDeselect(industryId)}
                  >
                    <industry.icon className="w-3 h-3" />
                    <span>{industry.name}</span>
                    <X className="w-3 h-3" />
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
