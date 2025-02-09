'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { UsageStats, formatCost } from '../utils/stats';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface StatsChartProps {
  stats: UsageStats;
}

export const StatsChart: React.FC<StatsChartProps> = ({ stats }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Usage Statistics',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const data = {
    labels: ['Words', 'Tokens', 'Cost'],
    datasets: [
      {
        label: 'Usage',
        data: [stats.wordCount, stats.tokenCount, stats.cost],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  if (stats.wordCount === 0 && stats.tokenCount === 0 && stats.cost === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        <p>Your activity stats will appear here.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-card rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Usage Statistics</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="p-3 bg-blue-50 rounded flex flex-col items-center justify-center">
          <p className="text-sm text-gray-600">Words</p>
          <p className="text-xl font-bold">{stats.wordCount}</p>
        </div>
        <div className="p-3 bg-green-50 rounded flex flex-col items-center justify-center">
          <p className="text-sm text-gray-600">Tokens</p>
          <p className="text-xl font-bold">{stats.tokenCount}</p>
        </div>
        <div className="p-3 bg-purple-50 rounded flex flex-col items-center justify-center">
          <p className="text-sm text-gray-600">Cost</p>
          <p className="text-xl font-bold">{formatCost(stats.cost)}</p>
        </div>
      </div>
      <div className="relative h-48">
        <Bar options={options} data={data} />
      </div>
    </div>
  );
}; 