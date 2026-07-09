import React, { useState, useEffect } from "react";
import { Plane, Moon, Sun, BarChart3, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FlightForm from "./components/FlightForm";
import ResultCard from "./components/ResultCard";
import Analytics from "./components/Analytics";
import LoadingScreen from "./components/LoadingScreen";
import "./index.css";

const BASE_CURRENCY = "USD";

export default function App() {
  const [predictionData, setPredictionData] = useState(null);
  const [currency, setCurrency] = useState("INR");
  const [rates, setRates] = useState({});
  const [dark, setDark] = useState(true);
  const [appState, setAppState] = useState("idle"); // idle, loading, result

  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await fetch(`https://open.er-api.com/v6/latest/${BASE_CURRENCY}`);
        const json = await res.json();
        if (json && json.rates) {
          setRates(json.rates);
        }
      } catch (err) {
        console.error("Currency API fetch failed:", err);
      }
    }
    fetchRates();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const handlePredict = async (payload) => {
    setAppState("loading");
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";
      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      // Simulate real delay for loading screen effect
      setTimeout(() => {
        setPredictionData({
            ...data,
            input: payload
        });
        setAppState("result");
      }, 2500);

    } catch (err) {
      console.error(err);
      alert("Prediction failed!");
      setAppState("idle");
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-300">
      
      <AnimatePresence>
        {appState === "loading" && <LoadingScreen />}
      </AnimatePresence>

      <nav className="sticky top-0 z-40 w-full backdrop-blur-lg bg-white/70 dark:bg-[#0B1220]/70 border-b border-gray-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-tr from-blue-500 to-purple-600 p-2 rounded-xl text-white">
                <Plane size={24} className="transform -rotate-45" />
              </div>
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                FlightAI
              </span>
            </div>
            <div className="flex items-center gap-6">
              <span onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-sm font-medium hover:text-blue-500 cursor-pointer transition-colors hidden md:block">Home</span>
              <span onClick={() => {
                const el = document.getElementById('analytics-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  alert('Please generate a prediction first to view analytics.');
                }
              }} className="text-sm font-medium hover:text-blue-500 cursor-pointer transition-colors hidden md:block">Analytics</span>
              <button 
                onClick={() => setDark(!dark)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
              >
                {dark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-12">
        <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s'}}></div>
        </div>
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
          >
            Predict Flight Prices with <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">AI</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto"
          >
            Get intelligent flight price estimates powered by LightGBM machine learning and compare them with live market prices instantly.
          </motion.p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column - Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4"
          >
            <FlightForm onPredict={handlePredict} loading={appState === "loading"} />
          </motion.div>

          {/* Right Column - Results */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-8 flex flex-col gap-6"
          >
            {appState === "result" && predictionData ? (
              <>
                <ResultCard 
                    data={predictionData} 
                    rates={rates} 
                    currency={currency} 
                    setCurrency={setCurrency}
                    baseCurrency={BASE_CURRENCY} 
                />
                <div id="analytics-section">
                  <Analytics data={predictionData} rates={rates} currency={currency} />
                </div>
              </>
            ) : (
              <div className="h-full min-h-[400px] glass-card flex flex-col items-center justify-center text-center opacity-70">
                <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-tr from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                    <Plane size={48} className="text-gray-400 dark:text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Prediction Yet</h3>
                <p className="text-[var(--text-secondary)] max-w-sm">
                  Enter your flight details and click predict to generate an AI-powered price analysis.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
