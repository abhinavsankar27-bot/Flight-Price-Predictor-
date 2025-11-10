import React from "react";

export default function ResultCard({ priceRaw, rates = {}, currency = "USD", baseCurrency = "USD" }) {
  if (priceRaw == null) {
    return (
      <div className="bg-white dark:bg-gray-700 p-4 rounded shadow">
        <p className="text-sm text-gray-500 dark:text-gray-300">No prediction yet. Submit the form to see results.</p>
      </div>
    );
  }

  let converted = priceRaw;
  if (rates && rates[currency]) converted = priceRaw * rates[currency];

  const formatted = new Intl.NumberFormat(undefined, { style: "currency", currency }).format(converted);

  const low = converted * 0.85;
  const high = converted * 1.15;
  const formattedLow = new Intl.NumberFormat(undefined, { style: "currency", currency }).format(low);
  const formattedHigh = new Intl.NumberFormat(undefined, { style: "currency", currency }).format(high);

  return (
    <div className="bg-white dark:bg-gray-700 p-4 rounded shadow">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Prediction</h3>

      <div className="mt-4">
        <div className="text-3xl font-bold text-gray-900 dark:text-white">{formatted}</div>
        <div className="text-sm text-gray-500 dark:text-gray-300 mt-1">
          Estimated range: {formattedLow} — {formattedHigh}
        </div>

        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
            <div style={{ width: "50%" }} className="bg-green-500 h-3 rounded-full" />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-300 mt-2">
            Confidence: Approx ±15% (model dependent)
          </div>
        </div>
      </div>
    </div>
  );
}
