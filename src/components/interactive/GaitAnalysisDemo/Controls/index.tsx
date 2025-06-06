import React from 'react';
import { useGaitAnalysisStore } from '../store';

export const Controls: React.FC = () => {
  const { 
    isPlaying, 
    parameters, 
    startAnimation,
    stopAnimation,
    updateParameters, 
    resetToBaseline,
    loadScenario
  } = useGaitAnalysisStore();
  const handlePlayPause = () => {
    if (isPlaying) {
      stopAnimation();
    } else {
      startAnimation();
    }
  };

  const handleSpeedChange = (value: number) => {
    updateParameters({ walkingSpeed: value / 100 });
  };

  const scenarios = [
    { id: 'NORMAL_BASELINE', name: 'Normal Baseline' },
    { id: 'MILD_LIMP', name: 'Mild Limp' },
    { id: 'FAST_WALK', name: 'Fast Walk' },
    { id: 'RECOVERY_ANALYSIS', name: 'Recovery Analysis' },
  ];

  const handleScenarioChange = (scenarioId: string) => {
    loadScenario(scenarioId as keyof typeof import('../types').SCENARIO_PRESETS);
  };

  return (
    <div className="space-y-4">
      {/* Play/Pause Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Demo Controls
        </h3>
        <button
          onClick={handlePlayPause}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isPlaying
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
      </div>

      {/* Speed Control */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Walking Speed: {Math.round(parameters.walkingSpeed * 100)}%
        </label>
        <input
          type="range"
          min="50"
          max="150"
          value={parameters.walkingSpeed * 100}
          onChange={(e) => handleSpeedChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
      </div>

      {/* Scenario Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Scenario
        </label>
        <select
          onChange={(e) => handleScenarioChange(e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
        >
          {scenarios.map((scenario) => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.name}
            </option>
          ))}
        </select>
      </div>

      {/* Reset Button */}      <button
        onClick={resetToBaseline}
        className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
      >
        🔄 Reset Demo
      </button>

      {/* Status Indicators */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Status:</span>
          <span className={`font-medium ${isPlaying ? 'text-green-600' : 'text-gray-500'}`}>
            {isPlaying ? 'Running' : 'Paused'}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Sensors:</span>
          <span className="text-green-600 font-medium">Active</span>
        </div>
      </div>
    </div>
  );
};
