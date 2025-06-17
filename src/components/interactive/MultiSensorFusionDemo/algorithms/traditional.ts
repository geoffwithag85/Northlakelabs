/**
 * Stage 1: Traditional Force Plate Detection
 * Single-sensor approach using vertical ground reaction force thresholding
 * Designed to demonstrate limitations with constrained gait patterns
 * Target accuracy: ~60% (deliberately shows failure modes)
 */

import type { DemoData } from '../../../utils/types';
import { 
  DetectedEvent, 
  AlgorithmConfig, 
  movingAverage, 
  findPeaks, 
  findValleys, 
  calculateConfidence,
  validateEvents,
  sortAndCleanEvents
} from './utils';

export interface TraditionalAlgorithmConfig extends AlgorithmConfig {
  parameters: {
    heel_strike_threshold: number;    // Force threshold for heel strike (N)
    toe_off_threshold: number;        // Force threshold for toe off (N)
    min_stance_time: number;          // Minimum stance phase duration (s)
    min_swing_time: number;           // Minimum swing phase duration (s)
    smoothing_window: number;         // Moving average window size (samples)
    peak_min_distance: number;        // Minimum distance between peaks (samples)
  };
}

/**
 * Traditional force plate detection algorithm
 * Uses simple thresholding on vertical ground reaction forces
 * Fails with constrained gait due to asymmetric loading patterns
 */
export class TraditionalDetection {
  private config: TraditionalAlgorithmConfig;

  constructor(config?: Partial<TraditionalAlgorithmConfig>) {
    this.config = {
      name: 'Traditional Force Plate',
      version: '1.0.0',
      parameters: {
        heel_strike_threshold: 50,      // Newtons - too high for constrained gait
        toe_off_threshold: 20,          // Newtons - may miss reduced loading
        min_stance_time: 0.3,           // 300ms minimum stance
        min_swing_time: 0.2,            // 200ms minimum swing
        smoothing_window: 10,           // 10ms smoothing at 1000Hz
        peak_min_distance: 100,         // 100ms between peaks
        ...config?.parameters
      },
      ...config
    };
  }

  /**
   * Detect gait events using traditional force plate thresholding
   * Processes both left and right force plates independently
   */
  public detectEvents(data: DemoData): DetectedEvent[] {
    const events: DetectedEvent[] = [];
    
    // Process left force plate
    const leftEvents = this.processForceData(
      data.force_plates.left_force_plate.fz,
      data.timestamps,
      'left'
    );
    events.push(...leftEvents);
    
    // Process right force plate  
    const rightEvents = this.processForceData(
      data.force_plates.right_force_plate.fz,
      data.timestamps,
      'right'
    );
    events.push(...rightEvents);
    
    // Validate and clean events
    const validEvents = validateEvents(events);
    const cleanedEvents = sortAndCleanEvents(validEvents);
    
    return cleanedEvents;
  }

