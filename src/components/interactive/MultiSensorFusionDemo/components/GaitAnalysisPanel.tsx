/**
 * Gait Analysis Panel
 * Displays clinical gait metrics calculated from detected events
 */

import React from 'react';
import type { DetectedEvent } from '../algorithms/utils';
import { GaitAnalyzer, type GaitMetrics } from '../algorithms/gaitAnalysis';

interface GaitAnalysisPanelProps {
  events: DetectedEvent[];
  duration: number;
  className?: string;
}

interface MetricDisplayProps {
  label: string;
  leftValue?: number;
  rightValue?: number;
  unit: string;
  format?: 'decimal' | 'integer' | 'percentage';
  colorThreshold?: { good: number; fair: number };
  description?: string;
}

function MetricDisplay({ 
  label, 
  leftValue, 
  rightValue, 
  unit, 
  format = 'decimal',
  colorThreshold,
  description 
}: MetricDisplayProps) {
  const formatValue = (value: number) => {
    if (format === 'integer') return Math.round(value).toString();
    if (format === 'percentage') return `${value.toFixed(1)}%`;
    return value.toFixed(3);
  };

  const getValueColor = (value: number) => {
    if (!colorThreshold) return 'text-white';
    if (value <= colorThreshold.good) return 'text-green-400';
    if (value <= colorThreshold.fair) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-300 group-hover:text-gray-200">
          {label}
        </span>
        <span className="text-xs text-gray-500">{unit}</span>
      </div>
      
      {leftValue !== undefined && rightValue !== undefined ? (
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center">
            <div className="text-xs text-blue-400 mb-1">Left</div>
            <div className={`text-lg font-bold ${getValueColor(leftValue)}`}>
              {formatValue(leftValue)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-red-400 mb-1">Right</div>
            <div className={`text-lg font-bold ${getValueColor(rightValue)}`}>
              {formatValue(rightValue)}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className={`text-xl font-bold ${getValueColor(leftValue || rightValue || 0)}`}>
            {formatValue(leftValue || rightValue || 0)}
          </div>
        </div>
      )}
      
      {description && (
        <div className="text-xs text-gray-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {description}
        </div>
      )}
    </div>
  );
}

export function GaitAnalysisPanel({ events, duration, className = '' }: GaitAnalysisPanelProps) {
  const metrics: GaitMetrics = GaitAnalyzer.analyzeGait(events, duration);

  const temporalMetrics = [
    {
      label: 'Stance Time',
      leftValue: metrics.avgStanceTime.left,
      rightValue: metrics.avgStanceTime.right,
      unit: 'seconds',
      colorThreshold: { good: 0.7, fair: 0.9 },
      description: 'Time foot is in contact with ground during gait cycle'
    },
    {
      label: 'Swing Time',
      leftValue: metrics.avgSwingTime.left,
      rightValue: metrics.avgSwingTime.right,
      unit: 'seconds',
      colorThreshold: { good: 0.5, fair: 0.7 },
      description: 'Time foot is in air during gait cycle'
    },
    {
      label: 'Stride Time',
      leftValue: metrics.avgStrideTime.left,
      rightValue: metrics.avgStrideTime.right,
      unit: 'seconds',
      colorThreshold: { good: 1.2, fair: 1.5 },
      description: 'Time between consecutive heel strikes of same foot'
    },
    {
      label: 'Step Time',
      leftValue: metrics.avgStepTime.left,
      rightValue: metrics.avgStepTime.right,
      unit: 'seconds',
      colorThreshold: { good: 0.6, fair: 0.8 },
      description: 'Time between consecutive heel strikes of opposite feet'
    }
  ];

  const frequencyMetrics = [
    {
      label: 'Cadence',
      leftValue: metrics.cadence,
      unit: 'steps/min',
      format: 'integer' as const,
      colorThreshold: { good: 120, fair: 100 },
      description: 'Number of steps per minute'
    },
    {
      label: 'Stride Frequency',
      leftValue: metrics.strideFrequency.left,
      rightValue: metrics.strideFrequency.right,
      unit: 'strides/min',
      format: 'integer' as const,
      colorThreshold: { good: 60, fair: 50 },
      description: 'Number of strides per minute for each leg'
    }
  ];

  const asymmetryMetrics = [
    {
      label: 'Stance Asymmetry',
      leftValue: metrics.stanceTimeAsymmetry,
      unit: '%',
      format: 'percentage' as const,
      colorThreshold: { good: 5, fair: 10 },
      description: 'Percentage difference in stance time between legs'
    },
    {
      label: 'Swing Asymmetry',
      leftValue: metrics.swingTimeAsymmetry,
      unit: '%',
      format: 'percentage' as const,
      colorThreshold: { good: 5, fair: 10 },
      description: 'Percentage difference in swing time between legs'
    },
    {
      label: 'Stride Asymmetry',
      leftValue: metrics.strideTimeAsymmetry,
      unit: '%',
      format: 'percentage' as const,
      colorThreshold: { good: 5, fair: 10 },
      description: 'Percentage difference in stride time between legs'
    }
  ];

  const variabilityMetrics = [
    {
      label: 'Stride Variability',
      leftValue: metrics.strideTimeCV.left,
      rightValue: metrics.strideTimeCV.right,
      unit: 'CV%',
      format: 'percentage' as const,
      colorThreshold: { good: 3, fair: 5 },
      description: 'Coefficient of variation for stride time consistency'
    },
    {
      label: 'Stance Variability',
      leftValue: metrics.stanceTimeCV.left,
      rightValue: metrics.stanceTimeCV.right,
      unit: 'CV%',
      format: 'percentage' as const,
      colorThreshold: { good: 3, fair: 5 },
      description: 'Coefficient of variation for stance time consistency'
    }
  ];

  return (
    <div className={`bg-white/5 rounded-xl border border-white/10 p-6 space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Gait Analysis
        </h3>
        <div className="text-sm text-gray-400">
          {metrics.totalSteps} steps detected
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white/5 rounded-lg">
        <div className="text-center">
          <div className="text-xs text-gray-400 mb-1">Total Strides</div>
          <div className="text-lg font-bold text-white">
            {metrics.totalStrides.left + metrics.totalStrides.right}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-400 mb-1">Avg Cycle Time</div>
          <div className="text-lg font-bold text-white">
            {metrics.gaitCycleTime.toFixed(2)}s
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-400 mb-1">Left Strides</div>
          <div className="text-lg font-bold text-blue-400">
            {metrics.totalStrides.left}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-400 mb-1">Right Strides</div>
          <div className="text-lg font-bold text-red-400">
            {metrics.totalStrides.right}
          </div>
        </div>
      </div>

      {/* Temporal Parameters */}
      <div>
        <h4 className="text-md font-semibold text-burnt-sienna mb-3">
          Temporal Parameters
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {temporalMetrics.map((metric, index) => (
            <MetricDisplay key={index} {...metric} />
          ))}
        </div>
      </div>

      {/* Frequency Parameters */}
      <div>
        <h4 className="text-md font-semibold text-royal-purple mb-3">
          Frequency & Rhythm
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {frequencyMetrics.map((metric, index) => (
            <MetricDisplay key={index} {...metric} />
          ))}
        </div>
      </div>

      {/* Asymmetry Analysis */}
      <div>
        <h4 className="text-md font-semibold text-orange-400 mb-3">
          Asymmetry Analysis
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {asymmetryMetrics.map((metric, index) => (
            <MetricDisplay key={index} {...metric} />
          ))}
        </div>
      </div>

      {/* Variability Measures */}
      <div>
        <h4 className="text-md font-semibold text-indigo-400 mb-3">
          Gait Consistency
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {variabilityMetrics.map((metric, index) => (
            <MetricDisplay key={index} {...metric} />
          ))}
        </div>
      </div>

      {/* Clinical Interpretation */}
      <div className="bg-white/5 rounded-lg p-4 border-l-4 border-orange-400">
        <h4 className="text-sm font-semibold text-orange-400 mb-2">
          Clinical Interpretation
        </h4>
        <div className="text-xs text-gray-400 space-y-1">
          <div>• <strong>Green values:</strong> Within normal range for healthy adults</div>
          <div>• <strong>Yellow values:</strong> Borderline or compensatory patterns</div>
          <div>• <strong>Red values:</strong> Significant deviation suggesting impairment</div>
          <div>• <strong>Asymmetry &gt;10%:</strong> Clinically significant gait asymmetry</div>
          <div>• <strong>High variability (&gt;5%):</strong> Possible motor control issues</div>
        </div>
      </div>
    </div>
  );
}