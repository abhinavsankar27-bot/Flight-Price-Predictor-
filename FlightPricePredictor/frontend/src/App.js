import React, { useState, useEffect } from "react";
import FlightForm from "./components/FlightForm";
import ResultCard from "./components/ResultCard";
import "./index.css";

// Base currency for conversion
const BASE_CURRENCY = "INR";

export default function App() {
  const [priceRaw, setPriceRaw] = useState(null);
  const [currency, setCurrency] = useState("INR");
  const [rates, setRates] = useState({});
  const [dark, setDark] = useState(false);

  // Fetch exchange rates
  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await fetch(`https://api.exchangerate.host/latest?base=${BASE_CURRENCY}`);
        const json = await res.json();
        if (json && json.rates) setRates(json.rates);
      } catch (err) {
        console.error("Currency API fetch failed:", err);
      }
    }
    fetchRates();
  }, []);

  // Toggle dark mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const ALL_CURRENCIES = [
    "AED","AFN","ALL","AMD","ANG","AOA","ARS","AUD","AWG","AZN","BAM","BBD","BDT","BGN","BHD",
    "BIF","BMD","BND","BOB","BRL","BSD","BTN","BWP","BYN","BZD","CAD","CDF","CHF","CLP","CNY",
    "COP","CRC","CUC","CUP","CVE","CZK","DJF","DKK","DOP","DZD","EGP","ERN","ETB","EUR","FJD",
    "FKP","GBP","GEL","GGP","GHS","GIP","GMD","GNF","GTQ","GYD","HKD","HNL","HRK","HTG","HUF",
    "IDR","ILS","IMP","INR","IQD","IRR","ISK","JEP","JMD","JOD","JPY","KES","KGS","KHR","KMF",
    "KPW","KRW","KWD","KYD","KZT","LAK","LBP","LKR","LRD","LSL","LYD","MAD","MDL","MGA","MKD",
    "MMK","MNT","MOP","MRU","MUR","MVR","MWK","MXN","MYR","MZN","NAD","NGN","NIO","NOK","NPR",
    "NZD","OMR","PAB","PEN","PGK","PHP","PKR","PLN","PYG","QAR","RON","RSD","RUB","RWF","SAR",
    "SBD","SCR","SDG","SEK","SGD","SHP","SLL","SOS","SRD","SSP","SVC","SYP","SZL","THB",
    "TJS","TMT","TND","TOP","TRY","TTD","TWD","TZS","UAH","UGX","USD","UYU","UZS","VES","VND",
    "VUV","WST","XAF","XCD","XOF","XPF","YER","ZAR","ZMW"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      <header className="max-w-5xl mx-auto flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Flight Price Predictor 🌍
        </h1>

        <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
          Dark Mode
          <input type="checkbox" checked={dark} onChange={() => setDark(!dark)} />
        </label>
      </header>

      <main className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-8">
        {/* Flight Form */}
        {FlightForm ? (
          <FlightForm onPredict={setPriceRaw} airportCurrencyBase={BASE_CURRENCY} />
        ) : (
          <p className="text-red-500">FlightForm component not found</p>
        )}

        {/* Result Card */}
        <div className="bg-white dark:bg-gray-700 shadow rounded p-4">
          <h2 className="text-xl font-semibold dark:text-white mb-2">Result</h2>

          <label className="text-sm dark:text-gray-300 mb-1 block">Display Currency:</label>
          <select
            className="w-full p-2 border rounded mb-4 dark:bg-gray-600 dark:text-white"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {ALL_CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {ResultCard ? (
            <ResultCard
              priceRaw={priceRaw}
              rates={rates}
              currency={currency}
              baseCurrency={BASE_CURRENCY}
            />
          ) : (
            <p className="text-red-500">ResultCard component not found</p>
          )}
        </div>
      </main>
    </div>
  );
}