  /**
   * Process force data for a single foot
   * Implements traditional threshold-based detection
   */
  private processForceData(
    forceData: number[], 
    timestamps: number[], 
    leg: 'left' | 'right'
  ): DetectedEvent[] {
    const events: DetectedEvent[] = [];
    const { parameters } = this.config;
    
    // Apply smoothing to reduce noise (but may miss rapid transitions)
    const smoothedForce = movingAverage(forceData, parameters.smoothing_window);
    
    // State tracking for stance/swing phases
    let inStance = false;
    let stanceStartTime = 0;
    let stanceStartIdx = 0;
    
    for (let i = 1; i < smoothedForce.length; i++) {
      const currentForce = smoothedForce[i];
      const previousForce = smoothedForce[i - 1];
      const currentTime = timestamps[i];
      
      // Heel strike detection: force rises above threshold
      if (!inStance && 
          currentForce > parameters.heel_strike_threshold && 
          previousForce <= parameters.heel_strike_threshold) {
        
        // Calculate confidence based on force magnitude
        const confidence = calculateConfidence(
          currentForce, 
          parameters.heel_strike_threshold,
          1000 // Max expected force
        );
        
        events.push({
          time: currentTime,
          type: 'heel_strike',
          leg,
          confidence,
          detection_method: 'traditional_threshold',
          algorithm_parameters: {
            force_value: currentForce,
            threshold: parameters.heel_strike_threshold
          }
        });
        
        inStance = true;
        stanceStartTime = currentTime;
        stanceStartIdx = i;
      }
      
      // Toe off detection: force drops below threshold
      else if (inStance && 
               currentForce < parameters.toe_off_threshold && 
               previousForce >= parameters.toe_off_threshold) {
        
        // Check minimum stance time (basic validation)
        const stanceDuration = currentTime - stanceStartTime;
        if (stanceDuration >= parameters.min_stance_time) {
          
          const confidence = calculateConfidence(
            Math.abs(currentForce - parameters.toe_off_threshold),
            0,
            parameters.toe_off_threshold
          );
          
          events.push({
            time: currentTime,
            type: 'toe_off',
            leg,
            confidence,
            detection_method: 'traditional_threshold',
            algorithm_parameters: {
              force_value: currentForce,
              threshold: parameters.toe_off_threshold,
              stance_duration: stanceDuration
            }
          });
          
          inStance = false;
        }
      }
    }
    
    return events;
  }

  /**
   * Get algorithm configuration
   */
  public getConfig(): TraditionalAlgorithmConfig {
    return { ...this.config };
  }

  /**
   * Update algorithm parameters
   */
  public updateConfig(newConfig: Partial<TraditionalAlgorithmConfig>): void {
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
   * Generate algorithm failure analysis for constrained gait
   * This method helps explain why traditional detection fails
   */
  public analyzeFailures(data: DemoData, detectedEvents: DetectedEvent[]): {
    asymmetry_detected: boolean;
    missed_events_left: number;
    missed_events_right: number;
    failure_reasons: string[];
  } {
    const leftForce = data.force_plates.left_force_plate.fz;
    const rightForce = data.force_plates.right_force_plate.fz;
    
    // Calculate force asymmetry (indicator of constraint)
    const leftMax = Math.max(...leftForce.map(f => Math.abs(f)));
    const rightMax = Math.max(...rightForce.map(f => Math.abs(f)));
    const asymmetryRatio = leftMax / rightMax;
    
    // Count expected vs detected events by leg
    const leftDetected = detectedEvents.filter(e => e.leg === 'left').length;
    const rightDetected = detectedEvents.filter(e => e.leg === 'right').length;
    const groundTruthLeft = data.ground_truth_events.filter(e => e.leg === 'left').length;
    const groundTruthRight = data.ground_truth_events.filter(e => e.leg === 'right').length;
    
    const failure_reasons: string[] = [];
    
    // Analyze failure patterns
    if (asymmetryRatio < 0.5) {
      failure_reasons.push('Severe force asymmetry detected - left leg shows reduced loading');
    }
    
    if (leftDetected < groundTruthLeft * 0.7) {
      failure_reasons.push('Missed heel strikes on constrained left leg due to reduced force');
    }
    
    if (rightDetected > groundTruthRight * 1.3) {
      failure_reasons.push('False positives on right leg due to compensatory loading');
    }
    
    const lowForceCount = leftForce.filter(f => f < this.config.parameters.heel_strike_threshold).length;
    const lowForcePercentage = lowForceCount / leftForce.length;
    
    if (lowForcePercentage > 0.8) {
      failure_reasons.push('Left leg force consistently below threshold due to constraint');
    }
    
    return {
      asymmetry_detected: asymmetryRatio < 0.7,
      missed_events_left: Math.max(0, groundTruthLeft - leftDetected),
      missed_events_right: Math.max(0, groundTruthRight - rightDetected),
      failure_reasons
    };
  }
}

/**
 * Create traditional detection algorithm with default configuration
 */
export function createTraditionalDetection(
  config?: Partial<TraditionalAlgorithmConfig>
): TraditionalDetection {
  return new TraditionalDetection(config);
}