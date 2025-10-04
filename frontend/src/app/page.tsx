import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Satellite, Globe, Zap, Shield } from "lucide-react";

export default function Home() {
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
            <a href="/catalog" className="text-muted-foreground hover:text-foreground transition-colors">Catalog</a>
            <a href="/configure" className="text-muted-foreground hover:text-foreground transition-colors">Configure</a>
            <a href="/globe" className="text-muted-foreground hover:text-foreground transition-colors">Globe</a>
            <a href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</a>
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

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6">
            Rent satellite capabilities, not satellites
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            QuickSat is a purpose-built platform for satellite capability renting. 
            Lease specific resources like imaging minutes, data downlink capacity, 
            and compute cycles without owning entire spacecraft.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="linear-style-button" asChild>
              <a href="/configure">Start Building</a>
            </Button>
            <Button size="lg" variant="outline" className="border-border/50" asChild>
              <a href="/catalog">View Catalog</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="linear-style-card">
            <CardHeader>
              <div className="w-12 h-12 bg-chart-1/20 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-chart-1" />
              </div>
              <CardTitle>3D Globe Visualization</CardTitle>
              <CardDescription>
                Real-time satellite orbits and coverage footprints powered by TLE data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Live satellite tracking</li>
                <li>• Coverage area visualization</li>
                <li>• Orbit prediction</li>
                <li>• Interactive 3D globe</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="linear-style-card">
            <CardHeader>
              <div className="w-12 h-12 bg-chart-2/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-chart-2" />
              </div>
              <CardTitle>Real-time Pricing</CardTitle>
              <CardDescription>
                Dynamic pricing based on demand, availability, and resource allocation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Instant price calculation</li>
                <li>• Market-based pricing</li>
                <li>• Resource optimization</li>
                <li>• Cost transparency</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="linear-style-card">
            <CardHeader>
              <div className="w-12 h-12 bg-chart-3/20 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-chart-3" />
              </div>
              <CardTitle>Secure Booking</CardTitle>
              <CardDescription>
                End-to-end booking flow with authentication and confirmation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Secure authentication</li>
                <li>• Instant confirmation</li>
                <li>• Usage tracking</li>
                <li>• Billing integration</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Available Capabilities</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose from a wide range of satellite resources and services
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "Earth Imaging", icon: "📸", description: "High-resolution satellite imagery", price: "$50/min" },
            { name: "Data Downlink", icon: "📡", description: "High-speed data transmission", price: "$25/GB" },
            { name: "Compute Cycles", icon: "💻", description: "On-board processing power", price: "$100/hour" },
            { name: "Power Allocation", icon: "⚡", description: "Electrical power for payloads", price: "$75/hour" },
            { name: "Hosted Payloads", icon: "🛰️", description: "Dedicated payload slots", price: "$500/day" },
            { name: "Communication", icon: "📞", description: "Satellite communication links", price: "$30/min" },
            { name: "Navigation", icon: "🧭", description: "GPS and positioning services", price: "$40/hour" },
            { name: "Weather Data", icon: "🌤️", description: "Meteorological observations", price: "$60/hour" }
          ].map((capability, index) => (
            <Card key={index} className="linear-style-card hover:border-chart-1/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{capability.icon}</span>
                  <Badge variant="secondary" className="text-xs">
                    {capability.price}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{capability.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{capability.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-chart-1 mb-2">150+</div>
            <div className="text-muted-foreground">Active Satellites</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-chart-2 mb-2">24/7</div>
            <div className="text-muted-foreground">Global Coverage</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-chart-3 mb-2">99.9%</div>
            <div className="text-muted-foreground">Uptime SLA</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-chart-4 mb-2">$0.01</div>
            <div className="text-muted-foreground">Per MB Pricing</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="linear-style-card max-w-4xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-3xl mb-4">Ready to launch your space mission?</CardTitle>
            <CardDescription className="text-lg">
              Join thousands of organizations already using QuickSat for their satellite needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="linear-style-button">
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" className="border-border/50">
                Contact Sales
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                  <Satellite className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-semibold">QuickSat</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The future of satellite capability renting
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2024 QuickSat. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
