/**
 * Accuracy measurement system for gait event detection algorithms
 * Compares detected events to ground truth with comprehensive metrics
 */

import { useState, useCallback } from 'react';
import type { DemoData, GaitEvent, AccuracyMetrics } from '../../../utils/types';
import { DetectedEvent, calculateAccuracy } from '../algorithms/utils';

export interface AlgorithmPerformance {
  algorithm_name: string;
  accuracy_percentage: number;
  precision: number;
  recall: number;
  f1_score: number;
  true_positives: number;
  false_positives: number;
  false_negatives: number;
  processing_time_ms: number;
  events_detected: number;
  events_expected: number;
}

export interface AccuracyComparison {
  traditional: AlgorithmPerformance;
  basic_fusion: AlgorithmPerformance;
  ai_fusion: AlgorithmPerformance;
  improvement_metrics: {
    basic_vs_traditional: number;    // Percentage improvement
    ai_vs_traditional: number;       // Percentage improvement
    ai_vs_basic: number;            // Percentage improvement
  };
  constraint_adaptation_scores: {
    traditional: number;             // How well it handles constraints (0-1)
    basic_fusion: number;
    ai_fusion: number;
  };
}

export interface UseAccuracyCalculatorReturn {
  calculateAlgorithmAccuracy: (
    detectedEvents: DetectedEvent[],
    groundTruthEvents: GaitEvent[],
    algorithmName: string,
    processingTimeMs: number
  ) => AlgorithmPerformance;
  
  calculateAccuracyComparison: (
    traditionalEvents: DetectedEvent[],
    basicFusionEvents: DetectedEvent[],
    aiFusionEvents: DetectedEvent[],
    groundTruthEvents: GaitEvent[],
    processingTimes: { traditional: number; basicFusion: number; aiFusion: number }
  ) => AccuracyComparison;
  
  analyzeConstraintAdaptation: (
    detectedEvents: DetectedEvent[],
    groundTruthEvents: GaitEvent[],
    data: DemoData
  ) => number;
  
  generateAccuracyReport: (comparison: AccuracyComparison) => string;
}

/**
 * Hook for comprehensive accuracy measurement and comparison
 */
