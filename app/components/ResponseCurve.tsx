'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LogarithmicScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LogarithmicScale,
  Title,
  Tooltip,
  Legend
);

interface ResponseCurveProps {
  data?: Array<{ x: number; y: number }>;
  datasets?: Array<{
    label: string;
    data: Array<{ x: number; y: number }>;
    borderColor?: string;
  }>;
}

const colors = [
  'rgb(75, 192, 192)',    // Teal
  'rgb(255, 99, 132)',    // Red
  'rgb(54, 162, 235)',    // Blue
  'rgb(255, 206, 86)',    // Yellow
  'rgb(153, 102, 255)',   // Purple
  'rgb(255, 159, 64)',    // Orange
];

export function ResponseCurve({ data, datasets: providedDatasets }: ResponseCurveProps) {
  let datasets = [
    {
      label: 'Response',
      data: data || [],
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
      pointRadius: 1,
    },
  ];

  if (providedDatasets && providedDatasets.length > 0) {
    datasets = providedDatasets.map((ds, i) => ({
      label: ds.label,
      data: ds.data,
      borderColor: ds.borderColor || colors[i % colors.length],
      tension: 0.1,
      pointRadius: 1,
    }));
  }

  const chartData = {
    datasets,
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        type: 'logarithmic' as const,
        position: 'bottom' as const,
        title: {
          display: true,
          text: 'Frequency (Hz)',
        },
        min: 10,
        max: 500,
        grid: {
          display: true,
          drawBorder: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'SPL (dB)',
        },
        min: 60,
        grid: {
          display: true,
          drawBorder: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  return (
    <div className="w-full h-full">
      <Line options={options} data={chartData} />
    </div>
  );
}