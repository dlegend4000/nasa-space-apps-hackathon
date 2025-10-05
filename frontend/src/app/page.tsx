"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Zap, Globe, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import GlobeVisualization from "@/components/GlobeVisualization";
import { ThemeToggle } from "@/components/theme-toggle";
import { NASA_SATELLITES, getSatellitesWithPositions, SatelliteData, SatelliteService } from "@/lib/satellite-data";
import IndustryFilter, { INDUSTRIES } from "@/components/IndustryFilter";
import DynamicPricingSelector from "@/components/DynamicPricingSelector";

export default function Home() {
  const [selectedSatellite, setSelectedSatellite] = useState<SatelliteData | null>(null);
  const [satellites, setSatellites] = useState<SatelliteData[]>(NASA_SATELLITES);
  const [filteredSatellites, setFilteredSatellites] = useState<SatelliteData[]>(NASA_SATELLITES);
  const [loading, setLoading] = useState(false);
  const [centerGlobe, setCenterGlobe] = useState(false);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedServiceObjects, setSelectedServiceObjects] = useState<SatelliteService[]>([]);
  const [duration, setDuration] = useState(24);
  const [durationUnit, setDurationUnit] = useState('day');

  // Load real-time satellite positions
  useEffect(() => {
    const loadSatellitePositions = async () => {
      setLoading(true);
      try {
        const satellitesWithPositions = await getSatellitesWithPositions();
        setSatellites(satellitesWithPositions);
        setFilteredSatellites(satellitesWithPositions);
      } catch (error) {
        console.error('Error loading satellite positions:', error);
        setSatellites(NASA_SATELLITES);
        setFilteredSatellites(NASA_SATELLITES);
      } finally {
        setLoading(false);
      }
    };

    loadSatellitePositions();
    
    // Update positions every 5 minutes
    const interval = setInterval(loadSatellitePositions, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter satellites by industry
  useEffect(() => {
    if (selectedIndustries.length === 0) {
      setFilteredSatellites(satellites);
    } else {
      const filtered = satellites.filter(satellite =>
        satellite.industry.some(industry => selectedIndustries.includes(industry.toLowerCase().replace(' ', '-')))
      );
      setFilteredSatellites(filtered);
    }
  }, [selectedIndustries, satellites]);

  // Update selected service objects when selection changes
  useEffect(() => {
    const serviceObjects: SatelliteService[] = [];
    satellites.forEach(satellite => {
      satellite.services.forEach(service => {
        if (selectedServices.includes(service.id)) {
          serviceObjects.push(service);
        }
      });
    });
    setSelectedServiceObjects(serviceObjects);
  }, [selectedServices, satellites]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleCenterGlobe = () => {
    setCenterGlobe(true);
    setSelectedSatellite(null);
    setTimeout(() => setCenterGlobe(false), 100);
  };

  const handleIndustrySelect = (industryId: string) => {
    setSelectedIndustries(prev => [...prev, industryId]);
  };

  const handleIndustryDeselect = (industryId: string) => {
    setSelectedIndustries(prev => prev.filter(id => id !== industryId));
  };

  const handleClearAllIndustries = () => {
    setSelectedIndustries([]);
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServices(prev => [...prev, serviceId]);
  };

  const handleServiceDeselect = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(id => id !== serviceId));
  };

  const handleDurationChange = (hours: number, unit: string) => {
    setDuration(hours);
    setDurationUnit(unit);
  };

  const calculateTotalCost = () => {
    if (selectedServiceObjects.length === 0) return 0;
    
    const totalHours = duration;
    let totalCost = selectedServiceObjects.reduce((total, service) => {
      return total + (service.basePricePerHour * totalHours);
    }, 0);
    
    // Apply volume discounts
    if (totalHours >= 24 * 30 * 3) totalCost *= 0.8;
    else if (totalHours >= 24 * 7) totalCost *= 0.85;
    else if (totalHours >= 24) totalCost *= 0.9;
    
    return totalCost;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Earth Imaging': return 'text-blue-400';
      case 'Communication': return 'text-green-400';
      case 'Atmospheric Monitoring': return 'text-purple-400';
      case 'Navigation': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen quicksat-gradient">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg overflow-hidden">
        <Image
                src="/logo360.jpg" 
                alt="QuickSat Logo" 
                width={32} 
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-lg md:text-xl font-semibold">QuickSat</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            {/* Navigation removed - single page app */}
          </nav>
          <div className="flex items-center space-x-2 md:space-x-4">
            <Link href="/reliability" className="text-sm text-muted-foreground hover:text-foreground">
              Reliability
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-2 py-1 md:px-4 md:py-8">
          {/* Mobile Layout - Stacked */}
          <div className="lg:hidden space-y-3">
            {/* Globe Visualization - Full Width */}
            <Card className="linear-style-card">
              <CardHeader className="pb-2 px-3">
                <div className="flex flex-col space-y-2">
                  <div>
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <Globe className="w-3 h-3" />
                      <span>Live Satellite Tracking</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Real-time satellite positions and orbits powered by TLE data
                    </CardDescription>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCenterGlobe}
                      className="border-border/50 text-xs px-2"
                    >
                      <Globe className="w-3 h-3" />
                      <span className="ml-1">Center</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 px-2">
                <div className="h-[180px] w-full flex items-center justify-center">
                  <GlobeVisualization 
                    satellites={filteredSatellites} 
                    selectedSatellite={selectedSatellite}
                    centerGlobe={centerGlobe}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Active Satellites List - Full Width */}
            <Card className="linear-style-card">
              <CardHeader className="pb-2 px-3">
                <CardTitle className="text-sm">Active Satellites</CardTitle>
                <CardDescription className="text-xs">
                  {filteredSatellites.length} of {satellites.length} satellites available
                  {selectedIndustries.length > 0 && ` (filtered by ${selectedIndustries.length} industry${selectedIndustries.length !== 1 ? 'ies' : ''})`}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3">
                <div className="max-h-[200px] overflow-y-auto space-y-2">
                  {filteredSatellites.map((satellite) => (
                  <div
                    key={satellite.id}
                    className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                      selectedSatellite?.id === satellite.id
                        ? 'border-chart-1 bg-chart-1/10'
                        : 'border-border/50 hover:border-border'
                    }`}
                    onClick={() => setSelectedSatellite(satellite)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(satellite.status)}`} />
                        <span className="font-medium text-xs">{satellite.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {satellite.type}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <div className="flex justify-between">
                        <span>Altitude:</span>
                        <span>{satellite.altitude}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Services:</span>
                        <span>{satellite.services.length}</span>
                      </div>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {satellite.industry.slice(0, 2).map((industry) => (
                        <Badge key={industry} variant="outline" className="text-xs">
                          {industry}
                        </Badge>
                      ))}
                      {satellite.industry.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{satellite.industry.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          </div>

          {/* Desktop Layout - Side by Side */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-6 mb-6">
            {/* Globe Visualization - Left Side */}
            <div className="lg:col-span-2">
              <Card className="linear-style-card h-[500px] lg:h-[600px]">
                <CardHeader className="pb-3 px-6">
                  <div className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2 text-xl">
                        <Globe className="w-5 h-5" />
                        <span>Live Satellite Tracking</span>
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Real-time satellite positions and orbits powered by TLE data
                      </CardDescription>
        </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCenterGlobe}
                        className="border-border/50 text-xs px-3"
                      >
                        <Globe className="w-4 h-4" />
                        <span className="ml-1">Center</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[400px] lg:h-[500px] w-full flex items-center justify-center">
                    <GlobeVisualization 
                      satellites={filteredSatellites} 
                      selectedSatellite={selectedSatellite}
                      centerGlobe={centerGlobe}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Satellites List - Right Side */}
            <div className="lg:col-span-1">
              <Card className="linear-style-card h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Active Satellites</CardTitle>
                  <CardDescription className="text-sm">
                    {filteredSatellites.length} of {satellites.length} satellites available
                    {selectedIndustries.length > 0 && ` (filtered by ${selectedIndustries.length} industry${selectedIndustries.length !== 1 ? 'ies' : ''})`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="max-h-[400px] overflow-y-auto space-y-2">
                    {filteredSatellites.map((satellite) => (
                    <div
                      key={satellite.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedSatellite?.id === satellite.id
                          ? 'border-chart-1 bg-chart-1/10'
                          : 'border-border/50 hover:border-border'
                      }`}
                      onClick={() => setSelectedSatellite(satellite)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(satellite.status)}`} />
                          <span className="font-medium text-sm">{satellite.name}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {satellite.type}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex justify-between">
                          <span>Altitude:</span>
                          <span>{satellite.altitude}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Services:</span>
                          <span>{satellite.services.length}</span>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {satellite.industry.slice(0, 2).map((industry) => (
                          <Badge key={industry} variant="outline" className="text-xs">
                            {industry}
                          </Badge>
                        ))}
                        {satellite.industry.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{satellite.industry.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            </div>
          </div>

          {/* Mobile Industry Filter Dropdown */}
          <div className="lg:hidden mb-3">
            <Card className="linear-style-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Filter by Industry</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="flex flex-wrap gap-1">
                  {selectedIndustries.length > 0 ? (
                    <>
                      {selectedIndustries.map((industryId) => {
                        const industry = INDUSTRIES.find(ind => ind.id === industryId);
                        return industry ? (
                          <Badge key={industryId} variant="secondary" className="flex items-center space-x-1 text-xs">
                            <span>{industry.name}</span>
                            <X className="h-2 w-2 cursor-pointer" onClick={() => handleIndustryDeselect(industryId)} />
                          </Badge>
                        ) : null;
                      })}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearAllIndustries}
                        className="text-xs text-muted-foreground"
                      >
                        Clear All
                      </Button>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">No industries selected</p>
                  )}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1">
                  {INDUSTRIES.map((industry) => {
                    const Icon = industry.icon;
                    const isSelected = selectedIndustries.includes(industry.id);
                    
                    return (
                      <div
                        key={industry.id}
                        className={`p-2 rounded border cursor-pointer transition-all text-xs ${
                          isSelected
                            ? 'border-chart-1 bg-chart-1/10'
                            : 'border-border/50 hover:border-border'
                        }`}
                        onClick={() => 
                          isSelected 
                            ? handleIndustryDeselect(industry.id)
                            : handleIndustrySelect(industry.id)
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`w-4 h-4 rounded-full ${industry.color} flex items-center justify-center`}>
                            <Icon className="w-2 h-2 text-white" />
                          </div>
                          <span className="truncate">{industry.name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="grid lg:grid-cols-3 gap-3 md:gap-6">
            {/* Left Side - Industry Filter (Desktop) */}
            <div className="hidden lg:block lg:col-span-1">
              <IndustryFilter
                selectedIndustries={selectedIndustries}
                onIndustrySelect={handleIndustrySelect}
                onIndustryDeselect={handleIndustryDeselect}
                onClearAll={handleClearAllIndustries}
              />
            </div>

            {/* Right Side - Services and Pricing Calculator */}
            <div className="lg:col-span-2 space-y-3 md:space-y-4">
              {/* Selected Satellite Services */}
              {selectedSatellite && (
                <Card className="linear-style-card">
                  <CardHeader className="pb-2 md:pb-3">
                    <CardTitle className="flex items-center space-x-2 text-sm md:text-base">
                      <div className="w-2 h-2 md:w-3 md:h-3 bg-primary rounded-full" />
                      <span>{selectedSatellite.name} Services</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {selectedSatellite.type} • {selectedSatellite.operator}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-2 md:p-6">
                    <div className="space-y-2 md:space-y-3">
                      {selectedSatellite.services.map((service) => {
                        const isSelected = selectedServices.includes(service.id);
                        
                        return (
                          <div
                            key={service.id}
                            className={`p-2 md:p-3 rounded-lg border cursor-pointer transition-all ${
                              isSelected
                                ? 'border-chart-1 bg-chart-1/10'
                                : 'border-border/50 hover:border-border'
                            }`}
                            onClick={() => 
                              isSelected 
                                ? handleServiceDeselect(service.id)
                                : handleServiceSelect(service.id)
                            }
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1 md:mb-2">
                                  <h4 className="font-medium text-xs md:text-sm">{service.name}</h4>
                                  {isSelected && (
                                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-chart-1 rounded-full" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mb-1 md:mb-2">
                                  {service.description}
                                </p>
                                <div className="flex flex-col md:flex-row md:items-center md:space-x-4 text-xs text-muted-foreground space-y-1 md:space-y-0">
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-2 h-2 md:w-3 md:h-3" />
                                    <span>{service.resolution}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="w-2 h-2 md:w-3 md:h-3" />
                                    <span>{service.coverage}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Zap className="w-2 h-2 md:w-3 md:h-3" />
                                    <span>{service.dataType}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-xs md:text-sm">
                                  ${service.basePricePerHour}/hour
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {selectedServices.length > 0 && (
                      <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border/50">
                        <div className="flex items-center justify-between">
                          <span className="text-xs md:text-sm font-medium">
                            {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} selected
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => selectedServices.forEach(handleServiceDeselect)}
                            className="text-xs"
                          >
                            Clear Selection
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Dynamic Pricing Calculator */}
              <DynamicPricingSelector
                selectedServices={selectedServiceObjects}
                onDurationChange={handleDurationChange}
                selectedSatellite={selectedSatellite}
              />
            </div>
        </div>
      </div>
    </div>
  );
}
