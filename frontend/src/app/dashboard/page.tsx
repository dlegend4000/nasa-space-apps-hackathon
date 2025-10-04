"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Satellite, Clock, Zap, DollarSign, Activity, TrendingUp, AlertCircle, CheckCircle, Pause } from "lucide-react";

interface ActiveRental {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'paused' | 'completed' | 'scheduled';
  startTime: string;
  endTime: string;
  progress: number;
  cost: number;
  usage: {
    current: number;
    limit: number;
    unit: string;
  };
  satellite: string;
  region: string;
}

interface UsageStats {
  totalRentals: number;
  activeRentals: number;
  totalCost: number;
  totalUsage: number;
  averageCost: number;
}

const mockRentals: ActiveRental[] = [
  {
    id: '1',
    name: 'Landsat-9 Imaging Session',
    type: 'Earth Imaging',
    status: 'active',
    startTime: '2024-01-15T10:00:00Z',
    endTime: '2024-01-15T12:00:00Z',
    progress: 65,
    cost: 150.00,
    usage: { current: 65, limit: 120, unit: 'minutes' },
    satellite: 'Landsat-9',
    region: 'North America'
  },
  {
    id: '2',
    name: 'Starlink Data Downlink',
    type: 'Data Downlink',
    status: 'active',
    startTime: '2024-01-15T14:00:00Z',
    endTime: '2024-01-15T16:00:00Z',
    progress: 30,
    cost: 75.00,
    usage: { current: 3, limit: 10, unit: 'GB' },
    satellite: 'Starlink-1234',
    region: 'Global'
  },
  {
    id: '3',
    name: 'GPS Navigation Services',
    type: 'Navigation',
    status: 'scheduled',
    startTime: '2024-01-16T08:00:00Z',
    endTime: '2024-01-16T10:00:00Z',
    progress: 0,
    cost: 80.00,
    usage: { current: 0, limit: 120, unit: 'minutes' },
    satellite: 'GPS-III',
    region: 'Global'
  },
  {
    id: '4',
    name: 'GOES Weather Monitoring',
    type: 'Weather Data',
    status: 'completed',
    startTime: '2024-01-14T06:00:00Z',
    endTime: '2024-01-14T08:00:00Z',
    progress: 100,
    cost: 120.00,
    usage: { current: 120, limit: 120, unit: 'minutes' },
    satellite: 'GOES-18',
    region: 'Americas'
  }
];

const mockStats: UsageStats = {
  totalRentals: 12,
  activeRentals: 2,
  totalCost: 1250.00,
  totalUsage: 450,
  averageCost: 104.17
};

export default function DashboardPage() {
  const [selectedTab, setSelectedTab] = useState('overview');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'scheduled': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Activity className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'scheduled': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString();
  };

  const getTimeRemaining = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Completed';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
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
            <Link href="/configure" className="text-muted-foreground hover:text-foreground transition-colors">Configure</Link>
            <Link href="/globe" className="text-muted-foreground hover:text-foreground transition-colors">Globe</Link>
            <Link href="/dashboard" className="text-foreground">Dashboard</Link>
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
          <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Monitor your active rentals and usage statistics
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="linear-style-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Rentals</p>
                  <p className="text-2xl font-bold">{mockStats.activeRentals}</p>
                </div>
                <div className="w-12 h-12 bg-chart-1/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-chart-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="linear-style-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                  <p className="text-2xl font-bold">${mockStats.totalCost.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-chart-2/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-chart-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="linear-style-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Usage</p>
                  <p className="text-2xl font-bold">{mockStats.totalUsage}</p>
                </div>
                <div className="w-12 h-12 bg-chart-3/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-chart-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="linear-style-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Cost</p>
                  <p className="text-2xl font-bold">${mockStats.averageCost.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-chart-4/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-chart-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rentals">Active Rentals</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="linear-style-card">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates on your rentals</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockRentals.slice(0, 3).map((rental) => (
                    <div key={rental.id} className="flex items-center space-x-3 p-3 rounded-lg border border-border/50">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(rental.status)}`} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{rental.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {rental.satellite} • {rental.region}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${rental.cost.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{rental.progress}%</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Usage Chart Placeholder */}
              <Card className="linear-style-card">
                <CardHeader>
                  <CardTitle>Usage Trends</CardTitle>
                  <CardDescription>Your usage over the last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Usage chart will be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rentals" className="space-y-6">
            <div className="grid gap-6">
              {mockRentals.filter(rental => rental.status === 'active' || rental.status === 'scheduled').map((rental) => (
                <Card key={rental.id} className="linear-style-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(rental.status)}`} />
                        <div>
                          <CardTitle className="text-lg">{rental.name}</CardTitle>
                          <CardDescription>
                            {rental.satellite} • {rental.region}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{rental.type}</Badge>
                        <Badge variant="outline" className="flex items-center space-x-1">
                          {getStatusIcon(rental.status)}
                          <span className="capitalize">{rental.status}</span>
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{rental.progress}%</span>
                      </div>
                      <Progress value={rental.progress} className="h-2" />
                    </div>

                    {/* Usage */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Usage</span>
                        <span className="font-medium">
                          {rental.usage.current} / {rental.usage.limit} {rental.usage.unit}
                        </span>
                      </div>
                      <Progress value={(rental.usage.current / rental.usage.limit) * 100} className="h-2" />
                    </div>

                    {/* Details */}
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Start Time</p>
                          <p className="font-medium">{formatTime(rental.startTime)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">End Time</p>
                          <p className="font-medium">{formatTime(rental.endTime)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Cost</p>
                          <p className="font-medium">${rental.cost.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Time Remaining */}
                    {rental.status === 'active' && (
                      <div className="p-3 bg-chart-1/10 rounded-lg border border-chart-1/20">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Time Remaining</span>
                          <span className="font-medium text-chart-1">{getTimeRemaining(rental.endTime)}</span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2 pt-4">
                      <Button variant="outline" size="sm" className="border-border/50">
                        View Details
                      </Button>
                      {rental.status === 'active' && (
                        <Button variant="outline" size="sm" className="border-border/50">
                          Pause
                        </Button>
                      )}
                      <Button variant="outline" size="sm" className="border-border/50">
                        Extend
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <div className="grid gap-6">
              {mockRentals.filter(rental => rental.status === 'completed').map((rental) => (
                <Card key={rental.id} className="linear-style-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(rental.status)}`} />
                        <div>
                          <CardTitle className="text-lg">{rental.name}</CardTitle>
                          <CardDescription>
                            {rental.satellite} • {rental.region}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{rental.type}</Badge>
                        <Badge variant="outline" className="flex items-center space-x-1">
                          {getStatusIcon(rental.status)}
                          <span className="capitalize">{rental.status}</span>
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Completed</p>
                          <p className="font-medium">{formatTime(rental.endTime)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Total Cost</p>
                          <p className="font-medium">${rental.cost.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Usage</p>
                          <p className="font-medium">{rental.usage.limit} {rental.usage.unit}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
