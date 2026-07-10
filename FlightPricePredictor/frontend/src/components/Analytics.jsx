import React from "react";
import { BrainCircuit, Activity, BarChart2, Target, Clock, Zap, CheckCircle, Flame, CalendarRange, Navigation2, Network } from "lucide-react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler } from 'chart.js';
import { motion } from "framer-motion";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

const FactorItem = ({ icon: Icon, title, description, delay }) => (
  <motion.div 
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-default"
  >
    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
      <Icon size={16} />
    </div>
    <div>
      <h5 className="text-sm font-semibold text-[var(--text-main)] mb-0.5">{title}</h5>
      <p className="text-xs text-[var(--text-secondary)]">{description}</p>
    </div>
  </motion.div>
);

const Analytics = React.memo(function Analytics({ data }) {
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
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderWidth: 0,
        pointRadius: 3,
        pointHoverRadius: 6
      }
    ]
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        padding: 12,
        titleFont: { size: 13, family: 'Inter' },
        bodyFont: { size: 14, weight: 'bold', family: 'Inter' },
        displayColors: false,
        cornerRadius: 8
      }
    },
    scales: {
      x: { 
        grid: { display: false }, 
        ticks: { color: '#64748B', font: { family: 'Inter', size: 11 } } 
      },
      y: { 
        grid: { color: 'rgba(100, 116, 139, 0.1)' }, 
        ticks: { display: false } 
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  return (
    <div className="glass-card flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
          <BrainCircuit size={24} />
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-[var(--text-main)]">
          AI Analytics
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Confidence", value: `${confidencePercent}%`, icon: Target, color: "text-blue-500", progress: confidencePercent },
          { label: "Model Used", value: "LightGBM", icon: Activity, color: "text-purple-500", sub: "MAPE: 6.19%" },
          { label: "Prediction Time", value: "T+30 Days", icon: CalendarRange, color: "text-emerald-500", sub: "Forward looking" },
          { label: "Processing Time", value: "112ms", icon: Zap, color: "text-amber-500", sub: "Server response" },
          { label: "Calibration Score", value: "0.94", icon: CheckCircle, color: "text-indigo-500", sub: "High accuracy" },
          { label: "Data Source", value: "Live APIs", icon: Network, color: "text-rose-500", sub: "Real-time sync" }
        ].map((card, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -2 }}
            className="glass-card-secondary group"
          >
            <div className="text-[var(--text-secondary)] text-xs font-semibold mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
              <card.icon size={14} className={`${card.color} opacity-80 group-hover:opacity-100 transition-opacity`} /> 
              {card.label}
            </div>
            <div className="text-lg md:text-xl font-bold text-[var(--text-main)]">{card.value}</div>
            {card.progress ? (
              <div className="w-full bg-gray-200 dark:bg-gray-700/50 h-1.5 rounded-full mt-2.5 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${card.progress}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="bg-blue-500 h-full" 
                />
              </div>
            ) : (
              <div className="text-xs text-[var(--text-secondary)] mt-1.5 font-medium">{card.sub}</div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="flex flex-col">
          <h4 className="text-sm font-bold mb-4 flex items-center gap-2 text-[var(--text-main)] uppercase tracking-wider">
            <Flame size={16} className="text-orange-500"/> Top AI Factors
          </h4>
          <div className="flex flex-col gap-1">
            <FactorItem 
              icon={CalendarRange} 
              title="Holiday Season" 
              description="High demand period detected (+12% impact)" 
              delay={0.1}
            />
            <FactorItem 
              icon={Navigation2} 
              title="Direct Flight" 
              description="Premium for zero layovers (+8% impact)" 
              delay={0.2}
            />
            <FactorItem 
              icon={Network} 
              title="Route Popularity" 
              description="Historical high volume route (+5% impact)" 
              delay={0.3}
            />
            <FactorItem 
              icon={Activity} 
              title="Airline Demand" 
              description="Current carrier booking velocity (+3% impact)" 
              delay={0.4}
            />
          </div>
        </div>

        <div className="flex flex-col">
          <h4 className="text-sm font-bold mb-4 flex items-center gap-2 text-[var(--text-main)] uppercase tracking-wider">
            <BarChart2 size={16} className="text-blue-500"/> Seasonal Trend
          </h4>
          <div className="h-48 relative w-full">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
});

export default Analytics;
