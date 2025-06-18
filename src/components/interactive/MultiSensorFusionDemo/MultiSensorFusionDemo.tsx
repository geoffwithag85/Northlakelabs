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
import { ThresholdControls } from './components/ThresholdControls';
import { DetectionStats } from './components/DetectionStats';

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
  
  // Traditional detection hook
  const {
    result: detectionResult,
    isProcessing,
    config,
    runDetection,
    updateConfig,
    resetConfig,
    events: detectedEvents
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

  // Auto-run detection when data loads or config changes
  useEffect(() => {
    if (forceData && !isProcessing) {
      runDetection(forceData);
    }
  }, [forceData, config, runDetection, isProcessing]);

  // Debug: Log events from detection hook
  useEffect(() => {
    console.log('🎲 Main component - detectedEvents from hook:', detectedEvents.length);
    console.log('🎲 Main component - detectionResult:', detectionResult ? 'exists' : 'null');
    console.log('🎲 Main component - isProcessing:', isProcessing);
  }, [detectedEvents, detectionResult, isProcessing]);

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
  if (error) {
    return (
      <div className={`bg-red-500/10 border border-red-500/20 rounded-xl p-8 ${className}`}>
        <div className="text-center space-y-2">
          <div className="text-xl font-semibold text-red-400">
            Error Loading Demo
          </div>
          <div className="text-red-300">
            {error}
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

  // No data state (only show after loading attempt)
  if (!forceData && !isLoading) {
    return (
      <div className={`bg-white/5 rounded-xl border border-white/10 p-8 ${className}`}>
        <div className="text-center text-gray-400">
          No data available
        </div>
      </div>
    );
  }
  
  // Initial state - show loading even before useDataLoader starts
  if (!forceData) {
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
            <h3 className="font-semibold text-burnt-sienna">Demo Status</h3>
            <div className="space-y-1 text-gray-300">
              <div>Data Loaded: {forceData ? 'Yes' : 'No'}</div>
              <div>Duration: {forceData ? `${forceData.duration.toFixed(1)}s` : '-'}</div>
              <div>Sample Rate: {forceData ? `${forceData.sampleRate}Hz` : '-'}</div>
              <div>Events Detected: {detectedEvents.length}</div>
              <div className="flex items-center gap-2">
                <span>Detection Status:</span>
                {isProcessing ? (
                  <span className="text-burnt-sienna">Processing...</span>
                ) : detectedEvents.length > 0 ? (
                  <span className="text-green-400">Complete</span>
                ) : (
                  <span className="text-gray-400">Ready</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Force Chart */}
      {forceData && (
        <ForceChart 
          forceData={forceData}
          detectedEvents={detectedEvents}
          currentTime={currentTime}
        />
      )}

      {/* Controls and Stats Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Threshold Controls */}
        <ThresholdControls
          heelStrikeThreshold={config.heel_strike_threshold}
          toeOffThreshold={config.toe_off_threshold}
          onHeelStrikeChange={(value) => updateConfig({ heel_strike_threshold: value })}
          onToeOffChange={(value) => updateConfig({ toe_off_threshold: value })}
          onReset={resetConfig}
        />

        {/* Detection Statistics */}
        <DetectionStats
          events={detectedEvents}
          processingTime={detectionResult?.processingTime || 0}
          isProcessing={isProcessing}
        />
      </div>

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