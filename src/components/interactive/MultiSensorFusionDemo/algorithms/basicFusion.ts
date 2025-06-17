/**
 * Stage 2: Basic Multi-Sensor Fusion
 * Rule-based combination of force plates and EMG signals
 * Improved over traditional but limited by rigid fusion logic
 * Target accuracy: ~75% (better than traditional but still fails with complex patterns)
 */

import type { DemoData } from '../../../utils/types';
import { 
  DetectedEvent, 
  AlgorithmConfig, 
  movingAverage, 
  calculateRMS,
  calculateConfidence,
  validateEvents,
  sortAndCleanEvents
} from './utils';

export interface BasicFusionConfig extends AlgorithmConfig {
  parameters: {
    force_threshold: number;          // Reduced force threshold (N)
    emg_threshold: number;            // EMG activation threshold (V)
    fusion_window: number;            // Time window for sensor fusion (s)
    confirmation_required: boolean;   // Require EMG confirmation for force events
    emg_smoothing_window: number;     // EMG envelope smoothing (samples)
    min_emg_duration: number;         // Minimum EMG activation duration (s)
    asymmetry_compensation: boolean;  // Enable basic asymmetry handling
  };
}

/**
 * Basic multi-sensor fusion algorithm
 * Combines force and EMG using simple rule-based logic
 * More robust than traditional but still limited by rigid rules
 */
export class BasicFusionDetection {
  private config: BasicFusionConfig;

  constructor(config?: Partial<BasicFusionConfig>) {
    this.config = {
      name: 'Basic Multi-Sensor Fusion',
      version: '1.0.0',
      parameters: {
        force_threshold: 30,            // Reduced from traditional (50N)
        emg_threshold: 0.000050,        // 50 µV threshold for muscle activation
        fusion_window: 0.100,           // 100ms window for sensor agreement
        confirmation_required: true,    // EMG must confirm force events
        emg_smoothing_window: 50,       // 50ms EMG smoothing
        min_emg_duration: 0.050,        // 50ms minimum EMG activation
        asymmetry_compensation: true,   // Basic left-right adjustment
        ...config?.parameters
      },
      ...config
    };
  }

  /**
   * Detect gait events using multi-sensor fusion
   * Combines force plate and EMG signals with rule-based logic
   */
  public detectEvents(data: DemoData): DetectedEvent[] {
    const events: DetectedEvent[] = [];
    
    // Process both legs with sensor fusion
    const leftEvents = this.processFusedData(data, 'left');
    const rightEvents = this.processFusedData(data, 'right');
    
    events.push(...leftEvents);
    events.push(...rightEvents);
    
    // Apply fusion rules and validation
    const fusedEvents = this.applyFusionRules(events, data);
    const validEvents = validateEvents(fusedEvents);
    const cleanedEvents = sortAndCleanEvents(validEvents);
    
    return cleanedEvents;
  }

