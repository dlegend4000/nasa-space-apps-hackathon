"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Satellite, Search, Filter, MapPin, Globe } from "lucide-react";

interface SatelliteCapability {
  id: string;
  name: string;
  type: string;
  description: string;
  price: number;
  unit: string;
  availability: number;
  coverage: string[];
  features: string[];
  provider: string;
  rating: number;
}

const mockCapabilities: SatelliteCapability[] = [
  {
    id: "1",
    name: "Landsat-9 Imaging",
    type: "Earth Imaging",
    description: "High-resolution multispectral imagery with 30m resolution",
    price: 50,
    unit: "minute",
    availability: 85,
    coverage: ["North America", "Europe", "Asia"],
    features: ["30m resolution", "11 spectral bands", "16-day revisit"],
    provider: "NASA",
    rating: 4.8
  },
  {
    id: "2",
    name: "Sentinel-2 Data",
    type: "Earth Imaging",
    description: "Copernicus Sentinel-2 multispectral imagery",
    price: 35,
    unit: "minute",
    availability: 92,
    coverage: ["Global"],
    features: ["10m resolution", "13 spectral bands", "5-day revisit"],
    provider: "ESA",
    rating: 4.9
  },
  {
    id: "3",
    name: "Starlink Downlink",
    type: "Data Downlink",
    description: "High-speed data transmission via Starlink constellation",
    price: 25,
    unit: "GB",
    availability: 78,
    coverage: ["Global"],
    features: ["Low latency", "High bandwidth", "24/7 coverage"],
    provider: "SpaceX",
    rating: 4.7
  },
  {
    id: "4",
    name: "ISS Compute",
    type: "Compute Cycles",
    description: "On-board processing power on International Space Station",
    price: 100,
    unit: "hour",
    availability: 65,
    coverage: ["LEO"],
    features: ["Real-time processing", "Edge computing", "Research grade"],
    provider: "NASA/ESA",
    rating: 4.6
  },
  {
    id: "5",
    name: "GOES Weather",
    type: "Weather Data",
    description: "Real-time meteorological observations and forecasting",
    price: 60,
    unit: "hour",
    availability: 95,
    coverage: ["North America", "Atlantic", "Pacific"],
    features: ["Real-time data", "High resolution", "Multi-spectral"],
    provider: "NOAA",
    rating: 4.9
  },
  {
    id: "6",
    name: "GPS Navigation",
    type: "Navigation",
    description: "Precise positioning and timing services",
    price: 40,
    unit: "hour",
    availability: 99,
    coverage: ["Global"],
    features: ["Sub-meter accuracy", "Real-time", "24/7 availability"],
    provider: "US Space Force",
    rating: 4.8
  }
];

export default function CatalogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedProvider, setSelectedProvider] = useState("all");

  const filteredCapabilities = mockCapabilities.filter(capability => {
    const matchesSearch = capability.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         capability.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || capability.type === selectedType;
    const matchesProvider = selectedProvider === "all" || capability.provider === selectedProvider;
    
    return matchesSearch && matchesType && matchesProvider;
  });

  const uniqueTypes = Array.from(new Set(mockCapabilities.map(c => c.type)));
  const uniqueProviders = Array.from(new Set(mockCapabilities.map(c => c.provider)));

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
            <Link href="/catalog" className="text-foreground">Catalog</Link>
            <Link href="/configure" className="text-muted-foreground hover:text-foreground transition-colors">Configure</Link>
            <Link href="/globe" className="text-muted-foreground hover:text-foreground transition-colors">Globe</Link>
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
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Satellite Capability Catalog</h1>
          <p className="text-muted-foreground text-lg">
            Browse and rent specific satellite resources from our global network
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <Card className="linear-style-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Filters</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search capabilities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Capability Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {uniqueTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Providers</SelectItem>
                    {uniqueProviders.map(provider => (
                      <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" className="border-border/50">
                  <Globe className="w-4 h-4 mr-2" />
                  3D Globe View
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-muted-foreground">
            Showing {filteredCapabilities.length} of {mockCapabilities.length} capabilities
          </p>
        </div>

        {/* Capabilities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCapabilities.map((capability) => (
            <Card key={capability.id} className="linear-style-card hover:border-chart-1/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg mb-2">{capability.name}</CardTitle>
                    <Badge variant="secondary" className="mb-2">
                      {capability.type}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-chart-1">
                      ${capability.price}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      per {capability.unit}
                    </div>
                  </div>
                </div>
                <CardDescription className="text-sm">
                  {capability.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Provider and Rating */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Provider: {capability.provider}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium">{capability.rating}</span>
                    <span className="text-yellow-400">★</span>
                  </div>
                </div>

                {/* Availability */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Availability</span>
                    <span className="font-medium">{capability.availability}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-chart-2 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${capability.availability}%` }}
                    />
                  </div>
                </div>

                {/* Coverage */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>Coverage</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {capability.coverage.map((region, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {region}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Key Features</div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {capability.features.map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-4">
                  <Button className="flex-1 linear-style-button">
                    Configure Rental
                  </Button>
                  <Button variant="outline" size="sm" className="border-border/50">
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredCapabilities.length === 0 && (
          <Card className="linear-style-card text-center py-12">
            <CardContent>
              <Satellite className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No capabilities found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or filters
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedType("all");
                  setSelectedProvider("all");
                }}
                className="border-border/50"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
