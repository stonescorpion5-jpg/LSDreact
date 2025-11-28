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
  data: Array<{ x: number; y: number }>;
}

export function ResponseCurve({ data }: ResponseCurveProps) {
  const chartData = {
    datasets: [
      {
        label: 'Response',
        data: data,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        pointRadius: 1,
      },
    ],
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
      },
      y: {
        title: {
          display: true,
          text: 'SPL (dB)',
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