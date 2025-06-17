/**
 * Algorithm execution hook for running and managing the three detection stages
 * Coordinates execution timing, state management, and results processing
 */

import { useState, useCallback, useRef } from 'react';
import type { DemoData } from '../../../utils/types';
import { DetectedEvent } from '../algorithms/utils';
import { TraditionalDetection, createTraditionalDetection } from '../algorithms/traditional';
import { BasicFusionDetection, createBasicFusionDetection } from '../algorithms/basicFusion';
import { AIFusionDetection, createAIFusionDetection } from '../algorithms/aiFusion';
import { useAccuracyCalculator, type AccuracyComparison, type AlgorithmPerformance } from './useAccuracyCalculator';

export interface AlgorithmResults {
  traditional: {
    events: DetectedEvent[];
    performance: AlgorithmPerformance | null;
    processing_time_ms: number;
    failure_analysis?: any;
  };
  basic_fusion: {
    events: DetectedEvent[];
    performance: AlgorithmPerformance | null;
    processing_time_ms: number;
    fusion_analysis?: any;
  };
  ai_fusion: {
    events: DetectedEvent[];
    performance: AlgorithmPerformance | null;
    processing_time_ms: number;
    constraint_analysis?: any;
  };
}

export interface EnabledStages {
  traditional: boolean;
  basic_fusion: boolean;
  ai_fusion: boolean;
}

export interface UseAlgorithmRunnerReturn {
  // State
  results: AlgorithmResults | null;
  accuracyComparison: AccuracyComparison | null;
  isRunning: boolean;
  enabledStages: EnabledStages;
  lastRunTimestamp: Date | null;
  
  // Actions
  runAlgorithms: (data: DemoData) => Promise<void>;
  runSingleAlgorithm: (algorithm: keyof EnabledStages, data: DemoData) => Promise<void>;
  toggleStage: (stage: keyof EnabledStages) => void;
  clearResults: () => void;
  getProcessingReport: () => string | null;
  
  // Algorithm instances (for parameter tuning)
  getAlgorithmInstances: () => {
    traditional: TraditionalDetection;
    basicFusion: BasicFusionDetection;
    aiFusion: AIFusionDetection;
  };
}

/**
 * Hook for executing and managing gait detection algorithms
 */
