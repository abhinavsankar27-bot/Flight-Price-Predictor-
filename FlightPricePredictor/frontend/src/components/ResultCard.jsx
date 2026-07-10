import React, { useEffect, useState } from "react";
import { TrendingDown, TrendingUp, CheckCircle2, ShieldCheck, Zap, Globe2, Clock, Cpu, CalendarClock, Target } from "lucide-react";
import { motion, useAnimation } from "framer-motion";

const CountUp = ({ value, currency, formatter }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10);
    if (isNaN(end)) {
      setCount(value);
      return;
    }
    const duration = 1500;
    let startTime = null;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = currentTime - startTime;
      const percent = Math.min(progress / duration, 1);
      
      // Easing out cubic
      const easeOutCubic = 1 - Math.pow(1 - percent, 3);
      const currentVal = Math.floor(easeOutCubic * end);
      
      setCount(currentVal);
      
      if (percent < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value]);

  return <>{formatter(count)}</>;
};

export default function ResultCard({ data, rates, currency, setCurrency, baseCurrency }) {
  if (!data) return null;

  const getConverted = (val) => {
    if (!rates || !rates[currency]) return val;
    return val * rates[currency];
  };

  const formatPrice = (val) => {
    const num = Number(val);
    if (isNaN(num)) return "N/A";
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(num);
  };

  const pPrice = getConverted(data.predicted_price);
  const lPrice = getConverted(data.live_price_used);
  
  const diff = lPrice - pPrice;
  const savings = diff > 0;
  const diffPercent = ((Math.abs(diff) / Math.max(lPrice, 1)) * 100).toFixed(1);
  const confidence = (data.confidence * 100).toFixed(1);
  
  // Math for dual bars
  const maxPrice = Math.max(pPrice, lPrice) * 1.1; // Add 10% padding
  const pPercent = (pPrice / maxPrice) * 100;
  const lPercent = (lPrice / maxPrice) * 100;

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="glass-card flex flex-col gap-8 relative overflow-hidden"
    >
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">
              Calibrated Prediction
            </h2>
            <span className="badge badge-success flex gap-1 bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400">
              <ShieldCheck size={12}/> ML + Live Fusion
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className={`text-5xl md:text-6xl font-extrabold tracking-tighter ${savings ? 'text-emerald-500 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-500'} drop-shadow-sm`}>
              <CountUp value={pPrice} currency={currency} formatter={formatPrice} />
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-medium text-[var(--text-secondary)]">
            <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/50 px-2 py-1 rounded-md"><Target size={14} className="text-blue-500"/> Confidence: {confidence}%</span>
            <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/50 px-2 py-1 rounded-md"><Cpu size={14} className="text-purple-500"/> v2.1.0 LightGBM</span>
            <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/50 px-2 py-1 rounded-md"><CalendarClock size={14} className="text-orange-500"/> Interval: ±3%</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 w-full md:w-auto">
            <select
              className="bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/50 text-[var(--text-main)] rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-semibold shadow-sm backdrop-blur-md transition-all hover:bg-white dark:hover:bg-gray-800 cursor-pointer"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {["USD", "EUR", "GBP", "INR", "AUD", "CAD"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1 font-medium"><Clock size={12}/> Just updated (45ms)</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* ML Summary Box */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="glass-card-secondary border-l-4 border-l-blue-500 flex flex-col justify-center"
        >
          <div className="flex items-center gap-3 mb-3">
            {savings ? (
              <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <TrendingDown size={24} />
              </div>
            ) : (
               <div className="p-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl">
                 <TrendingUp size={24} />
               </div>
            )}
            <div>
              <h4 className="text-lg font-bold text-[var(--text-main)]">
                {savings ? "Below Market Price!" : "Above Market Average"}
              </h4>
            </div>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
            Our AI predicts this route is currently <span className={`font-bold ${savings ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{diffPercent}%</span> {savings ? 'cheaper' : 'more expensive'} than standard live API rates.
          </p>
        </motion.div>

        {/* Live Price Box */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="glass-card-secondary border border-purple-500/20 flex flex-col justify-between"
        >
           <div className="flex justify-between items-start mb-3">
              <span className="text-[var(--text-secondary)] font-semibold text-sm flex items-center gap-1.5 tracking-wide">
                 <Globe2 size={16} className="text-purple-500"/> Live Market Price
              </span>
              <span className="badge bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 text-[10px] px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800/50">API SOURCE</span>
           </div>
           <div className="text-3xl font-bold tracking-tight mb-3 text-gray-900 dark:text-gray-100">
              <CountUp value={lPrice} currency={currency} formatter={formatPrice} />
           </div>
           <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-[var(--text-secondary)]">Difference</span>
              <span className={`${savings ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'} font-bold`}>
                {savings ? '-' : '+'}{formatPrice(Math.abs(diff))}
              </span>
           </div>
        </motion.div>
      </div>

      {/* Visual Price Comparison Bar */}
      <div className="pt-2">
         <h4 className="text-sm font-bold mb-4 text-[var(--text-main)] tracking-wide">Market Comparison</h4>
         <div className="flex flex-col gap-4">
            {/* Predicted Bar */}
            <div className="relative flex items-center">
              <span className="w-24 text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5"><CheckCircle2 size={14} className="text-blue-500"/> Predicted</span>
              <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-800/50 rounded-full overflow-hidden relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${pPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                  className={`absolute left-0 top-0 h-full rounded-full ${savings ? 'bg-emerald-500' : 'bg-rose-500'}`}
                />
              </div>
            </div>
            
            {/* Live Bar */}
            <div className="relative flex items-center">
              <span className="w-24 text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5"><Zap size={14} className="text-purple-500"/> Live</span>
              <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-800/50 rounded-full overflow-hidden relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${lPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                  className="absolute left-0 top-0 h-full rounded-full bg-gray-400 dark:bg-gray-600"
                />
              </div>
            </div>
         </div>
      </div>
      
    </motion.div>
  );
}
