// TypeScript interfaces and types for the Gait Analysis Demo

export interface GaitDataPoint {
  timestamp: number;
  leftFootForce: number;
  rightFootForce: number;
  leftKneeAngle: number;
  rightKneeAngle: number;
  leftHipAngle: number;
  rightHipAngle: number;
  leftAnkleAngle: number;
  rightAnkleAngle: number;
  cadence: number;
  stepLength: number;
}

export interface GaitParameters {
  walkingSpeed: number; // 0.5 to 2.5 (multiplier of normal speed)
  asymmetryFactor: number; // 0 to 1 (0 = symmetric, 1 = maximum asymmetry)
  leftLegTiming: number; // -0.2 to 0.2 (timing offset in seconds)
  rightLegTiming: number; // -0.2 to 0.2 (timing offset in seconds)
  perturbationActive: boolean;
  perturbationType: 'stumble' | 'trip' | 'external_force' | null;
}

export interface MLAnalysisResult {
  symmetryIndex: number; // 0 to 100 (100 = perfect symmetry)
  confidenceScore: number; // 0 to 1
  patternRecognized: boolean;
  asymmetryDetected: boolean;
  gaitPhase: 'stance' | 'swing' | 'double_support';
  insights: string[];
  recommendations: string[];
}

export interface RobotSensorData {
  sensorId: string;
  position: [number, number, number]; // 3D position
  isActive: boolean;
  dataQuality: number; // 0 to 1
  sensorType: 'force_plate' | 'imu' | 'camera' | 'pressure';
}

export interface AnimationState {
  currentFrame: number;
  gaitCycleProgress: number; // 0 to 1
  leftFootContact: boolean;
  rightFootContact: boolean;
  isWalking: boolean;
  recoveryPhase: boolean;
}

export interface ChartConfiguration {
  updateFrequency: number; // Hz
  dataBufferSize: number; // number of points to keep
  showConfidenceInterval: boolean;
  chartType: 'force' | 'angles' | 'symmetry' | 'cadence';
  exportEnabled: boolean;
}

export interface DemoSettings {
  performanceMode: 'high' | 'medium' | 'low';
  showDebugInfo: boolean;
  enableParticleEffects: boolean;
  chartUpdateRate: number;
  autoDemo: boolean;
  guidedTour: boolean;
}

export interface UserInteraction {
  action: 'speed_change' | 'asymmetry_adjust' | 'perturbation_trigger' | 'reset' | 'export';
  timestamp: number;
  parameters?: Partial<GaitParameters>;
  value?: number;
}

// Custom hooks return types
export interface UseGaitDataReturn {
  currentData: GaitDataPoint;
  dataHistory: GaitDataPoint[];
  parameters: GaitParameters;
  updateParameters: (newParams: Partial<GaitParameters>) => void;
  resetToBaseline: () => void;
  exportData: () => void;
}

export interface UseMLAnalysisReturn {
  analysis: MLAnalysisResult;
  isProcessing: boolean;
  processingProgress: number;
  startAnalysis: () => void;
  stopAnalysis: () => void;
}

export interface UseAnimationReturn {
  animationState: AnimationState;
  startAnimation: () => void;
  stopAnimation: () => void;
  setSpeed: (speed: number) => void;
  triggerPerturbation: (type: GaitParameters['perturbationType']) => void;
}

// Constants for realistic gait parameters
export const GAIT_CONSTANTS = {
  NORMAL_CADENCE: 110, // steps per minute
  NORMAL_STEP_LENGTH: 0.65, // meters
  NORMAL_WALKING_SPEED: 1.3, // m/s
  GAIT_CYCLE_DURATION: 1.0, // seconds
  STANCE_PHASE_PERCENTAGE: 0.6, // 60% of gait cycle
  SWING_PHASE_PERCENTAGE: 0.4, // 40% of gait cycle
  NORMAL_KNEE_FLEXION: 60, // degrees
  NORMAL_HIP_EXTENSION: 18, // degrees
  NORMAL_ANKLE_DORSIFLEXION: 15, // degrees
  MAX_GROUND_REACTION_FORCE: 1200, // Newtons (for 70kg person)
} as const;

// Scenario presets for different gait patterns
export const SCENARIO_PRESETS = {
  NORMAL_BASELINE: {
    walkingSpeed: 1.0,
    asymmetryFactor: 0.0,
    leftLegTiming: 0.0,
    rightLegTiming: 0.0, // Right leg offset handled in data generation
    perturbationActive: false,
    perturbationType: null,
  },
  MILD_LIMP: {
    walkingSpeed: 0.8,
    asymmetryFactor: 0.3,
    leftLegTiming: 0.05,
    rightLegTiming: -0.05,
    perturbationActive: false,
    perturbationType: null,
  },
  FAST_WALK: {
    walkingSpeed: 1.8,
    asymmetryFactor: 0.0,
    leftLegTiming: 0.0,
    rightLegTiming: 0.0,
    perturbationActive: false,
    perturbationType: null,
  },
  RECOVERY_ANALYSIS: {
    walkingSpeed: 1.0,
    asymmetryFactor: 0.0,
    leftLegTiming: 0.0,
    rightLegTiming: 0.0,
    perturbationActive: true,
    perturbationType: 'stumble' as const,
  },
} as const;
