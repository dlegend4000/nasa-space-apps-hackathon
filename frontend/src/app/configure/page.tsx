"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Satellite } from "lucide-react";
import RentalConfigurator from "@/components/RentalConfigurator";

export default function ConfigurePage() {
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
            <Link href="/configure" className="text-foreground">Configure</Link>
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
        <RentalConfigurator />
      </div>
    </div>
  );
}
