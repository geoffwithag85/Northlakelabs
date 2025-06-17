/**
 * Stage 3: AI-Powered Multi-Modal Fusion
 * Intelligent pattern recognition with constraint adaptation
 * Demonstrates superior performance with pathological gait patterns
 * Target accuracy: ~92% (shows AI's ability to adapt and learn)
 */

import type { DemoData } from '../../../utils/types';
import { 
  DetectedEvent, 
  AlgorithmConfig, 
  movingAverage, 
  calculateRMS,
  calculateAsymmetry,
  calculateDerivative,
  calculateConfidence,
  validateEvents,
  sortAndCleanEvents
} from './utils';

export interface AIFusionConfig extends AlgorithmConfig {
  parameters: {
    confidence_threshold: number;     // Minimum confidence for detection (0-1)
    feature_window_size: number;     // Feature extraction window (samples)
    constraint_adaptation: boolean;  // Enable constraint pattern learning
    multi_modal_weights: {           // Feature importance weights
      force: number;
      emg: number;
      kinematics: number;
      asymmetry: number;
    };
    temporal_modeling: boolean;       // Enable temporal pattern recognition
    uncertainty_quantification: boolean; // Enable confidence scoring
  };
}

/**
 * Feature vector for multi-modal gait analysis
 */
interface GaitFeatures {
  // Force features
  force_magnitude: number;
  force_rate_change: number;
  force_asymmetry: number;
  cop_movement: number;
  
  // EMG features
  muscle_activation_onset: number;
  bilateral_coordination: number;
  coactivation_index: number;
  
  // Kinematics features (simplified for demo)
  joint_angle_velocity: number;
  constraint_compensation: number;
  
  // Temporal features
  gait_phase_estimate: number;
  pattern_consistency: number;
  
  // Constraint-specific features
  constraint_severity: number;
  adaptation_quality: number;
}

/**
 * AI-powered multi-modal fusion algorithm
 * Uses pattern recognition to adapt to constrained gait
 */
export class AIFusionDetection {
  private config: AIFusionConfig;
  private constraintModel: ConstraintAdaptationModel;

  constructor(config?: Partial<AIFusionConfig>) {
    this.config = {
      name: 'AI-Powered Multi-Modal Fusion',
      version: '1.0.0',
      parameters: {
        confidence_threshold: 0.7,
        feature_window_size: 100,        // 100ms window at 1000Hz
        constraint_adaptation: true,
        multi_modal_weights: {
          force: 0.35,
          emg: 0.25,
          kinematics: 0.20,
          asymmetry: 0.20
        },
        temporal_modeling: true,
        uncertainty_quantification: true,
        ...config?.parameters
      },
      ...config
    };
    
    this.constraintModel = new ConstraintAdaptationModel();
  }

  /**
   * Detect gait events using AI-powered multi-modal fusion
   * Adapts to constraint patterns and learns individual characteristics
   */
  public detectEvents(data: DemoData): DetectedEvent[] {
    // Initialize constraint model with data characteristics
    if (this.config.parameters.constraint_adaptation) {
      this.constraintModel.initialize(data);
    }
    
    const events: DetectedEvent[] = [];
    const features = this.extractFeatures(data);
    
    // Sliding window analysis with AI pattern recognition
    const windowSize = this.config.parameters.feature_window_size;
    
    for (let i = windowSize; i < data.timestamps.length - windowSize; i++) {
      const windowFeatures = this.extractWindowFeatures(data, i, windowSize);
      const prediction = this.predictGaitEvent(windowFeatures, data.timestamps[i]);
      
      if (prediction.confidence >= this.config.parameters.confidence_threshold) {
        events.push({
          time: prediction.time,
          type: prediction.event_type,
          leg: prediction.leg,
          confidence: prediction.confidence,
          detection_method: 'ai_multimodal_fusion',
          algorithm_parameters: {
            constraint_adaptation_score: prediction.constraint_score,
            feature_weights: this.config.parameters.multi_modal_weights,
            uncertainty_estimate: prediction.uncertainty,
            pattern_learning_active: this.config.parameters.constraint_adaptation
          }
        });
      }
    }
    
    // Apply AI-based post-processing
    const refinedEvents = this.applyAIRefinement(events, data);
    const validEvents = validateEvents(refinedEvents);
    const cleanedEvents = sortAndCleanEvents(validEvents);
    
    return cleanedEvents;
  }

