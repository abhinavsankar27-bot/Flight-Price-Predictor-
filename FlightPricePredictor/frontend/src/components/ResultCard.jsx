import React from "react";
import { TrendingDown, TrendingUp, CheckCircle2, ShieldCheck, Zap, Globe2, Clock } from "lucide-react";
import { motion } from "framer-motion";

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

  return (
    <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card flex flex-col gap-6"
    >
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
            Calibrated Prediction
          </h2>
          <div className="flex items-baseline gap-3">
            <span className={`text-4xl md:text-5xl font-bold tracking-tight ${savings ? 'text-green-500' : 'text-blue-500'}`}>
              {formatPrice(pPrice)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
            <select
              className="bg-[var(--card-secondary)] border border-gray-700/50 text-[var(--text-main)] rounded-lg px-3 py-1.5 focus:outline-none text-sm font-medium"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {["USD", "EUR", "GBP", "INR", "AUD", "CAD"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <span className="badge badge-success flex gap-1"><ShieldCheck size={14}/> ML + Live Fusion</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* ML Summary Box */}
        <div className="glass-card-secondary border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3 mb-2">
            {savings ? (
              <div className="p-2 bg-green-500/20 text-green-500 rounded-full">
                <TrendingDown size={20} />
              </div>
            ) : (
               <div className="p-2 bg-red-500/20 text-red-500 rounded-full">
                 <TrendingUp size={20} />
               </div>
            )}
            <div>
              <h4 className="font-semibold text-[var(--text-main)]">
                {savings ? "Below Market Price!" : "Above Market Average"}
              </h4>
            </div>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Our AI predicts this route is currently {diffPercent}% {savings ? 'cheaper' : 'more expensive'} than standard live API rates.
          </p>
        </div>

        {/* Live Price Box */}
        <div className="glass-card-secondary border border-purple-500/30 flex flex-col justify-between">
           <div className="flex justify-between items-start mb-2">
              <span className="text-[var(--text-secondary)] text-sm flex items-center gap-1">
                 <Globe2 size={14} className="text-purple-500"/> Live Market Price
              </span>
              <span className="badge bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">SIMULATED</span>
           </div>
           <div className="text-2xl font-bold tracking-tight mb-2">
              {formatPrice(lPrice)}
           </div>
           <div className="flex justify-between items-center text-xs text-[var(--text-secondary)]">
              <span className="flex items-center gap-1"><Clock size={12}/> Just updated</span>
              <span>Diff: {savings ? '-' : '+'}{formatPrice(Math.abs(diff))}</span>
           </div>
        </div>
      </div>

      {/* Visual Price Comparison Bar */}
      <div>
         <h4 className="text-sm font-semibold mb-3">Market Comparison</h4>
         <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex relative">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${Math.min((pPrice / Math.max(lPrice, pPrice)) * 100, 100)}%` }}
               transition={{ duration: 1, ease: "easeOut" }}
               className={`h-full ${savings ? 'bg-green-500' : 'bg-red-500'}`}
               style={{ zIndex: 10 }}
            />
            <div className="absolute top-0 left-0 h-full w-full bg-transparent border-r-2 border-dashed border-gray-400 dark:border-gray-500" style={{ width: '100%' }}></div>
         </div>
         <div className="flex justify-between text-xs mt-2 text-[var(--text-secondary)]">
            <span className="flex items-center gap-1"><CheckCircle2 size={12}/> Predicted</span>
            <span className="flex items-center gap-1"><Zap size={12}/> Live Market</span>
         </div>
      </div>
      
    </motion.div>
  );
}
