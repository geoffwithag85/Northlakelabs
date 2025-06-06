import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { 
  GaitDataPoint, 
  GaitParameters, 
  MLAnalysisResult, 
  AnimationState,
  RobotSensorData,
  UserInteraction
} from './types';
import {
  GAIT_CONSTANTS,
  SCENARIO_PRESETS 
} from './types';

interface GaitAnalysisStore {
  // Current state
  currentData: GaitDataPoint;
  dataHistory: GaitDataPoint[];
  parameters: GaitParameters;
  mlAnalysis: MLAnalysisResult;
  animationState: AnimationState;
  robotSensors: RobotSensorData[];
  userInteractions: UserInteraction[];
  
  // Settings
  isPlaying: boolean;
  isProcessing: boolean;
  processingProgress: number;
  showDebugInfo: boolean;
  performanceMode: 'high' | 'medium' | 'low';
  
  // Actions
  updateParameters: (newParams: Partial<GaitParameters>) => void;
  setWalkingSpeed: (speed: number) => void;
  setAsymmetry: (factor: number, leftTiming?: number, rightTiming?: number) => void;
  triggerPerturbation: (type: GaitParameters['perturbationType']) => void;
  resetToBaseline: () => void;
  loadScenario: (scenarioName: keyof typeof SCENARIO_PRESETS) => void;
  
  // Data management
  addDataPoint: (data: GaitDataPoint) => void;
  clearHistory: () => void;
  exportData: () => void;
  
  // ML Analysis
  updateMLAnalysis: (analysis: Partial<MLAnalysisResult>) => void;
  startProcessing: () => void;
  stopProcessing: () => void;
  
  // Animation control
  updateAnimationState: (state: Partial<AnimationState>) => void;
  startAnimation: () => void;
  stopAnimation: () => void;
  
  // User tracking
  recordInteraction: (interaction: UserInteraction) => void;
}

