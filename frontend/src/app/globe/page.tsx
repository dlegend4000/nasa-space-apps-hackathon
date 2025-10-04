"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Satellite, MapPin, Clock, Zap, Globe, Eye, EyeOff } from "lucide-react";
import GlobeVisualization from "@/components/GlobeVisualization";

interface SatelliteInfo {
  id: string;
  name: string;
  type: string;
  altitude: string;
  inclination: string;
  period: string;
  coverage: string;
  status: 'active' | 'maintenance' | 'offline';
}

const satelliteInfo: SatelliteInfo[] = [
  {
    id: '1',
    name: 'Landsat-9',
    type: 'Earth Imaging',
    altitude: '705 km',
    inclination: '98.2°',
    period: '99 min',
    coverage: 'Global',
    status: 'active'
  },
  {
    id: '2',
    name: 'Starlink-1234',
    type: 'Communication',
    altitude: '550 km',
    inclination: '53.0°',
    period: '95 min',
    coverage: 'Global',
    status: 'active'
  },
  {
    id: '3',
    name: 'GPS-III',
    type: 'Navigation',
    altitude: '20,200 km',
    inclination: '55.0°',
    period: '12 hours',
    coverage: 'Global',
    status: 'active'
  },
  {
    id: '4',
    name: 'GOES-18',
    type: 'Weather',
    altitude: '35,786 km',
    inclination: '0.0°',
    period: '24 hours',
    coverage: 'Americas',
    status: 'active'
  }
];

export default function GlobePage() {
  const [selectedSatellite, setSelectedSatellite] = useState<SatelliteInfo | null>(null);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showCoverage, setShowCoverage] = useState(true);

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
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link href="/catalog" className="text-muted-foreground hover:text-foreground transition-colors">Catalog</Link>
            <Link href="/globe" className="text-foreground">Globe</Link>
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
          </nav>
          <div className="flex items-center space-x-4">
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
                  <GlobeVisualization />
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
                  {satelliteInfo.length} active satellites in orbit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {satelliteInfo.map((satellite) => (
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
                    {selectedSatellite.type}
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

                  <Button className="w-full linear-style-button">
                    View Capabilities
                  </Button>
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
                    <span className="font-medium">{satelliteInfo.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active</span>
                    <span className="font-medium text-green-400">
                      {satelliteInfo.filter(s => s.status === 'active').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Coverage</span>
                    <span className="font-medium">Global</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Last Update</span>
                    <span className="font-medium">2 min ago</span>
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
