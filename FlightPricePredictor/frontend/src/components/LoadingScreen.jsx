import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plane } from "lucide-react";

const steps = [
  "Analyzing Routes...",
  "Estimating Demand...",
  "Running ML Model...",
  "Comparing Market...",
  "Almost Ready..."
];

export default function LoadingScreen() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 500); // cycle through steps
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-color)]/80 backdrop-blur-xl"
    >
      <div className="flex flex-col items-center gap-6">
        <motion.div
           animate={{ 
             y: [-10, 10, -10],
             x: [0, 5, 0]
           }}
           transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
           className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 flex items-center justify-center relative shadow-[0_0_50px_rgba(59,130,246,0.3)]"
        >
          <Plane size={40} className="text-blue-500 transform -rotate-45" />
          {/* Pulsing ring */}
          <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 animate-ping"></div>
        </motion.div>

        <div className="text-center">
           <h2 className="text-xl font-semibold mb-2">Generating Prediction</h2>
           <motion.p 
              key={stepIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[var(--text-secondary)] font-medium"
           >
             {steps[stepIndex]}
           </motion.p>
        </div>

        <div className="w-64 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
           <motion.div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
           />
        </div>
      </div>
    </motion.div>
  );
}
