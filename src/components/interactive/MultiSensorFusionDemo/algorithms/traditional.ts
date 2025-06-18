/**
 * Stage 1: Traditional Force Plate Detection
 * Single-sensor approach using vertical ground reaction force thresholding
 * Focused on pure detection without ground truth comparison
 */

import type { DemoData } from '../../../utils/types';
import type { 
  DetectedEvent, 
  AlgorithmConfig
} from './utils';
import { 
  movingAverage, 
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
   * Get simple detection statistics for display
   */
  public getDetectionStats(detectedEvents: DetectedEvent[]): {
    total_events: number;
    heel_strikes_left: number;
    heel_strikes_right: number;
    toe_offs_left: number;
    toe_offs_right: number;
    average_confidence: number;
  } {
    const heelStrikesLeft = detectedEvents.filter(e => e.type === 'heel_strike' && e.leg === 'left').length;
    const heelStrikesRight = detectedEvents.filter(e => e.type === 'heel_strike' && e.leg === 'right').length;
    const toeOffsLeft = detectedEvents.filter(e => e.type === 'toe_off' && e.leg === 'left').length;
    const toeOffsRight = detectedEvents.filter(e => e.type === 'toe_off' && e.leg === 'right').length;
    
    const averageConfidence = detectedEvents.length > 0 
      ? detectedEvents.reduce((sum, event) => sum + event.confidence, 0) / detectedEvents.length 
      : 0;
    
    return {
      total_events: detectedEvents.length,
      heel_strikes_left: heelStrikesLeft,
      heel_strikes_right: heelStrikesRight,
      toe_offs_left: toeOffsLeft,
      toe_offs_right: toeOffsRight,
      average_confidence: averageConfidence
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