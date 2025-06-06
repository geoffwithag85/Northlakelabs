import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene3D } from './Scene3D/index';
import { DataVisualization } from './DataVisualization/index';
import { Controls } from './Controls/index';
import { useGaitAnalysisStore, generateGaitDataPoint } from './store';
import { GAIT_CONSTANTS } from './types';

interface GaitAnalysisDemoProps {
  className?: string;
  autoStart?: boolean;
  showControls?: boolean;
  showCharts?: boolean;
}

export const GaitAnalysisDemo: React.FC<GaitAnalysisDemoProps> = ({
  className = '',
  autoStart = true,
  showControls = true,
  showCharts = true,
}) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const {
    isPlaying,
    parameters,
    animationState,
    addDataPoint,
    updateAnimationState,
    startAnimation,
    stopAnimation,
  } = useGaitAnalysisStore();

  // Main animation loop - generates data and updates animation
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        
        // Update gait cycle progress
        const cycleTime = GAIT_CONSTANTS.GAIT_CYCLE_DURATION / parameters.walkingSpeed;
        const newProgress = (animationState.gaitCycleProgress + (1000 / 60) / (cycleTime * 1000)) % 1;        // Update foot contact based on gait cycle
        const leftFootContact = newProgress < 0.6; // Stance phase (60% of cycle)
        const rightFootContact = (newProgress + 0.5) % 1 < 0.6; // Opposite phase - 50% offset
        
        // Update animation state
        updateAnimationState({
          currentFrame: animationState.currentFrame + 1,
          gaitCycleProgress: newProgress,
          leftFootContact,
          rightFootContact,
        });
        
        // Generate realistic gait data
        const dataPoint = generateGaitDataPoint(now, parameters, {
          ...animationState,
          gaitCycleProgress: newProgress,
          leftFootContact,
          rightFootContact,
        });
        
        addDataPoint(dataPoint);
      }, 1000 / 60); // 60 FPS
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, parameters, animationState, addDataPoint, updateAnimationState]);

  // Auto-start demo
  useEffect(() => {
    if (autoStart) {
      const timer = setTimeout(() => {
        startAnimation();
      }, 1000); // Start after 1 second
      
      return () => clearTimeout(timer);
    }
  }, [autoStart, startAnimation]);

  // Generate gait data point based on current parameters and animation state
  const generateGaitDataPoint = (
    timestamp: number, 
    params: typeof parameters,
    animState: typeof animationState
  ) => {
    const { walkingSpeed, asymmetryFactor, leftLegTiming, rightLegTiming } = params;
    const { gaitCycleProgress } = animState;
    
    // Calculate phase-dependent values with asymmetry
    const leftPhase = (gaitCycleProgress + leftLegTiming) % 1;
    const rightPhase = (gaitCycleProgress + rightLegTiming) % 1;
    
    // Ground reaction forces (peak during stance phase)
    const leftForceMultiplier = leftPhase < 0.6 ? Math.sin(leftPhase * Math.PI / 0.6) : 0;
    const rightForceMultiplier = rightPhase < 0.6 ? Math.sin(rightPhase * Math.PI / 0.6) : 0;
    
    const baseForce = GAIT_CONSTANTS.MAX_GROUND_REACTION_FORCE * walkingSpeed;
    const leftFootForce = baseForce * leftForceMultiplier * (1 - asymmetryFactor * 0.3);
    const rightFootForce = baseForce * rightForceMultiplier * (1 + asymmetryFactor * 0.3);
    
    // Joint angles with realistic biomechanics
    const leftKneeAngle = GAIT_CONSTANTS.NORMAL_KNEE_FLEXION * Math.sin(leftPhase * 2 * Math.PI);
    const rightKneeAngle = GAIT_CONSTANTS.NORMAL_KNEE_FLEXION * Math.sin(rightPhase * 2 * Math.PI);
    
    const leftHipAngle = GAIT_CONSTANTS.NORMAL_HIP_EXTENSION * Math.cos(leftPhase * 2 * Math.PI);
    const rightHipAngle = GAIT_CONSTANTS.NORMAL_HIP_EXTENSION * Math.cos(rightPhase * 2 * Math.PI);
    
    const leftAnkleAngle = GAIT_CONSTANTS.NORMAL_ANKLE_DORSIFLEXION * Math.sin(leftPhase * Math.PI);
    const rightAnkleAngle = GAIT_CONSTANTS.NORMAL_ANKLE_DORSIFLEXION * Math.sin(rightPhase * Math.PI);
    
    // Cadence and step length adjust with speed
    const cadence = GAIT_CONSTANTS.NORMAL_CADENCE * Math.sqrt(walkingSpeed);
    const stepLength = GAIT_CONSTANTS.NORMAL_STEP_LENGTH * walkingSpeed;
    
    return {
      timestamp,
      leftFootForce: Math.max(0, leftFootForce),
      rightFootForce: Math.max(0, rightFootForce),
      leftKneeAngle,
      rightKneeAngle,
      leftHipAngle,
      rightHipAngle,
      leftAnkleAngle,
      rightAnkleAngle,
      cadence,
      stepLength,
    };
  };

  return (
    <div className={`gait-analysis-demo w-full ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Real-Time Gait Analysis Robot
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Interactive demonstration of AI-integrated biomechanics analysis
        </p>
      </div>

      {/* Main demo area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3D Scene */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            3D Gait Analysis
          </h3>
          <div className="h-96 w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <Canvas
              camera={{ position: [5, 3, 5], fov: 50 }}
              gl={{ antialias: true, alpha: false }}
              dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1}
            >
              <Scene3D />
            </Canvas>
          </div>
          
          {/* Animation Controls */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={isPlaying ? stopAnimation : startAnimation}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {isPlaying ? 'Pause' : 'Start'} Demo
            </button>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Speed: {(parameters.walkingSpeed * 100).toFixed(0)}% | 
              Asymmetry: {(parameters.asymmetryFactor * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Data Visualization */}
        {showCharts && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Real-Time Analysis
            </h3>
            <DataVisualization />
          </div>
        )}
      </div>

      {/* Controls Panel */}
      {showControls && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Interactive Controls
          </h3>
          <Controls />
        </div>
      )}

      {/* Demo Instructions */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          How to Use This Demo
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• <strong>Speed Control:</strong> Adjust walking speed to see gait adaptation</li>
          <li>• <strong>Asymmetry:</strong> Introduce movement asymmetries to test AI detection</li>
          <li>• <strong>Perturbations:</strong> Trigger stumbles to analyze recovery patterns</li>
          <li>• <strong>Real-Time Data:</strong> Watch force and angle charts update live</li>
          <li>• <strong>ML Analysis:</strong> See AI confidence and pattern recognition build over time</li>
        </ul>
      </div>
    </div>
  );
};

export default GaitAnalysisDemo;