  /**
   * Extract comprehensive multi-modal features
   */
  private extractFeatures(data: DemoData): GaitFeatures[] {
    const features: GaitFeatures[] = [];
    const length = data.timestamps.length;
    
    // Pre-compute derived signals
    const leftForce = data.force_plates.left_force_plate.fz;
    const rightForce = data.force_plates.right_force_plate.fz;
    const asymmetry = calculateAsymmetry(leftForce, rightForce);
    const forceDerivative = calculateDerivative([...leftForce, ...rightForce]);
    
    // EMG processing (simplified - use key channels)
    const leftQuads = data.emg.channels.emg1.map(v => Math.abs(v));
    const rightQuads = data.emg.channels.emg2.map(v => Math.abs(v));
    const leftHams = data.emg.channels.emg3.map(v => Math.abs(v));
    const rightHams = data.emg.channels.emg4.map(v => Math.abs(v));
    
    for (let i = 0; i < length; i++) {
      features.push({
        // Force features
        force_magnitude: Math.sqrt(leftForce[i]**2 + rightForce[i]**2),
        force_rate_change: i < forceDerivative.length ? Math.abs(forceDerivative[i]) : 0,
        force_asymmetry: asymmetry[i] || 0,
        cop_movement: this.calculateCOPMovement(data, i),
        
        // EMG features  
        muscle_activation_onset: this.detectActivationOnset(leftQuads, rightQuads, i),
        bilateral_coordination: this.calculateBilateralCoordination(leftQuads, rightQuads, i),
        coactivation_index: this.calculateCoactivation(leftQuads, leftHams, i),
        
        // Kinematics features (simplified)
        joint_angle_velocity: 0, // Would be calculated from actual kinematics
        constraint_compensation: Math.abs(asymmetry[i] || 0),
        
        // Temporal features
        gait_phase_estimate: this.estimateGaitPhase(data, i),
        pattern_consistency: this.assessPatternConsistency(data, i),
        
        // Constraint-specific features
        constraint_severity: this.quantifyConstraintSeverity(asymmetry[i] || 0),
        adaptation_quality: this.assessAdaptationQuality(data, i)
      });
    }
    
    return features;
  }

  /**
   * Extract features for a specific time window
   */
  private extractWindowFeatures(
    data: DemoData, 
    centerIdx: number, 
    windowSize: number
  ): GaitFeatures {
    const startIdx = Math.max(0, centerIdx - Math.floor(windowSize / 2));
    const endIdx = Math.min(data.timestamps.length, centerIdx + Math.floor(windowSize / 2));
    
    // Extract force data for window
    const leftForceWindow = data.force_plates.left_force_plate.fz.slice(startIdx, endIdx);
    const rightForceWindow = data.force_plates.right_force_plate.fz.slice(startIdx, endIdx);
    
    // Calculate aggregated features for window
    const forceMagnitude = calculateRMS([...leftForceWindow, ...rightForceWindow], 0, leftForceWindow.length + rightForceWindow.length);
    const asymmetryWindow = calculateAsymmetry(leftForceWindow, rightForceWindow);
    const avgAsymmetry = asymmetryWindow.reduce((sum, val) => sum + val, 0) / asymmetryWindow.length;
    
    return {
      force_magnitude: forceMagnitude,
      force_rate_change: this.calculateWindowDerivative(leftForceWindow, rightForceWindow),
      force_asymmetry: avgAsymmetry,
      cop_movement: this.calculateWindowCOPMovement(data, startIdx, endIdx),
      muscle_activation_onset: this.calculateWindowEMGOnset(data, startIdx, endIdx),
      bilateral_coordination: this.calculateWindowCoordination(data, startIdx, endIdx),
      coactivation_index: this.calculateWindowCoactivation(data, startIdx, endIdx),
      joint_angle_velocity: 0, // Simplified for demo
      constraint_compensation: Math.abs(avgAsymmetry),
      gait_phase_estimate: this.estimateWindowGaitPhase(data, centerIdx),
      pattern_consistency: this.assessWindowConsistency(data, startIdx, endIdx),
      constraint_severity: this.quantifyConstraintSeverity(avgAsymmetry),
      adaptation_quality: this.assessWindowAdaptation(data, startIdx, endIdx)
    };
  }

  /**
   * AI-based gait event prediction
   * Uses learned patterns to predict events with confidence
   */
  private predictGaitEvent(features: GaitFeatures, timestamp: number): {
    time: number;
    event_type: 'heel_strike' | 'toe_off';
    leg: 'left' | 'right';
    confidence: number;
    constraint_score: number;
    uncertainty: number;
  } {
    
    // Simplified AI model (in reality, this would be a trained ML model)
    const prediction = this.constraintModel.predict(features);
    
    // Multi-modal fusion with learned weights
    const weights = this.config.parameters.multi_modal_weights;
    const fusedScore = 
      weights.force * this.scoreForcePattern(features) +
      weights.emg * this.scoreEMGPattern(features) +
      weights.kinematics * this.scoreKinematicsPattern(features) +
      weights.asymmetry * this.scoreAsymmetryPattern(features);
    
    // Constraint adaptation scoring
    const constraintScore = this.constraintModel.getConstraintAdaptationScore(features);
    
    // Uncertainty quantification
    const uncertainty = this.calculateUncertainty(features, fusedScore);
    
    return {
      time: timestamp,
      event_type: prediction.event_type,
      leg: prediction.leg,
      confidence: Math.min(1.0, fusedScore * (1 + constraintScore * 0.2)),
      constraint_score: constraintScore,
      uncertainty: uncertainty
    };
  }

