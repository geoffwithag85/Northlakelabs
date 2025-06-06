import React from 'react';
import { ForceChart } from './ForceChart.tsx';
import { JointAngleChart } from './JointAngleChart.tsx';
import { MLInsightsPanel } from './MLInsightsPanel.tsx';
import { useGaitAnalysisStore } from '../store';

export const DataVisualization: React.FC = () => {
  const { 
    mlAnalysis, 
    isPlaying, 
    currentData, 
    parameters 
  } = useGaitAnalysisStore();

  return (
    <div className="space-y-4">
      {/* Real-time force data */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Ground Reaction Forces
        </h4>
        <ForceChart />
      </div>

      {/* Joint angle data */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Joint Angles
        </h4>
        <JointAngleChart />
      </div>

      {/* ML Analysis insights */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          AI Analysis
        </h4>
        <MLInsightsPanel />
      </div>

      {/* Real-time metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <div className="text-sm text-blue-600 dark:text-blue-400">Speed</div>
          <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
            {(parameters.walkingSpeed * 100).toFixed(0)}%
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
          <div className="text-sm text-green-600 dark:text-green-400">Symmetry</div>
          <div className="text-lg font-semibold text-green-900 dark:text-green-100">
            {mlAnalysis.symmetryIndex.toFixed(1)}%
          </div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
          <div className="text-sm text-purple-600 dark:text-purple-400">Cadence</div>
          <div className="text-lg font-semibold text-purple-900 dark:text-purple-100">
            {currentData.cadence.toFixed(0)} spm
          </div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
          <div className="text-sm text-orange-600 dark:text-orange-400">Confidence</div>
          <div className="text-lg font-semibold text-orange-900 dark:text-orange-100">
            {(mlAnalysis.confidenceScore * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Status indicator */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span className="text-gray-600 dark:text-gray-300">
            {isPlaying ? 'Live Analysis Active' : 'Analysis Paused'}
          </span>
        </div>
        <div className="text-gray-500 dark:text-gray-400">
          {mlAnalysis.patternRecognized ? 'Pattern Recognized' : 'Learning...'}
        </div>
      </div>
    </div>
  );
};
