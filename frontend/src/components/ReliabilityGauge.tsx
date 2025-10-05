"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface ReliabilityGaugeProps {
  reliability: number; // 0-1 (0 = 0% reliable, 1 = 100% reliable)
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
}

export default function ReliabilityGauge({ 
  reliability, 
  size = 'medium',
  showDetails = true 
}: ReliabilityGaugeProps) {
  const percentage = Math.round(reliability * 100);
  const downtimeRisk = Math.round((1 - reliability) * 100);
  
  const getStatus = () => {
    if (reliability >= 0.9) return { status: 'excellent', color: 'text-green-500', bgColor: 'bg-green-500' };
    if (reliability >= 0.7) return { status: 'good', color: 'text-blue-500', bgColor: 'bg-blue-500' };
    if (reliability >= 0.5) return { status: 'fair', color: 'text-yellow-500', bgColor: 'bg-yellow-500' };
    return { status: 'poor', color: 'text-red-500', bgColor: 'bg-red-500' };
  };

  const getStatusIcon = () => {
    if (reliability >= 0.9) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (reliability >= 0.7) return <CheckCircle className="w-4 h-4 text-blue-500" />;
    if (reliability >= 0.5) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'w-24 h-24',
          text: 'text-lg',
          icon: 'w-3 h-3'
        };
      case 'large':
        return {
          container: 'w-32 h-32',
          text: 'text-2xl',
          icon: 'w-6 h-6'
        };
      default:
        return {
          container: 'w-28 h-28',
          text: 'text-xl',
          icon: 'w-4 h-4'
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const status = getStatus();

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Circular Gauge */}
      <div className={`relative ${sizeClasses.container} flex items-center justify-center`}>
        {/* Background Circle */}
        <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
        
        {/* Progress Circle */}
        <div 
          className={`absolute inset-0 rounded-full border-4 border-transparent ${status.bgColor}`}
          style={{
            background: `conic-gradient(${status.bgColor.replace('bg-', '#')} ${reliability * 360}deg, transparent ${reliability * 360}deg)`,
            mask: 'radial-gradient(circle at center, transparent 60%, black 60%)',
            WebkitMask: 'radial-gradient(circle at center, transparent 60%, black 60%)'
          }}
        ></div>
        
        {/* Center Content */}
        <div className="relative z-10 flex flex-col items-center">
          <div className={`font-bold ${sizeClasses.text} ${status.color}`}>
            {percentage}%
          </div>
          <div className="text-xs text-muted-foreground">
            Reliable
          </div>
        </div>
      </div>

      {/* Status Details */}
      {showDetails && (
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            {getStatusIcon()}
            <span className={`text-sm font-medium ${status.color}`}>
              {status.status.toUpperCase()}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {downtimeRisk}% downtime risk
          </div>
        </div>
      )}
    </div>
  );
}
