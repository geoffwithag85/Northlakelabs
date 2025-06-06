import React, { useRef } from 'react';
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

export const JointAngleChart: React.FC = () => {
  const { dataHistory, isPlaying } = useGaitAnalysisStore();
  const chartRef = useRef<ChartJS<'line'>>(null);

  // Get last 50 data points for display
  const recentData = dataHistory.slice(-50);
  
  const chartData: ChartData<'line'> = {
    labels: recentData.map((_, index) => index.toString()),
    datasets: [
      {
        label: 'Left Knee Angle (°)',
        data: recentData.map(d => d.leftKneeAngle),
        borderColor: 'rgb(34, 197, 94)', // green-500
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Right Knee Angle (°)',
        data: recentData.map(d => d.rightKneeAngle),
        borderColor: 'rgb(168, 85, 247)', // purple-500
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Left Hip Angle (°)',
        data: recentData.map(d => d.leftHipAngle),
        borderColor: 'rgb(245, 158, 11)', // amber-500
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 1,
        fill: false,
        tension: 0.4,
        borderDash: [5, 5],
      },
      {
        label: 'Right Hip Angle (°)',
        data: recentData.map(d => d.rightHipAngle),
        borderColor: 'rgb(236, 72, 153)', // pink-500
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        borderWidth: 1,
        fill: false,
        tension: 0.4,
        borderDash: [5, 5],
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
            size: 10,
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
        min: -30,
        max: 70,
        title: {
          display: true,
          text: 'Angle (°)',
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
        hoverRadius: 3,
      },
    },
  };

  return (
    <div className="h-32 w-full">
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};