  /**
   * Process fused sensor data for a single leg
   * Combines force and EMG with basic rules
   */
  private processFusedData(data: DemoData, leg: 'left' | 'right'): DetectedEvent[] {
    const events: DetectedEvent[] = [];
    const { parameters } = this.config;
    
    // Get force data for the leg
    const forceData = leg === 'left' 
      ? data.force_plates.left_force_plate.fz 
      : data.force_plates.right_force_plate.fz;
    
    // Get relevant EMG channels (simplified muscle selection)
    const quadricepsEMG = leg === 'left' 
      ? data.emg.channels.emg1 // Assume EMG1 = left quadriceps
      : data.emg.channels.emg2; // Assume EMG2 = right quadriceps
    
    const hamstringEMG = leg === 'left'
      ? data.emg.channels.emg3 // Assume EMG3 = left hamstring
      : data.emg.channels.emg4; // Assume EMG4 = right hamstring
    
    // Apply basic asymmetry compensation
    let adjustedThreshold = parameters.force_threshold;
    if (parameters.asymmetry_compensation && leg === 'left') {
      // Reduce threshold for constrained left leg
      adjustedThreshold *= 0.6; // 40% reduction for constrained leg
    }
    
    // Smooth EMG signals
    const smoothedQuads = movingAverage(
      quadricepsEMG.map(v => Math.abs(v)), 
      parameters.emg_smoothing_window
    );
    const smoothedHams = movingAverage(
      hamstringEMG.map(v => Math.abs(v)), 
      parameters.emg_smoothing_window
    );
    
    // State tracking
    let inStance = false;
    let stanceStartTime = 0;
    
    for (let i = 1; i < forceData.length; i++) {
      const currentForce = forceData[i];
      const currentTime = data.timestamps[i];
      const quadsActivation = smoothedQuads[i];
      const hamsActivation = smoothedHams[i];
      
      // Heel strike detection with EMG confirmation
      if (!inStance && currentForce > adjustedThreshold) {
        
        // Check for EMG confirmation within fusion window
        const emgConfirmation = this.checkEMGConfirmation(
          smoothedQuads, 
          i, 
          parameters.fusion_window,
          parameters.emg_threshold,
          data.timestamps
        );
        
        if (!parameters.confirmation_required || emgConfirmation.confirmed) {
          const confidence = this.calculateFusedConfidence(
            currentForce,
            adjustedThreshold,
            quadsActivation,
            parameters.emg_threshold,
            emgConfirmation.strength
          );
          
          events.push({
            time: currentTime,
            type: 'heel_strike',
            leg,
            confidence,
            detection_method: 'basic_fusion',
            algorithm_parameters: {
              force_value: currentForce,
              force_threshold: adjustedThreshold,
              emg_confirmation: emgConfirmation.confirmed,
              emg_strength: emgConfirmation.strength,
              fusion_method: 'force_emg_agreement'
            }
          });
          
          inStance = true;
          stanceStartTime = currentTime;
        }
      }
      
      // Toe off detection with EMG pattern
      else if (inStance && currentForce < adjustedThreshold * 0.4) {
        
        // Look for hamstring activation (toe-off indicator)
        const hamstringConfirmation = this.checkEMGConfirmation(
          smoothedHams,
          i,
          parameters.fusion_window,
          parameters.emg_threshold * 0.8, // Lower threshold for toe-off
          data.timestamps
        );
        
        const stanceDuration = currentTime - stanceStartTime;
        if (stanceDuration >= 0.2) { // Minimum stance time
          
          const confidence = this.calculateFusedConfidence(
            Math.abs(currentForce - adjustedThreshold),
            adjustedThreshold * 0.4,
            hamsActivation,
            parameters.emg_threshold * 0.8,
            hamstringConfirmation.strength
          );
          
          events.push({
            time: currentTime,
            type: 'toe_off',
            leg,
            confidence,
            detection_method: 'basic_fusion',
            algorithm_parameters: {
              force_value: currentForce,
              force_threshold: adjustedThreshold * 0.4,
              emg_confirmation: hamstringConfirmation.confirmed,
              emg_strength: hamstringConfirmation.strength,
              stance_duration: stanceDuration,
              fusion_method: 'force_emg_agreement'
            }
          });
          
          inStance = false;
        }
      }
    }
    
    return events;
  }

  /**
   * Check for EMG confirmation within a time window
   */
  private checkEMGConfirmation(
    emgData: number[],
    centerIdx: number,
    windowSeconds: number,
    threshold: number,
    timestamps: number[]
  ): { confirmed: boolean; strength: number } {
    
    const samplingRate = 1000; // 1000Hz
    const windowSamples = Math.floor(windowSeconds * samplingRate);
    const startIdx = Math.max(0, centerIdx - windowSamples);
    const endIdx = Math.min(emgData.length, centerIdx + windowSamples);
    
    let maxActivation = 0;
    let activationCount = 0;
    
    for (let i = startIdx; i < endIdx; i++) {
      if (emgData[i] > threshold) {
        activationCount++;
        maxActivation = Math.max(maxActivation, emgData[i]);
      }
    }
    
    const activationRatio = activationCount / (endIdx - startIdx);
    const confirmed = activationRatio > 0.3; // 30% of window must be above threshold
    
    return {
      confirmed,
      strength: maxActivation
    };
  }