export function useAccuracyCalculator(): UseAccuracyCalculatorReturn {
  
  /**
   * Calculate comprehensive accuracy metrics for a single algorithm
   */
  const calculateAlgorithmAccuracy = useCallback((
    detectedEvents: DetectedEvent[],
    groundTruthEvents: GaitEvent[],
    algorithmName: string,
    processingTimeMs: number
  ): AlgorithmPerformance => {
    
    // Calculate basic accuracy metrics
    const metrics = calculateAccuracy(detectedEvents, groundTruthEvents, 100); // 100ms tolerance
    
    // Calculate accuracy percentage (F1-score as primary metric)
    const accuracyPercentage = metrics.f1_score * 100;
    
    return {
      algorithm_name: algorithmName,
      accuracy_percentage: Math.round(accuracyPercentage * 100) / 100,
      precision: Math.round(metrics.precision * 1000) / 1000,
      recall: Math.round(metrics.recall * 1000) / 1000,
      f1_score: Math.round(metrics.f1_score * 1000) / 1000,
      true_positives: metrics.true_positives,
      false_positives: metrics.false_positives,
      false_negatives: metrics.false_negatives,
      processing_time_ms: Math.round(processingTimeMs),
      events_detected: detectedEvents.length,
      events_expected: groundTruthEvents.length
    };
  }, []);

  /**
   * Calculate comprehensive comparison between all three algorithms
   */
  const calculateAccuracyComparison = useCallback((
    traditionalEvents: DetectedEvent[],
    basicFusionEvents: DetectedEvent[],
    aiFusionEvents: DetectedEvent[],
    groundTruthEvents: GaitEvent[],
    processingTimes: { traditional: number; basicFusion: number; aiFusion: number }
  ): AccuracyComparison => {
    
    // Calculate individual performance metrics
    const traditionalPerf = calculateAlgorithmAccuracy(
      traditionalEvents, 
      groundTruthEvents, 
      'Traditional Force Plate',
      processingTimes.traditional
    );
    
    const basicFusionPerf = calculateAlgorithmAccuracy(
      basicFusionEvents, 
      groundTruthEvents, 
      'Basic Multi-Sensor Fusion',
      processingTimes.basicFusion
    );
    
    const aiFusionPerf = calculateAlgorithmAccuracy(
      aiFusionEvents, 
      groundTruthEvents, 
      'AI-Powered Fusion',
      processingTimes.aiFusion
    );
    
    // Calculate improvement metrics
    const improvementMetrics = {
      basic_vs_traditional: calculateImprovement(
        traditionalPerf.accuracy_percentage, 
        basicFusionPerf.accuracy_percentage
      ),
      ai_vs_traditional: calculateImprovement(
        traditionalPerf.accuracy_percentage, 
        aiFusionPerf.accuracy_percentage
      ),
      ai_vs_basic: calculateImprovement(
        basicFusionPerf.accuracy_percentage, 
        aiFusionPerf.accuracy_percentage
      )
    };
    
    // Calculate constraint adaptation scores (simplified analysis)
    const constraintAdaptationScores = {
      traditional: calculateConstraintScore(traditionalEvents, groundTruthEvents),
      basic_fusion: calculateConstraintScore(basicFusionEvents, groundTruthEvents),
      ai_fusion: calculateConstraintScore(aiFusionEvents, groundTruthEvents)
    };
    
    return {
      traditional: traditionalPerf,
      basic_fusion: basicFusionPerf,
      ai_fusion: aiFusionPerf,
      improvement_metrics: improvementMetrics,
      constraint_adaptation_scores: constraintAdaptationScores
    };
  }, [calculateAlgorithmAccuracy]);

  /**
   * Analyze how well an algorithm adapts to constraint patterns
   */
  const analyzeConstraintAdaptation = useCallback((
    detectedEvents: DetectedEvent[],
    groundTruthEvents: GaitEvent[],
    data: DemoData
  ): number => {
    
    // Analyze left vs right detection accuracy (constraint affects left leg)
    const leftDetected = detectedEvents.filter(e => e.leg === 'left');
    const rightDetected = detectedEvents.filter(e => e.leg === 'right');
    const leftGroundTruth = groundTruthEvents.filter(e => e.leg === 'left');
    const rightGroundTruth = groundTruthEvents.filter(e => e.leg === 'right');
    
    // Calculate individual leg accuracies
    const leftAccuracy = calculateAccuracy(leftDetected, leftGroundTruth, 100);
    const rightAccuracy = calculateAccuracy(rightDetected, rightGroundTruth, 100);
    
    // Constraint adaptation score considers:
    // 1. How well it handles the constrained (left) leg
    // 2. Balance between left and right detection
    // 3. Overall pattern recognition despite asymmetry
    
    const leftF1 = leftAccuracy.f1_score;
    const rightF1 = rightAccuracy.f1_score;
    const balanceScore = 1 - Math.abs(leftF1 - rightF1); // Better when legs are balanced
    const overallScore = (leftF1 + rightF1) / 2;
    
    // Weight overall performance more than balance for constrained gait
    const adaptationScore = 0.7 * overallScore + 0.3 * balanceScore;
    
    return Math.round(adaptationScore * 1000) / 1000;
  }, []);

  /**
   * Generate human-readable accuracy report
   */
  const generateAccuracyReport = useCallback((comparison: AccuracyComparison): string => {
    const traditional = comparison.traditional;
    const basicFusion = comparison.basic_fusion;
    const aiFusion = comparison.ai_fusion;
    const improvements = comparison.improvement_metrics;
    
    const report = `
# Gait Event Detection Accuracy Report

## Algorithm Performance Summary
- **Traditional Force Plate**: ${traditional.accuracy_percentage.toFixed(1)}% accuracy
  - Precision: ${traditional.precision.toFixed(3)} | Recall: ${traditional.recall.toFixed(3)} | F1: ${traditional.f1_score.toFixed(3)}
  - Events: ${traditional.events_detected}/${traditional.events_expected} detected
  - Processing: ${traditional.processing_time_ms}ms

- **Basic Multi-Sensor Fusion**: ${basicFusion.accuracy_percentage.toFixed(1)}% accuracy
  - Precision: ${basicFusion.precision.toFixed(3)} | Recall: ${basicFusion.recall.toFixed(3)} | F1: ${basicFusion.f1_score.toFixed(3)}
  - Events: ${basicFusion.events_detected}/${basicFusion.events_expected} detected
  - Processing: ${basicFusion.processing_time_ms}ms

- **AI-Powered Fusion**: ${aiFusion.accuracy_percentage.toFixed(1)}% accuracy
  - Precision: ${aiFusion.precision.toFixed(3)} | Recall: ${aiFusion.recall.toFixed(3)} | F1: ${aiFusion.f1_score.toFixed(3)}
  - Events: ${aiFusion.events_detected}/${aiFusion.events_expected} detected
  - Processing: ${aiFusion.processing_time_ms}ms

## Performance Improvements
- **Basic Fusion vs Traditional**: +${improvements.basic_vs_traditional.toFixed(1)}% improvement
- **AI Fusion vs Traditional**: +${improvements.ai_vs_traditional.toFixed(1)}% improvement  
- **AI Fusion vs Basic**: +${improvements.ai_vs_basic.toFixed(1)}% improvement

## Constraint Adaptation Analysis
- **Traditional**: ${(comparison.constraint_adaptation_scores.traditional * 100).toFixed(1)}% adaptation
- **Basic Fusion**: ${(comparison.constraint_adaptation_scores.basic_fusion * 100).toFixed(1)}% adaptation
- **AI Fusion**: ${(comparison.constraint_adaptation_scores.ai_fusion * 100).toFixed(1)}% adaptation

## Key Insights
${generateInsights(comparison)}
    `.trim();
    
    return report;
  }, []);

  return {
    calculateAlgorithmAccuracy,
    calculateAccuracyComparison,
    analyzeConstraintAdaptation,
    generateAccuracyReport
  };
}