// Simplified helper function to generate gait data matching animation
export const generateGaitDataPoint = (
  timestamp: number, 
  parameters: GaitParameters,
  animationState: AnimationState
): GaitDataPoint => {
  const { walkingSpeed, asymmetryFactor } = parameters;
  const { gaitCycleProgress, leftFootContact, rightFootContact } = animationState;
  
  const baseForce = GAIT_CONSTANTS.MAX_GROUND_REACTION_FORCE * walkingSpeed;
    // Generate forces directly from foot contact state - SIMPLE APPROACH
  let leftFootForce = 0;
  let rightFootForce = 0;
  
  // Basic rule: if foot is in contact, generate force based on its own cycle position
  if (leftFootContact) {
    // Left foot force based on where we are in the left leg's stance phase
    const leftStancePosition = gaitCycleProgress < 0.6 ? gaitCycleProgress / 0.6 : 0;
    leftFootForce = baseForce * Math.sin(leftStancePosition * Math.PI);
  }
  
  if (rightFootContact) {
    // Right foot force based on where we are in the right leg's stance phase
    // Right leg is 50% offset, so its stance phase starts at 0.5
    const rightCyclePos = (gaitCycleProgress + 0.5) % 1;
    const rightStancePosition = rightCyclePos < 0.6 ? rightCyclePos / 0.6 : 0;
    rightFootForce = baseForce * Math.sin(rightStancePosition * Math.PI);
  }
  
  // Debug every time to see what's happening
  console.log('Force Debug:', {
    gaitProgress: gaitCycleProgress.toFixed(3),
    leftContact: leftFootContact,
    rightContact: rightFootContact,
    leftForce: leftFootForce.toFixed(1),
    rightForce: rightFootForce.toFixed(1),
    bothInContact: leftFootContact && rightFootContact,
    neitherInContact: !leftFootContact && !rightFootContact
  });  
  // Apply asymmetry
  leftFootForce *= (1.0 - asymmetryFactor * 0.5);
  rightFootForce *= (1.0 + asymmetryFactor * 0.5);
  
  // Joint angles with proper phase offset
  const leftKneeAngle = GAIT_CONSTANTS.NORMAL_KNEE_FLEXION * Math.sin(gaitCycleProgress * 2 * Math.PI);
  const rightKneeAngle = GAIT_CONSTANTS.NORMAL_KNEE_FLEXION * Math.sin(((gaitCycleProgress + 0.5) % 1) * 2 * Math.PI);
  
  const leftHipAngle = GAIT_CONSTANTS.NORMAL_HIP_EXTENSION * Math.cos(gaitCycleProgress * 2 * Math.PI);
  const rightHipAngle = GAIT_CONSTANTS.NORMAL_HIP_EXTENSION * Math.cos(((gaitCycleProgress + 0.5) % 1) * 2 * Math.PI);
  
  const leftAnkleAngle = GAIT_CONSTANTS.NORMAL_ANKLE_DORSIFLEXION * Math.sin(gaitCycleProgress * Math.PI);
  const rightAnkleAngle = GAIT_CONSTANTS.NORMAL_ANKLE_DORSIFLEXION * Math.sin(((gaitCycleProgress + 0.5) % 1) * Math.PI);
  
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

// Helper function to analyze gait patterns
const analyzeGaitPattern = (
  dataHistory: GaitDataPoint[],
  parameters: GaitParameters
): MLAnalysisResult => {
  if (dataHistory.length < 10) {
    return {
      symmetryIndex: 50,
      confidenceScore: 0.1,
      patternRecognized: false,
      asymmetryDetected: false,
      gaitPhase: 'stance',
      insights: ['Collecting data...'],
      recommendations: ['Continue walking for more accurate analysis'],
    };
  }
  
  const recent = dataHistory.slice(-10);
  
  // Calculate symmetry index
  const leftForces = recent.map(d => d.leftFootForce);
  const rightForces = recent.map(d => d.rightFootForce);
  const avgLeftForce = leftForces.reduce((a, b) => a + b, 0) / leftForces.length;
  const avgRightForce = rightForces.reduce((a, b) => a + b, 0) / rightForces.length;
  
  const symmetryIndex = Math.max(0, 100 - Math.abs(avgLeftForce - avgRightForce) / Math.max(avgLeftForce, avgRightForce) * 100);
  
  // Build confidence over time
  const confidenceScore = Math.min(1, dataHistory.length / 50);
  
  // Detect asymmetry
  const asymmetryDetected = parameters.asymmetryFactor > 0.1 || Math.abs(avgLeftForce - avgRightForce) > 100;
  
  // Generate insights
  const insights: string[] = [];
  const recommendations: string[] = [];
  
  if (asymmetryDetected) {
    insights.push(`Asymmetry detected: ${(100 - symmetryIndex).toFixed(1)}% difference between legs`);
    insights.push(`Ground reaction force difference: ${Math.abs(avgLeftForce - avgRightForce).toFixed(0)}N`);
    recommendations.push('Consider evaluating movement patterns for potential compensatory strategies');
  } else {
    insights.push(`Symmetric gait pattern detected (${symmetryIndex.toFixed(1)}% symmetry)`);
    insights.push(`Consistent ground reaction forces: L=${avgLeftForce.toFixed(0)}N, R=${avgRightForce.toFixed(0)}N`);
  }
  
  if (parameters.walkingSpeed > 1.5) {
    insights.push(`Fast walking speed (${(parameters.walkingSpeed * 100).toFixed(0)}% of normal)`);
    insights.push(`Cadence increased to ${recent[recent.length - 1].cadence.toFixed(0)} steps/min`);
  } else if (parameters.walkingSpeed < 0.8) {
    insights.push(`Reduced walking speed (${(parameters.walkingSpeed * 100).toFixed(0)}% of normal)`);
    recommendations.push('Slower speeds may indicate compensation or caution in movement');
  }
  
  return {
    symmetryIndex,
    confidenceScore,
    patternRecognized: confidenceScore > 0.3,
    asymmetryDetected,
    gaitPhase: avgLeftForce > avgRightForce ? 'stance' : 'swing',
    insights,
    recommendations,
  };
};

export const useGaitAnalysisStore = create<GaitAnalysisStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    currentData: {
      timestamp: Date.now(),
      leftFootForce: 0,
      rightFootForce: 0,
      leftKneeAngle: 0,
      rightKneeAngle: 0,
      leftHipAngle: 0,
      rightHipAngle: 0,
      leftAnkleAngle: 0,
      rightAnkleAngle: 0,
      cadence: GAIT_CONSTANTS.NORMAL_CADENCE,
      stepLength: GAIT_CONSTANTS.NORMAL_STEP_LENGTH,
    },
    dataHistory: [],
    parameters: SCENARIO_PRESETS.NORMAL_BASELINE,
    mlAnalysis: {
      symmetryIndex: 100,
      confidenceScore: 0,
      patternRecognized: false,
      asymmetryDetected: false,
      gaitPhase: 'stance',
      insights: ['Demo starting...'],
      recommendations: ['Interact with controls to see AI analysis'],
    },
    animationState: {
      currentFrame: 0,
      gaitCycleProgress: 0,
      leftFootContact: true,
      rightFootContact: false,
      isWalking: false,
      recoveryPhase: false,
    },
    robotSensors: [
      {
        sensorId: 'force_plate_left',
        position: [-0.3, 0, 0],
        isActive: true,
        dataQuality: 0.95,
        sensorType: 'force_plate',
      },
      {
        sensorId: 'force_plate_right',
        position: [0.3, 0, 0],
        isActive: true,
        dataQuality: 0.95,
        sensorType: 'force_plate',
      },
      {
        sensorId: 'imu_pelvis',
        position: [0, 1.0, 0],
        isActive: true,
        dataQuality: 0.90,
        sensorType: 'imu',
      },
    ],
    userInteractions: [],
    
    // Settings
    isPlaying: false,
    isProcessing: false,
    processingProgress: 0,
    showDebugInfo: false,
    performanceMode: 'high',
    
    // Actions
    updateParameters: (newParams) => {
      const currentParams = get().parameters;
      const updatedParams = { ...currentParams, ...newParams };
      
      set({ parameters: updatedParams });
      
      // Record user interaction
      get().recordInteraction({
        action: 'speed_change',
        timestamp: Date.now(),
        parameters: newParams,
      });
    },
    
    setWalkingSpeed: (speed) => {
      get().updateParameters({ walkingSpeed: Math.max(0.3, Math.min(2.5, speed)) });
    },
    
    setAsymmetry: (factor, leftTiming = 0, rightTiming = 0) => {
      get().updateParameters({
        asymmetryFactor: Math.max(0, Math.min(1, factor)),
        leftLegTiming: Math.max(-0.2, Math.min(0.2, leftTiming)),
        rightLegTiming: Math.max(-0.2, Math.min(0.2, rightTiming)),
      });
    },
    
    triggerPerturbation: (type) => {
      const currentParams = get().parameters;
      set({
        parameters: {
          ...currentParams,
          perturbationActive: true,
          perturbationType: type,
        },
        animationState: {
          ...get().animationState,
          recoveryPhase: true,
        },
      });
      
      // Auto-disable perturbation after 2 seconds
      setTimeout(() => {
        const state = get();
        set({
          parameters: {
            ...state.parameters,
            perturbationActive: false,
            perturbationType: null,
          },
          animationState: {
            ...state.animationState,
            recoveryPhase: false,
          },
        });
      }, 2000);
      
      get().recordInteraction({
        action: 'perturbation_trigger',
        timestamp: Date.now(),
        value: type === 'stumble' ? 1 : type === 'trip' ? 2 : 3,
      });
    },
    
    resetToBaseline: () => {
      set({
        parameters: SCENARIO_PRESETS.NORMAL_BASELINE,
        dataHistory: [],
        mlAnalysis: {
          symmetryIndex: 100,
          confidenceScore: 0,
          patternRecognized: false,
          asymmetryDetected: false,
          gaitPhase: 'stance',
          insights: ['Reset to baseline - starting fresh analysis'],
          recommendations: ['Begin walking to generate new analysis'],
        },
      });
      
      get().recordInteraction({
        action: 'reset',
        timestamp: Date.now(),
      });
    },
    
    loadScenario: (scenarioName) => {
      const scenario = SCENARIO_PRESETS[scenarioName];
      set({ parameters: scenario });
      
      get().recordInteraction({
        action: 'speed_change',
        timestamp: Date.now(),
        parameters: scenario,
      });
    },
    
    addDataPoint: (data) => {
      const history = get().dataHistory;
      const newHistory = [...history, data].slice(-500); // Keep last 500 points
      
      set({
        currentData: data,
        dataHistory: newHistory,
      });
      
      // Update ML analysis
      const analysis = analyzeGaitPattern(newHistory, get().parameters);
      set({ mlAnalysis: analysis });
    },
    
    clearHistory: () => {
      set({ dataHistory: [] });
    },
      exportData: () => {
      // Only allow export in browser environment
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        console.warn('Export function only available in browser environment');
        return;
      }

      const { dataHistory, mlAnalysis, parameters, userInteractions } = get();
      
      const exportData = {
        timestamp: new Date().toISOString(),
        parameters,
        dataPoints: dataHistory,
        analysis: mlAnalysis,
        interactions: userInteractions,
        metadata: {
          version: '1.0',
          demo: 'Real-Time Gait Analysis Robot',
          totalDataPoints: dataHistory.length,
          sessionDuration: dataHistory.length > 0 ? 
            (dataHistory[dataHistory.length - 1].timestamp - dataHistory[0].timestamp) / 1000 : 0,
        },
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gait-analysis-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      get().recordInteraction({
        action: 'export',
        timestamp: Date.now(),
      });
    },
    
    updateMLAnalysis: (analysis) => {
      const current = get().mlAnalysis;
      set({ mlAnalysis: { ...current, ...analysis } });
    },
    
    startProcessing: () => {
      set({ isProcessing: true, processingProgress: 0 });
    },
    
    stopProcessing: () => {
      set({ isProcessing: false, processingProgress: 100 });
    },
    
    updateAnimationState: (state) => {
      const current = get().animationState;
      set({ animationState: { ...current, ...state } });
    },
    
    startAnimation: () => {
      set({ 
        isPlaying: true,
        animationState: {
          ...get().animationState,
          isWalking: true,
        },
      });
    },
    
    stopAnimation: () => {
      set({ 
        isPlaying: false,
        animationState: {
          ...get().animationState,
          isWalking: false,
        },
      });
    },
    
    recordInteraction: (interaction) => {
      const interactions = get().userInteractions;
      const newInteractions = [...interactions, interaction].slice(-100); // Keep last 100
      set({ userInteractions: newInteractions });
    },
  }))
);