  /**
   * Calculate fused confidence score from multiple sensors
   */
  private calculateFusedConfidence(
    forceValue: number,
    forceThreshold: number,
    emgValue: number,
    emgThreshold: number,
    emgStrength: number
  ): number {
    
    // Force confidence
    const forceConfidence = calculateConfidence(forceValue, forceThreshold, 1000);
    
    // EMG confidence
    const emgConfidence = calculateConfidence(emgValue, emgThreshold, 0.001);
    
    // Weighted fusion (force has more weight due to reliability)
    const fusedConfidence = 0.7 * forceConfidence + 0.3 * emgConfidence;
    
    // Boost confidence if both sensors agree strongly
    if (forceConfidence > 0.7 && emgConfidence > 0.7) {
      return Math.min(1.0, fusedConfidence * 1.2);
    }
    
    return fusedConfidence;
  }

  /**
   * Apply rule-based fusion logic to refine event detection
   * This demonstrates the limitations of rigid rule systems
   */
  private applyFusionRules(events: DetectedEvent[], data: DemoData): DetectedEvent[] {
    const refinedEvents: DetectedEvent[] = [];
    
    // Rule 1: Remove events with very low confidence
    const highConfidenceEvents = events.filter(event => event.confidence > 0.2);
    
    // Rule 2: Enforce alternating heel strike pattern (rigid rule that can fail)
    const leftEvents = highConfidenceEvents.filter(e => e.leg === 'left' && e.type === 'heel_strike');
    const rightEvents = highConfidenceEvents.filter(e => e.leg === 'right' && e.type === 'heel_strike');
    
    // Simple alternating pattern enforcement (this is where rigid rules fail)
    let expectedNext: 'left' | 'right' = 'right'; // Assume right starts
    const allHeelStrikes = [...leftEvents, ...rightEvents]
      .sort((a, b) => a.time - b.time);
    
    for (const event of allHeelStrikes) {
      // Rigid rule: only accept if it matches expected pattern
      // This fails with constrained gait where patterns are irregular
      if (event.leg === expectedNext || event.confidence > 0.8) {
        refinedEvents.push(event);
        expectedNext = event.leg === 'left' ? 'right' : 'left';
      }
      // Else: reject event due to rigid pattern expectation
    }
    
    // Add toe-off events (less strict rules)
    const toeOffEvents = highConfidenceEvents.filter(e => e.type === 'toe_off');
    refinedEvents.push(...toeOffEvents);
    
    return refinedEvents;
  }

  /**
   * Get algorithm configuration
   */
  public getConfig(): BasicFusionConfig {
    return { ...this.config };
  }

  /**
   * Update algorithm parameters
   */
  public updateConfig(newConfig: Partial<BasicFusionConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
      parameters: {
        ...this.config.parameters,
        ...newConfig.parameters
      }
    };
  }

  /**
   * Analyze fusion performance and identify rule-based limitations
   */
  public analyzeFusionLimitations(
    data: DemoData, 
    detectedEvents: DetectedEvent[]
  ): {
    sensor_agreement_rate: number;
    rigid_rule_failures: number;
    asymmetry_handling: 'basic' | 'none';
    improvement_opportunities: string[];
  } {
    
    const forceOnlyEvents = detectedEvents.filter(e => 
      !e.algorithm_parameters?.emg_confirmation
    );
    const fusedEvents = detectedEvents.filter(e => 
      e.algorithm_parameters?.emg_confirmation
    );
    
    const sensorAgreementRate = fusedEvents.length / (fusedEvents.length + forceOnlyEvents.length);
    
    // Count events that would be improved by adaptive (non-rigid) rules
    const groundTruthEvents = data.ground_truth_events;
    const missedDueToRigidRules = groundTruthEvents.length - detectedEvents.length;
    
    const improvements: string[] = [];
    
    if (sensorAgreementRate < 0.6) {
      improvements.push('EMG-force timing relationship needs adaptive modeling');
    }
    
    if (missedDueToRigidRules > 3) {
      improvements.push('Rigid alternating pattern rule fails with constrained gait');
    }
    
    improvements.push('Constraint-specific adaptation required for optimal performance');
    improvements.push('Machine learning could adapt to individual gait patterns');
    
    return {
      sensor_agreement_rate: sensorAgreementRate,
      rigid_rule_failures: Math.max(0, missedDueToRigidRules),
      asymmetry_handling: this.config.parameters.asymmetry_compensation ? 'basic' : 'none',
      improvement_opportunities: improvements
    };
  }
}

/**
 * Create basic fusion detection algorithm with default configuration
 */
export function createBasicFusionDetection(
  config?: Partial<BasicFusionConfig>
): BasicFusionDetection {
  return new BasicFusionDetection(config);
}