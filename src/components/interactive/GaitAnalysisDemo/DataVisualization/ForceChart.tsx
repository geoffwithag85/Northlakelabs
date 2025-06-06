import React, { useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useGaitAnalysisStore } from '../store';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const ForceChart: React.FC = () => {
  const { dataHistory, isPlaying } = useGaitAnalysisStore();
  const chartRef = useRef<ChartJS<'line'>>(null);  // Get last 50 data points for display
  const recentData = dataHistory.slice(-50);
  
  // Debug: Log data occasionally for testing
  if (recentData.length > 0 && Math.random() < 0.05) { // Only log ~5% of the time
    const last = recentData[recentData.length - 1];
    console.log('Chart Display:', {
      leftForce: last.leftFootForce.toFixed(1),
      rightForce: last.rightFootForce.toFixed(1),
      dataPoints: recentData.length
    });
  }
  
  const chartData: ChartData<'line'> = {
    labels: recentData.map((_, index) => index.toString()),
    datasets: [
      {
        label: 'Left Foot Force (N)',
        data: recentData.map(d => d.leftFootForce),
        borderColor: 'rgb(59, 130, 246)', // blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Right Foot Force (N)',
        data: recentData.map(d => d.rightFootForce),
        borderColor: 'rgb(239, 68, 68)', // red-500
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: isPlaying ? 200 : 0,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    scales: {
      x: {
        display: false, // Hide x-axis for cleaner look
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        min: 0,
        max: 1400,
        title: {
          display: true,
          text: 'Force (N)',
          font: {
            size: 12,
          },
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
    elements: {
      point: {
        radius: 0, // Hide points for smoother look
        hoverRadius: 4,
      },
    },
  };

  return (
    <div className="h-32 w-full">
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};
