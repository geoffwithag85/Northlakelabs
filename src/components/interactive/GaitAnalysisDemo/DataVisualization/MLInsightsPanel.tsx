import React from 'react';
import { useGaitAnalysisStore } from '../store';

export const MLInsightsPanel: React.FC = () => {
  const { mlAnalysis, isProcessing, processingProgress } = useGaitAnalysisStore();

  const getSymmetryColor = (index: number) => {
    if (index >= 90) return 'text-green-600 dark:text-green-400';
    if (index >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 dark:text-green-400';
    if (score >= 0.5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="space-y-3">
      {/* Processing indicator */}
      {isProcessing && (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full w-4 h-4 border-2 border-blue-500 border-t-transparent"></div>
          <span className="text-sm text-blue-600 dark:text-blue-400">
            Processing... {processingProgress}%
          </span>
        </div>
      )}

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">Symmetry Index</div>
          <div className={`text-xl font-bold ${getSymmetryColor(mlAnalysis.symmetryIndex)}`}>
            {mlAnalysis.symmetryIndex.toFixed(1)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">Confidence</div>
          <div className={`text-xl font-bold ${getConfidenceColor(mlAnalysis.confidenceScore)}`}>
            {(mlAnalysis.confidenceScore * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Status indicators */}
      <div className="flex justify-center space-x-4 text-sm">
        <div className="flex items-center space-x-1">
          <div 
            className={`w-2 h-2 rounded-full ${
              mlAnalysis.patternRecognized ? 'bg-green-500' : 'bg-gray-400'
            }`}
          ></div>
          <span className="text-gray-600 dark:text-gray-400">Pattern</span>
        </div>
        <div className="flex items-center space-x-1">
          <div 
            className={`w-2 h-2 rounded-full ${
              mlAnalysis.asymmetryDetected ? 'bg-red-500' : 'bg-green-500'
            }`}
          ></div>
          <span className="text-gray-600 dark:text-gray-400">Asymmetry</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="text-gray-600 dark:text-gray-400 capitalize">
            {mlAnalysis.gaitPhase}
          </span>
        </div>
      </div>

      {/* AI Insights */}
      <div className="space-y-2">
        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          AI Insights
        </h5>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 space-y-1">
          {mlAnalysis.insights.slice(0, 2).map((insight, index) => (
            <div key={index} className="text-xs text-blue-800 dark:text-blue-200">
              • {insight}
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {mlAnalysis.recommendations.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Recommendations
          </h5>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2 space-y-1">
            {mlAnalysis.recommendations.slice(0, 2).map((rec, index) => (
              <div key={index} className="text-xs text-amber-800 dark:text-amber-200">
                • {rec}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