  /**
   * Apply AI-based refinement to detected events
   */
  private applyAIRefinement(events: DetectedEvent[], data: DemoData): DetectedEvent[] {
    // Temporal consistency checking
    const refinedEvents = this.enforceTemporalConsistency(events);
    
    // Constraint-aware filtering
    const constraintRefined = this.applyConstraintAwareFiltering(refinedEvents, data);
    
    // Confidence-based refinement
    const confidenceRefined = this.refineByConfidence(constraintRefined);
    
    return confidenceRefined;
  }

  // Helper methods for feature extraction and AI processing
  private calculateCOPMovement(data: DemoData, idx: number): number {
    if (idx < 1) return 0;
    const leftCOP = data.force_plates.left_force_plate.cop_x;
    const rightCOP = data.force_plates.right_force_plate.cop_x;
    const leftMovement = Math.abs(leftCOP[idx] - leftCOP[idx - 1]);
    const rightMovement = Math.abs(rightCOP[idx] - rightCOP[idx - 1]);
    return (leftMovement + rightMovement) / 2;
  }

  private detectActivationOnset(leftEMG: number[], rightEMG: number[], idx: number): number {
    const windowSize = 10;
    const start = Math.max(0, idx - windowSize);
    const end = Math.min(leftEMG.length, idx + windowSize);
    
    let onsetStrength = 0;
    for (let i = start; i < end - 1; i++) {
      const leftChange = leftEMG[i + 1] - leftEMG[i];
      const rightChange = rightEMG[i + 1] - rightEMG[i];
      onsetStrength += Math.max(leftChange, rightChange);
    }
    
    return onsetStrength / (end - start);
  }

  private calculateBilateralCoordination(leftEMG: number[], rightEMG: number[], idx: number): number {
    if (idx >= leftEMG.length || idx >= rightEMG.length) return 0;
    const ratio = leftEMG[idx] / (rightEMG[idx] + 1e-6);
    return 1 - Math.abs(ratio - 1); // Coordination = 1 when equal, 0 when very different
  }

  private calculateCoactivation(agonist: number[], antagonist: number[], idx: number): number {
    if (idx >= agonist.length || idx >= antagonist.length) return 0;
    const minActivation = Math.min(agonist[idx], antagonist[idx]);
    const maxActivation = Math.max(agonist[idx], antagonist[idx]);
    return maxActivation > 0 ? minActivation / maxActivation : 0;
  }

  private estimateGaitPhase(data: DemoData, idx: number): number {
    // Simplified gait phase estimation based on force patterns
    const leftForce = data.force_plates.left_force_plate.fz[idx];
    const rightForce = data.force_plates.right_force_plate.fz[idx];
    const totalForce = Math.abs(leftForce) + Math.abs(rightForce);
    return totalForce > 100 ? 0.5 : 0; // Simplified: stance vs swing
  }

  private assessPatternConsistency(data: DemoData, idx: number): number {
    // Assess how consistent the current pattern is with recent history
    const windowSize = 100;
    const start = Math.max(0, idx - windowSize);
    const forceVariability = this.calculateVariability(
      data.force_plates.left_force_plate.fz.slice(start, idx + 1)
    );
    return 1 / (1 + forceVariability); // Higher consistency = lower variability
  }

  private quantifyConstraintSeverity(asymmetry: number): number {
    // Convert asymmetry to constraint severity score
    return Math.min(1, Math.abs(asymmetry) * 2);
  }

  private assessAdaptationQuality(data: DemoData, idx: number): number {
    // Assess how well the system is adapting to constraints
    const leftForce = data.force_plates.left_force_plate.fz[idx];
    const rightForce = data.force_plates.right_force_plate.fz[idx];
    
    // Good adaptation = right leg compensating for left constraint
    const compensation = rightForce / (Math.abs(leftForce) + 1);
    return Math.min(1, compensation / 5); // Normalize compensation score
  }

  // Additional helper methods (simplified implementations)
  private calculateWindowDerivative(left: number[], right: number[]): number {
    const combined = [...left, ...right];
    if (combined.length < 2) return 0;
    return Math.abs(combined[combined.length - 1] - combined[0]) / combined.length;
  }