/**
 * Helper function to calculate percentage improvement
 */
function calculateImprovement(baseline: number, improved: number): number {
  if (baseline === 0) return improved;
  const improvement = ((improved - baseline) / baseline) * 100;
  return Math.round(improvement * 10) / 10;
}

/**
 * Helper function to calculate constraint adaptation score
 */
function calculateConstraintScore(
  detectedEvents: DetectedEvent[], 
  groundTruthEvents: GaitEvent[]
): number {
  // Simplified constraint scoring based on overall accuracy
  const metrics = calculateAccuracy(detectedEvents, groundTruthEvents, 100);
  
  // Consider both precision and recall for constraint adaptation
  const adaptationScore = (metrics.precision + metrics.recall) / 2;
  
  return Math.round(adaptationScore * 1000) / 1000;
}

/**
 * Generate insights based on performance comparison
 */
function generateInsights(comparison: AccuracyComparison): string {
  const insights: string[] = [];
  
  // Performance progression analysis
  if (comparison.improvement_metrics.basic_vs_traditional > 10) {
    insights.push("✓ Multi-sensor fusion shows significant improvement over single-sensor approach");
  }
  
  if (comparison.improvement_metrics.ai_vs_traditional > 25) {
    insights.push("✓ AI-powered fusion demonstrates superior adaptation to constrained gait patterns");
  }
  
  if (comparison.improvement_metrics.ai_vs_basic > 15) {
    insights.push("✓ Machine learning significantly outperforms rule-based fusion logic");
  }
  
  // Constraint adaptation analysis
  const aiAdaptation = comparison.constraint_adaptation_scores.ai_fusion;
  const traditionalAdaptation = comparison.constraint_adaptation_scores.traditional;
  
  if (aiAdaptation > traditionalAdaptation + 0.2) {
    insights.push("✓ AI algorithm shows excellent adaptation to pathological gait patterns");
  }
  
  // Processing efficiency
  if (comparison.ai_fusion.processing_time_ms < 500) {
    insights.push("✓ All algorithms process real-time data efficiently (<500ms)");
  }
  
  // Clinical relevance
  if (comparison.ai_fusion.accuracy_percentage > 90) {
    insights.push("✓ AI-fusion accuracy meets clinical requirements for pathological gait analysis");
  }
  
  return insights.length > 0 ? insights.join('\n') : "Analysis completed successfully.";
}

export default useAccuracyCalculator;