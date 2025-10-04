"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Satellite, MapPin, Clock, Zap, Globe, Eye, EyeOff, ExternalLink } from "lucide-react";
import GlobeVisualization from "@/components/GlobeVisualization";
import { ThemeToggle } from "@/components/theme-toggle";
import { NASA_SATELLITES, getSatellitesWithPositions, SatelliteData } from "@/lib/satellite-data";


export default function Home() {
  const [selectedSatellite, setSelectedSatellite] = useState<SatelliteData | null>(null);
  const [satellites, setSatellites] = useState<SatelliteData[]>(NASA_SATELLITES);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showCoverage, setShowCoverage] = useState(true);
  const [loading, setLoading] = useState(false);

  // Load real-time satellite positions
  useEffect(() => {
    const loadSatellitePositions = async () => {
      setLoading(true);
      try {
        const satellitesWithPositions = await getSatellitesWithPositions();
        setSatellites(satellitesWithPositions);
      } catch (error) {
        console.error('Error loading satellite positions:', error);
        // Fallback to static data
        setSatellites(NASA_SATELLITES);
      } finally {
        setLoading(false);
      }
    };

    loadSatellitePositions();
    
    // Update positions every 5 minutes
    const interval = setInterval(loadSatellitePositions, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Earth Imaging': return 'text-blue-400';
      case 'Communication': return 'text-green-400';
      case 'Navigation': return 'text-yellow-400';
      case 'Weather': return 'text-red-400';
      default: return 'text-purple-400';
    }
  };

  return (
    <div className="min-h-screen quicksat-gradient">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Satellite className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">QuickSat</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            {/* Navigation removed - single page app */}
          </nav>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              Log in
            </Button>
            <Button className="linear-style-button">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Globe Visualization */}
          <div className="lg:col-span-2">
            <Card className="linear-style-card h-[600px]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Globe className="w-5 h-5" />
                      <span>Live Satellite Tracking</span>
                    </CardTitle>
                    <CardDescription>
                      Real-time satellite positions and orbits powered by TLE data
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowOrbits(!showOrbits)}
                      className="border-border/50"
                    >
                      {showOrbits ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      Orbits
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCoverage(!showCoverage)}
                      className="border-border/50"
                    >
                      {showCoverage ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      Coverage
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[500px] w-full">
                  <GlobeVisualization 
                    satellites={satellites} 
                    selectedSatellite={selectedSatellite}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Satellite Information Panel */}
          <div className="space-y-6">
            <Card className="linear-style-card">
              <CardHeader>
                <CardTitle>Satellite Network</CardTitle>
                <CardDescription>
                  {satellites.length} active NASA satellites in orbit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {satellites.map((satellite) => (
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
                          <span>Period:</span>
                          <span>{satellite.period}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Coverage:</span>
                          <span>{satellite.coverage}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Selected Satellite Details */}
            {selectedSatellite && (
              <Card className="linear-style-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Satellite className="w-5 h-5" />
                    <span>{selectedSatellite.name}</span>
                  </CardTitle>
                  <CardDescription className={getTypeColor(selectedSatellite.type)}>
                    {selectedSatellite.type} • {selectedSatellite.operator}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>Altitude</span>
                      </div>
                      <div className="font-medium">{selectedSatellite.altitude}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>Period</span>
                      </div>
                      <div className="font-medium">{selectedSatellite.period}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Zap className="w-4 h-4" />
                        <span>Inclination</span>
                      </div>
                      <div className="font-medium">{selectedSatellite.inclination}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Globe className="w-4 h-4" />
                        <span>Coverage</span>
                      </div>
                      <div className="font-medium">{selectedSatellite.coverage}</div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedSatellite.status)}`} />
                        <span className="text-sm font-medium capitalize">{selectedSatellite.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Available Data Types</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedSatellite.dataTypes.map((dataType, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {dataType}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Data Sources</h4>
                      <div className="space-y-1">
                        {selectedSatellite.dataSources.map((source, index) => (
                          <div key={index} className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <ExternalLink className="w-3 h-3" />
                            <span>{source}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Button className="w-full linear-style-button">
                      Access NASA Open Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Network Stats */}
            <Card className="linear-style-card">
              <CardHeader>
                <CardTitle>Network Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Satellites</span>
                    <span className="font-medium">{satellites.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active</span>
                    <span className="font-medium text-green-400">
                      {satellites.filter(s => s.status === 'active').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Open Data</span>
                    <span className="font-medium text-green-400">
                      {satellites.filter(s => s.openData).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Last Update</span>
                    <span className="font-medium">{loading ? 'Updating...' : 'Live'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
