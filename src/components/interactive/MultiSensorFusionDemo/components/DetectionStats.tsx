/**
 * Real-time detection statistics display
 * Shows algorithm performance metrics and event counts
 */

import React from 'react';
import type { DetectedEvent } from '../algorithms/utils';

interface DetectionStatsProps {
  events: DetectedEvent[];
  processingTime: number;
  isProcessing: boolean;
  className?: string;
  standalone?: boolean; // New prop to control panel styling
}

interface StatItem {
  label: string;
  value: string | number;
  color?: string;
  description?: string;
}

export function DetectionStats({ 
  events, 
  processingTime, 
  isProcessing, 
  className = '',
  standalone = true
}: DetectionStatsProps) {
  // Calculate statistics
  const heelStrikesLeft = events.filter(e => e.type === 'heel_strike' && e.leg === 'left').length;
  const heelStrikesRight = events.filter(e => e.type === 'heel_strike' && e.leg === 'right').length;
  const toeOffsLeft = events.filter(e => e.type === 'toe_off' && e.leg === 'left').length;
  const toeOffsRight = events.filter(e => e.type === 'toe_off' && e.leg === 'right').length;
  
  const totalEvents = events.length;
  const averageConfidence = totalEvents > 0 
    ? events.reduce((sum, event) => sum + event.confidence, 0) / totalEvents 
    : 0;

  // Asymmetry analysis
  const leftEvents = heelStrikesLeft + toeOffsLeft;
  const rightEvents = heelStrikesRight + toeOffsRight;
  const asymmetryRatio = leftEvents + rightEvents > 0 
    ? Math.abs(leftEvents - rightEvents) / (leftEvents + rightEvents)
    : 0;

  const stats: StatItem[] = [
    {
      label: 'Total Events',
      value: totalEvents,
      color: 'text-white',
      description: 'All detected gait events'
    },
    {
      label: 'Left Heel Strikes',
      value: heelStrikesLeft,
      color: 'text-blue-400',
      description: 'Left foot contact events'
    },
    {
      label: 'Right Heel Strikes', 
      value: heelStrikesRight,
      color: 'text-red-400',
      description: 'Right foot contact events'
    },
    {
      label: 'Left Toe Offs',
      value: toeOffsLeft,
      color: 'text-blue-300',
      description: 'Left foot lift events'
    },
    {
      label: 'Right Toe Offs',
      value: toeOffsRight,
      color: 'text-red-300', 
      description: 'Right foot lift events'
    },
    {
      label: 'Avg Confidence',
      value: `${(averageConfidence * 100).toFixed(1)}%`,
      color: averageConfidence > 0.7 ? 'text-green-400' : averageConfidence > 0.4 ? 'text-yellow-400' : 'text-red-400',
      description: 'Detection confidence score'
    },
    {
      label: 'Asymmetry Ratio',
      value: `${(asymmetryRatio * 100).toFixed(1)}%`,
      color: asymmetryRatio > 0.3 ? 'text-orange-400' : 'text-green-400',
      description: 'Left-right event imbalance'
    },
    {
      label: 'Processing Time',
      value: `${processingTime.toFixed(1)}ms`,
      color: 'text-gray-400',
      description: 'Algorithm execution time'
    }
  ];

  const containerClass = standalone 
    ? `bg-white/5 rounded-xl border border-white/10 p-6 ${className}`
    : className;

  return (
    <div className={containerClass}>
      {standalone && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            Detection Statistics
          </h3>
          {isProcessing && (
            <div className="flex items-center gap-2 text-sm text-burnt-sienna">
              <div className="w-2 h-2 bg-burnt-sienna rounded-full animate-pulse"></div>
              Processing...
            </div>
          )}
        </div>
      )}
      
      {!standalone && isProcessing && (
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-2 text-sm text-burnt-sienna">
            <div className="w-2 h-2 bg-burnt-sienna rounded-full animate-pulse"></div>
            Processing...
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors group"
            title={stat.description}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400 group-hover:text-gray-300">
                {stat.label}
              </span>
              <span className={`text-xl font-bold ${stat.color || 'text-white'}`}>
                {stat.value}
              </span>
            </div>
            {stat.description && (
              <div className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {stat.description}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Algorithm Performance Indicators */}
      <div className="mt-6 space-y-3">
        <h4 className="text-sm font-semibold text-gray-300">
          Algorithm Performance Indicators
        </h4>
        
        <div className="space-y-2">
          {/* Constraint Detection */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Constraint Pattern Detected</span>
            <div className="flex items-center gap-2">
              {asymmetryRatio > 0.2 ? (
                <>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-green-400">Yes</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-sm text-yellow-400">Unclear</span>
                </>
              )}
            </div>
          </div>

          {/* Detection Quality */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Detection Quality</span>
            <div className="flex items-center gap-2">
              {averageConfidence > 0.7 ? (
                <>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-green-400">Good</span>
                </>
              ) : averageConfidence > 0.4 ? (
                <>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-sm text-yellow-400">Fair</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-sm text-red-400">Poor</span>
                </>
              )}
            </div>
          </div>

          {/* Asymmetry Severity */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Gait Asymmetry</span>
            <div className="flex items-center gap-2">
              {asymmetryRatio > 0.5 ? (
                <>
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-sm text-red-400">Severe</span>
                </>
              ) : asymmetryRatio > 0.2 ? (
                <>
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span className="text-sm text-orange-400">Moderate</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-green-400">Mild</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}