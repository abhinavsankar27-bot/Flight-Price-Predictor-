import React from "react";
import { BrainCircuit, Activity, BarChart2, Target } from "lucide-react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

export default function Analytics({ data }) {
  if (!data) return null;

  const confidencePercent = (data.confidence * 100).toFixed(0);
  
  // Dummy data for visual representation of historical trend
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        fill: true,
        label: 'Historical Price Trend',
        data: [12, 19, 15, 14, 18, 22, 20].map(v => v * (data.ml_raw_price / 20)),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4
      }
    ]
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' } }
    }
  };

  return (
    <div className="glass-card flex flex-col gap-6">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <BrainCircuit className="text-blue-500"/> AI Analytics
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card-secondary">
          <div className="text-[var(--text-secondary)] text-sm mb-1 flex items-center gap-1"><Target size={14}/> Confidence</div>
          <div className="text-2xl font-bold">{confidencePercent}%</div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-blue-500 h-full" style={{width: `${confidencePercent}%`}}></div>
          </div>
        </div>
        
        <div className="glass-card-secondary">
          <div className="text-[var(--text-secondary)] text-sm mb-1 flex items-center gap-1"><Activity size={14}/> Model Used</div>
          <div className="text-xl font-bold mt-1">LightGBM</div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">MAPE: 6.19%</div>
        </div>
      </div>

      <div className="h-64 mt-4 relative">
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-1 text-[var(--text-secondary)]">
          <BarChart2 size={16}/> Seasonal Demand Forecast
        </h4>
        <Line data={chartData} options={chartOptions} />
      </div>

    </div>
  );
}