export function useAlgorithmRunner(): UseAlgorithmRunnerReturn {
  const [results, setResults] = useState<AlgorithmResults | null>(null);
  const [accuracyComparison, setAccuracyComparison] = useState<AccuracyComparison | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [enabledStages, setEnabledStages] = useState<EnabledStages>({
    traditional: true,
    basic_fusion: true,
    ai_fusion: true
  });
  const [lastRunTimestamp, setLastRunTimestamp] = useState<Date | null>(null);
  
  // Algorithm instances
  const algorithmsRef = useRef({
    traditional: createTraditionalDetection(),
    basicFusion: createBasicFusionDetection(),
    aiFusion: createAIFusionDetection()
  });
  
  // Accuracy calculator
  const {
    calculateAlgorithmAccuracy,
    calculateAccuracyComparison,
    analyzeConstraintAdaptation,
    generateAccuracyReport
  } = useAccuracyCalculator();

  /**
   * Run all enabled algorithms and compare results
   */
  const runAlgorithms = useCallback(async (data: DemoData) => {
    setIsRunning(true);
    
    try {
      const newResults: AlgorithmResults = {
        traditional: {
          events: [],
          performance: null,
          processing_time_ms: 0
        },
        basic_fusion: {
          events: [],
          performance: null,
          processing_time_ms: 0
        },
        ai_fusion: {
          events: [],
          performance: null,
          processing_time_ms: 0
        }
      };
      
      const processingTimes = {
        traditional: 0,
        basicFusion: 0,
        aiFusion: 0
      };

      // Run Traditional Algorithm
      if (enabledStages.traditional) {
        const startTime = performance.now();
        
        try {
          const traditionalEvents = algorithmsRef.current.traditional.detectEvents(data);
          const endTime = performance.now();
          const processingTime = endTime - startTime;
          
          newResults.traditional = {
            events: traditionalEvents,
            performance: calculateAlgorithmAccuracy(
              traditionalEvents,
              data.ground_truth_events,
              'Traditional Force Plate',
              processingTime
            ),
            processing_time_ms: processingTime,
            failure_analysis: algorithmsRef.current.traditional.analyzeFailures(
              data, 
              traditionalEvents
            )
          };
          
          processingTimes.traditional = processingTime;
        } catch (error) {
          console.error('Traditional algorithm failed:', error);
          newResults.traditional.processing_time_ms = performance.now() - startTime;
        }
      }

      // Run Basic Fusion Algorithm
      if (enabledStages.basic_fusion) {
        const startTime = performance.now();
        
        try {
          const basicFusionEvents = algorithmsRef.current.basicFusion.detectEvents(data);
          const endTime = performance.now();
          const processingTime = endTime - startTime;
          
          newResults.basic_fusion = {
            events: basicFusionEvents,
            performance: calculateAlgorithmAccuracy(
              basicFusionEvents,
              data.ground_truth_events,
              'Basic Multi-Sensor Fusion',
              processingTime
            ),
            processing_time_ms: processingTime,
            fusion_analysis: algorithmsRef.current.basicFusion.analyzeFusionLimitations(
              data,
              basicFusionEvents
            )
          };
          
          processingTimes.basicFusion = processingTime;
        } catch (error) {
          console.error('Basic fusion algorithm failed:', error);
          newResults.basic_fusion.processing_time_ms = performance.now() - startTime;
        }
      }

      // Run AI Fusion Algorithm
      if (enabledStages.ai_fusion) {
        const startTime = performance.now();
        
        try {
          const aiFusionEvents = algorithmsRef.current.aiFusion.detectEvents(data);
          const endTime = performance.now();
          const processingTime = endTime - startTime;
          
          newResults.ai_fusion = {
            events: aiFusionEvents,
            performance: calculateAlgorithmAccuracy(
              aiFusionEvents,
              data.ground_truth_events,
              'AI-Powered Fusion',
              processingTime
            ),
            processing_time_ms: processingTime,
            constraint_analysis: analyzeConstraintAdaptation(
              aiFusionEvents,
              data.ground_truth_events,
              data
            )
          };
          
          processingTimes.aiFusion = processingTime;
        } catch (error) {
          console.error('AI fusion algorithm failed:', error);
          newResults.ai_fusion.processing_time_ms = performance.now() - startTime;
        }
      }

      // Calculate comprehensive accuracy comparison
      if (enabledStages.traditional && enabledStages.basic_fusion && enabledStages.ai_fusion) {
        const comparison = calculateAccuracyComparison(
          newResults.traditional.events,
          newResults.basic_fusion.events,
          newResults.ai_fusion.events,
          data.ground_truth_events,
          processingTimes
        );
        
        setAccuracyComparison(comparison);
      }

      setResults(newResults);
      setLastRunTimestamp(new Date());

    } catch (error) {
      console.error('Algorithm execution failed:', error);
    } finally {
      setIsRunning(false);
    }
  }, [
    enabledStages, 
    calculateAlgorithmAccuracy, 
    calculateAccuracyComparison, 
    analyzeConstraintAdaptation
  ]);

  /**
   * Run a single algorithm (for individual testing)
   */
  const runSingleAlgorithm = useCallback(async (
    algorithm: keyof EnabledStages, 
    data: DemoData
  ) => {
    setIsRunning(true);
    
    try {
      const startTime = performance.now();
      let events: DetectedEvent[] = [];
      let algorithmName = '';
      
      switch (algorithm) {
        case 'traditional':
          events = algorithmsRef.current.traditional.detectEvents(data);
          algorithmName = 'Traditional Force Plate';
          break;
        case 'basic_fusion':
          events = algorithmsRef.current.basicFusion.detectEvents(data);
          algorithmName = 'Basic Multi-Sensor Fusion';
          break;
        case 'ai_fusion':
          events = algorithmsRef.current.aiFusion.detectEvents(data);
          algorithmName = 'AI-Powered Fusion';
          break;
      }
      
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      
      const performance_metrics = calculateAlgorithmAccuracy(
        events,
        data.ground_truth_events,
        algorithmName,
        processingTime
      );
      
      // Update only the specific algorithm results
      setResults(prevResults => {
        const newResults = prevResults ? { ...prevResults } : {
          traditional: { events: [], performance: null, processing_time_ms: 0 },
          basic_fusion: { events: [], performance: null, processing_time_ms: 0 },
          ai_fusion: { events: [], performance: null, processing_time_ms: 0 }
        };
        
        const algorithmKey = algorithm === 'traditional' ? 'traditional' :
                            algorithm === 'basic_fusion' ? 'basic_fusion' : 'ai_fusion';
        
        newResults[algorithmKey] = {
          events,
          performance: performance_metrics,
          processing_time_ms: processingTime
        };
        
        return newResults;
      });
      
      setLastRunTimestamp(new Date());
      
    } catch (error) {
      console.error(`Single algorithm execution failed (${algorithm}):`, error);
    } finally {
      setIsRunning(false);
    }
  }, [calculateAlgorithmAccuracy]);

  /**
   * Toggle algorithm stage on/off
   */
  const toggleStage = useCallback((stage: keyof EnabledStages) => {
    setEnabledStages(prev => ({
      ...prev,
      [stage]: !prev[stage]
    }));
  }, []);

  /**
   * Clear all results and reset state
   */
  const clearResults = useCallback(() => {
    setResults(null);
    setAccuracyComparison(null);
    setLastRunTimestamp(null);
  }, []);

  /**
   * Generate comprehensive processing report
   */
  const getProcessingReport = useCallback((): string | null => {
    if (!results || !accuracyComparison) return null;
    
    const report = generateAccuracyReport(accuracyComparison);
    
    const additionalInfo = `

## Processing Details
- **Execution Time**: ${lastRunTimestamp?.toLocaleTimeString() || 'Unknown'}
- **Enabled Stages**: ${Object.entries(enabledStages)
      .filter(([_, enabled]) => enabled)
      .map(([stage, _]) => stage)
      .join(', ')}

## Failure Analysis
${results.traditional.failure_analysis ? `
### Traditional Algorithm Failures:
- Asymmetry Detected: ${results.traditional.failure_analysis.asymmetry_detected ? 'Yes' : 'No'}
- Missed Left Events: ${results.traditional.failure_analysis.missed_events_left}
- Missed Right Events: ${results.traditional.failure_analysis.missed_events_right}
- Failure Reasons: ${results.traditional.failure_analysis.failure_reasons.join('; ')}
` : ''}

${results.basic_fusion.fusion_analysis ? `
### Basic Fusion Limitations:
- Sensor Agreement Rate: ${(results.basic_fusion.fusion_analysis.sensor_agreement_rate * 100).toFixed(1)}%
- Rigid Rule Failures: ${results.basic_fusion.fusion_analysis.rigid_rule_failures}
- Asymmetry Handling: ${results.basic_fusion.fusion_analysis.asymmetry_handling}
` : ''}

${results.ai_fusion.constraint_analysis ? `
### AI Constraint Adaptation:
- Adaptation Score: ${(results.ai_fusion.constraint_analysis * 100).toFixed(1)}%
` : ''}
    `;
    
    return report + additionalInfo;
  }, [results, accuracyComparison, lastRunTimestamp, enabledStages, generateAccuracyReport]);

  /**
   * Get algorithm instances for parameter tuning
   */
  const getAlgorithmInstances = useCallback(() => {
    return algorithmsRef.current;
  }, []);

  return {
    // State
    results,
    accuracyComparison,
    isRunning,
    enabledStages,
    lastRunTimestamp,
    
    // Actions
    runAlgorithms,
    runSingleAlgorithm,
    toggleStage,
    clearResults,
    getProcessingReport,
    getAlgorithmInstances
  };
}

export default useAlgorithmRunner;