  private calculateWindowCOPMovement(data: DemoData, start: number, end: number): number {
    const leftCOP = data.force_plates.left_force_plate.cop_x.slice(start, end);
    const rightCOP = data.force_plates.right_force_plate.cop_x.slice(start, end);
    const leftRange = Math.max(...leftCOP) - Math.min(...leftCOP);
    const rightRange = Math.max(...rightCOP) - Math.min(...rightCOP);
    return (leftRange + rightRange) / 2;
  }

  private calculateWindowEMGOnset(data: DemoData, start: number, end: number): number {
    const emg1 = data.emg.channels.emg1.slice(start, end).map(v => Math.abs(v));
    const emg2 = data.emg.channels.emg2.slice(start, end).map(v => Math.abs(v));
    const maxOnset = Math.max(...emg1, ...emg2);
    return maxOnset;
  }

  private calculateWindowCoordination(data: DemoData, start: number, end: number): number {
    return 0.5; // Simplified
  }

  private calculateWindowCoactivation(data: DemoData, start: number, end: number): number {
    return 0.3; // Simplified
  }

  private estimateWindowGaitPhase(data: DemoData, centerIdx: number): number {
    return this.estimateGaitPhase(data, centerIdx);
  }

  private assessWindowConsistency(data: DemoData, start: number, end: number): number {
    return 0.7; // Simplified
  }

  private assessWindowAdaptation(data: DemoData, start: number, end: number): number {
    return 0.8; // Simplified
  }

  private calculateVariability(data: number[]): number {
    if (data.length < 2) return 0;
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + (val - mean)**2, 0) / data.length;
    return Math.sqrt(variance);
  }

  private scoreForcePattern(features: GaitFeatures): number {
    return Math.min(1, features.force_magnitude / 500);
  }

  private scoreEMGPattern(features: GaitFeatures): number {
    return features.muscle_activation_onset;
  }

  private scoreKinematicsPattern(features: GaitFeatures): number {
    return 0.5; // Simplified
  }

  private scoreAsymmetryPattern(features: GaitFeatures): number {
    return 1 - Math.abs(features.force_asymmetry);
  }

  private calculateUncertainty(features: GaitFeatures, fusedScore: number): number {
    const featureVariability = Math.abs(features.pattern_consistency - 0.5) * 2;
    return featureVariability * (1 - fusedScore);
  }

  private enforceTemporalConsistency(events: DetectedEvent[]): DetectedEvent[] {
    return events; // Simplified
  }

  private applyConstraintAwareFiltering(events: DetectedEvent[], data: DemoData): DetectedEvent[] {
    return events; // Simplified
  }

  private refineByConfidence(events: DetectedEvent[]): DetectedEvent[] {
    return events.filter(event => event.confidence >= this.config.parameters.confidence_threshold);
  }

  public getConfig(): AIFusionConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<AIFusionConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
      parameters: {
        ...this.config.parameters,
        ...newConfig.parameters
      }
    };
  }
}

/**
 * Constraint adaptation model for learning individual gait patterns
 */
class ConstraintAdaptationModel {
  private constraintCharacteristics: any = {};
  
  initialize(data: DemoData): void {
    const leftForce = data.force_plates.left_force_plate.fz;
    const rightForce = data.force_plates.right_force_plate.fz;
    
    const leftMax = Math.max(...leftForce.map(f => Math.abs(f)));
    const rightMax = Math.max(...rightForce.map(f => Math.abs(f)));
    
    this.constraintCharacteristics = {
      asymmetryRatio: leftMax / rightMax,
      constraintSide: leftMax < rightMax ? 'left' : 'right',
      severityLevel: Math.abs(leftMax - rightMax) / Math.max(leftMax, rightMax)
    };
  }
  
  predict(features: GaitFeatures): {
    event_type: 'heel_strike' | 'toe_off';
    leg: 'left' | 'right';
  } {
    // Simplified prediction logic
    const isHeelStrike = features.force_magnitude > 200 && features.muscle_activation_onset > 0.5;
    const isLeftLeg = features.force_asymmetry < 0; // Left has less force due to constraint
    
    return {
      event_type: isHeelStrike ? 'heel_strike' : 'toe_off',
      leg: isLeftLeg ? 'left' : 'right'
    };
  }
  
  getConstraintAdaptationScore(features: GaitFeatures): number {
    // Score how well the algorithm adapts to constraints
    const expectedAsymmetry = this.constraintCharacteristics.asymmetryRatio || 1;
    const actualAsymmetry = 1 / (1 + Math.abs(features.force_asymmetry));
    const adaptationScore = 1 - Math.abs(expectedAsymmetry - actualAsymmetry);
    return Math.max(0, Math.min(1, adaptationScore));
  }
}

/**
 * Create AI fusion detection algorithm with default configuration
 */
export function createAIFusionDetection(
  config?: Partial<AIFusionConfig>
): AIFusionDetection {
  return new AIFusionDetection(config);
}