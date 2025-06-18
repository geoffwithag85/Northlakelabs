/**
 * Real-time force plate chart with Chart.js
 * Shows left/right force data with detected event markers
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { ForceData } from '../hooks/useDataLoader';
import type { DetectedEvent } from '../algorithms/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ForceChartProps {
  forceData: ForceData;
  detectedEvents: DetectedEvent[];
  currentTime: number;
  className?: string;
}

export function ForceChart({ forceData, detectedEvents, currentTime, className = '' }: ForceChartProps) {
  const chartRef = useRef<ChartJS<'line'>>(null);
  const [visibleWindow, setVisibleWindow] = useState({ start: 0, end: 4 }); // 4-second window

  // Update visible window based on current time
  useEffect(() => {
    const windowSize = 4; // seconds
    const start = Math.max(0, currentTime - windowSize / 2);
    const end = Math.min(forceData.duration, start + windowSize);
    setVisibleWindow({ start, end });
  }, [currentTime, forceData.duration]);

  // Get data indices for current window
  const getWindowIndices = () => {
    const startIndex = Math.floor(visibleWindow.start * forceData.sampleRate);
    const endIndex = Math.ceil(visibleWindow.end * forceData.sampleRate);
    return { startIndex, endIndex };
  };

  const { startIndex, endIndex } = getWindowIndices();

  // Prepare chart data
  const chartData: ChartData<'line'> = {
    labels: forceData.timestamps.slice(startIndex, endIndex),
    datasets: [
      {
        label: 'Left Force Plate',
        data: forceData.leftForce.slice(startIndex, endIndex),
        borderColor: 'rgb(59, 130, 246)', // blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        tension: 0.1
      },
      {
        label: 'Right Force Plate',
        data: forceData.rightForce.slice(startIndex, endIndex),
        borderColor: 'rgb(239, 68, 68)', // red-500
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        tension: 0.1
      }
    ]
  };

  // Chart options optimized for performance
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false, // Disable for performance
    interaction: {
      intersect: false,
      mode: 'index'
    },
    scales: {
      x: {
        type: 'linear',
        min: visibleWindow.start,
        max: visibleWindow.end,
        title: {
          display: true,
          text: 'Time (seconds)',
          color: 'rgb(156, 163, 175)' // gray-400
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          maxTicksLimit: 8
        }
      },
      y: {
        title: {
          display: true,
          text: 'Vertical Force (N)',
          color: 'rgb(156, 163, 175)'
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: 'rgb(156, 163, 175)',
          usePointStyle: true,
          pointStyle: 'line'
        }
      },
      tooltip: {
        enabled: false // Disable for performance
      }
    },
    elements: {
      point: {
        radius: 0 // Hide points for performance
      }
    }
  };

  // Add current time indicator
  const currentTimePlugin = {
    id: 'currentTime',
    afterDraw: (chart: ChartJS) => {
      if (currentTime >= visibleWindow.start && currentTime <= visibleWindow.end) {
        const ctx = chart.ctx;
        const xScale = chart.scales.x;
        const yScale = chart.scales.y;
        
        const x = xScale.getPixelForValue(currentTime);
        
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(x, yScale.top);
        ctx.lineTo(x, yScale.bottom);
        ctx.stroke();
        ctx.restore();
      }
    }
  };

  // Add event markers
  const eventMarkersPlugin = {
    id: 'eventMarkers',
    afterDraw: (chart: ChartJS) => {
      const ctx = chart.ctx;
      const xScale = chart.scales.x;
      const yScale = chart.scales.y;
      
      // Filter events in visible window
      const visibleEvents = detectedEvents.filter(
        event => event.time >= visibleWindow.start && event.time <= visibleWindow.end
      );
      
      visibleEvents.forEach(event => {
        const x = xScale.getPixelForValue(event.time);
        
        // Color based on event type
        const color = event.type === 'heel_strike' 
          ? 'rgba(34, 197, 94, 0.8)'  // green-500 for heel strikes
          : 'rgba(239, 68, 68, 0.8)'; // red-500 for toe offs
        
        // Opacity based on confidence
        const alpha = Math.max(0.3, event.confidence);
        
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(x, yScale.top);
        ctx.lineTo(x, yScale.bottom);
        ctx.stroke();
        
        // Add event label
        ctx.fillStyle = color;
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        const label = event.type === 'heel_strike' ? 'HS' : 'TO';
        const labelY = event.leg === 'left' ? yScale.top + 15 : yScale.top + 30;
        ctx.fillText(`${label}-${event.leg[0].toUpperCase()}`, x, labelY);
        
        ctx.restore();
      });
    }
  };

  // Register plugins
  useEffect(() => {
    ChartJS.register(currentTimePlugin, eventMarkersPlugin);
    
    return () => {
      ChartJS.unregister(currentTimePlugin, eventMarkersPlugin);
    };
  }, []);

  return (
    <div className={`bg-white/5 rounded-xl border border-white/10 p-4 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">
          Force Plate Data - Traditional Detection
        </h3>
        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-blue-500"></div>
            <span>Left Force Plate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-red-500"></div>
            <span>Right Force Plate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-green-500"></div>
            <span>Heel Strikes (HS)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-red-500"></div>
            <span>Toe Offs (TO)</span>
          </div>
        </div>
      </div>
      
      <div style={{ height: '400px' }}>
        <Line 
          ref={chartRef}
          data={chartData} 
          options={chartOptions}
          plugins={[currentTimePlugin, eventMarkersPlugin]}
        />
      </div>
      
      {/* Window info */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        Viewing: {visibleWindow.start.toFixed(1)}s - {visibleWindow.end.toFixed(1)}s 
        (Current: {currentTime.toFixed(3)}s)
      </div>
    </div>
  );
}