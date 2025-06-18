/**
 * Multi-Sensor Fusion Demo - Phase B1
 * Traditional force plate detection with real-time visualization
 */

import React, { useEffect } from 'react';
import { useDataLoader } from './hooks/useDataLoader';
import { useTraditionalDetection } from './hooks/useTraditionalDetection';
import { useDemoStore } from './store';
import { ForceChart } from './components/ForceChart';
import { PlaybackControls } from './components/PlaybackControls';

interface MultiSensorFusionDemoProps {
  trialId?: string;
  autoStart?: boolean;
  className?: string;
}

export default function MultiSensorFusionDemo({ 
  trialId = 'T5', 
  autoStart = false,
  className = '' 
}: MultiSensorFusionDemoProps) {
  // Load data
  const { data: forceData, isLoading, error, loadingProgress } = useDataLoader(trialId);
  
  // Traditional detection
  const { 
    runDetection, 
    events, 
    stats, 
    isProcessing, 
    error: detectionError,
    processingTime 
  } = useTraditionalDetection();
  
  // Store integration
  const { 
    setData, 
    setDetectedEvents, 
    currentTime,
    isDataLoaded 
  } = useDemoStore();

  // Load data into store when available
  useEffect(() => {
    if (forceData) {
      setData(forceData);
    }
  }, [forceData, setData]);

  // Run detection when data is loaded
  useEffect(() => {
    if (forceData && !isProcessing) {
      runDetection(forceData);
    }
  }, [forceData, runDetection, isProcessing]);

  // Update store with detection results
  useEffect(() => {
    if (events.length > 0) {
      setDetectedEvents(events);
    }
  }, [events, setDetectedEvents]);

  // Auto-start playback if requested
  useEffect(() => {
    if (autoStart && isDataLoaded && events.length > 0) {
      // Auto-start could be implemented here
    }
  }, [autoStart, isDataLoaded, events.length]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-white/5 rounded-xl border border-white/10 p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="text-xl font-semibold text-white">
            Loading Constrained Gait Data...
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-burnt-sienna h-2 rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <div className="text-sm text-gray-400">
            {loadingProgress}% complete
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || detectionError) {
    return (
      <div className={`bg-red-500/10 border border-red-500/20 rounded-xl p-8 ${className}`}>
        <div className="text-center space-y-2">
          <div className="text-xl font-semibold text-red-400">
            Error Loading Demo
          </div>
          <div className="text-red-300">
            {error || detectionError}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!forceData) {
    return (
      <div className={`bg-white/5 rounded-xl border border-white/10 p-8 ${className}`}>
        <div className="text-center text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Demo Header */}
      <div className="bg-white/5 rounded-xl border border-white/10 p-6">
        <h2 className="text-2xl font-bold text-white mb-4">
          <span className="bg-gradient-to-r from-burnt-sienna via-royal-purple to-indigo bg-clip-text text-transparent">
            Traditional Force Plate Detection
          </span>
        </h2>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-2">
            <h3 className="font-semibold text-burnt-sienna">Clinical Context</h3>
            <p className="text-gray-300 leading-relaxed">
              This demonstration uses real gait data from a subject with the left leg locked in extension, 
              simulating conditions like knee contracture or post-surgical bracing. Traditional force plate 
              detection struggles with such asymmetric patterns.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-burnt-sienna">Detection Results</h3>
            {isProcessing ? (
              <div className="text-gray-400">Processing...</div>
            ) : stats ? (
              <div className="space-y-1 text-gray-300">
                <div>Total Events: {stats.total_events}</div>
                <div>Left Heel Strikes: {stats.heel_strikes_left}</div>
                <div>Right Heel Strikes: {stats.heel_strikes_right}</div>
                <div>Left Toe Offs: {stats.toe_offs_left}</div>
                <div>Right Toe Offs: {stats.toe_offs_right}</div>
                <div>Avg Confidence: {(stats.average_confidence * 100).toFixed(1)}%</div>
                <div className="text-xs text-gray-500">
                  Processed in {processingTime.toFixed(1)}ms
                </div>
              </div>
            ) : (
              <div className="text-gray-400">No results yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Force Chart */}
      <ForceChart 
        forceData={forceData}
        detectedEvents={events}
        currentTime={currentTime}
      />

      {/* Playback Controls */}
      <PlaybackControls />

      {/* Algorithm Insights */}
      <div className="bg-white/5 rounded-xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Traditional Detection Challenges
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-semibold text-burnt-sienna">Fixed Thresholds</h4>
            <p className="text-gray-300">
              Uses rigid force thresholds that don't adapt to individual constraints or 
              compensatory movement patterns.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-burnt-sienna">Asymmetry Issues</h4>
            <p className="text-gray-300">
              Constrained left leg creates reduced loading that may fall below detection 
              thresholds, leading to missed events.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-burnt-sienna">Single Sensor Limitation</h4>
            <p className="text-gray-300">
              Relies only on force data without incorporating EMG muscle activation or 
              kinematic compensation patterns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}