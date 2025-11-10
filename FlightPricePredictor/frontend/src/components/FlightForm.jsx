import React, { useState } from "react";
import airports from "../assets/airports.json"; // Make sure this file exists

const AIRLINES = [
  "American Airlines","Emirates","Qatar Airways","Singapore Airlines",
  "IndiGo","Air India","Lufthansa","British Airways","Etihad"
];

const airlineIndexMap = AIRLINES.reduce((acc, a, i) => { acc[a] = i; return acc; }, {});
const airportIndexMap = airports ? airports.reduce((acc, a, i) => { acc[a.code] = i; return acc; }, {}) : {};

export default function FlightForm({ onPredict }) {
  const [airline, setAirline] = useState(AIRLINES[0]);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [stops, setStops] = useState(0);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (!source || !destination || !date) {
      alert("Please fill all required fields!");
      return;
    }

    if (source === destination) {
      alert("Source and destination cannot be the same.");
      return;
    }

    const dt = new Date(date);
    const day = dt.getDate();
    const month = dt.getMonth() + 1;

    const payload = {
      airline: airlineIndexMap[airline] ?? 0,
      source: airportIndexMap[source] ?? 0,
      destination: airportIndexMap[destination] ?? 0,
      day,
      month,
      stops: Number(stops)
    };

    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (onPredict) onPredict(data.predicted_price);
    } catch (err) {
      console.error(err);
      alert("Prediction failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white dark:bg-gray-700 p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-3 dark:text-white">Enter Flight Details</h2>

      <label className="block text-sm dark:text-gray-300 mt-2">Airline</label>
      <select
        className="w-full p-2 border rounded dark:bg-gray-600 dark:text-white"
        value={airline}
        onChange={(e) => setAirline(e.target.value)}
      >
        {AIRLINES.map(a => <option key={a} value={a}>{a}</option>)}
      </select>

      <label className="block text-sm dark:text-gray-300 mt-2">From (Departure)</label>
      <select
        className="w-full p-2 border rounded dark:bg-gray-600 dark:text-white"
        value={source}
        onChange={(e) => setSource(e.target.value)}
      >
        <option value="">Select Airport</option>
        {airports.map(a => (
          <option key={a.code} value={a.code}>{a.city} ({a.code}) — {a.name}</option>
        ))}
      </select>

      <label className="block text-sm dark:text-gray-300 mt-2">To (Arrival)</label>
      <select
        className="w-full p-2 border rounded dark:bg-gray-600 dark:text-white"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
      >
        <option value="">Select Airport</option>
        {airports.map(a => (
          <option key={a.code} value={a.code}>{a.city} ({a.code}) — {a.name}</option>
        ))}
      </select>

      <label className="block text-sm dark:text-gray-300 mt-2">Travel Date</label>
      <input
        type="date"
        className="w-full p-2 border rounded dark:bg-gray-600 dark:text-white"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <label className="block text-sm dark:text-gray-300 mt-2">Stops</label>
      <select
        className="w-full p-2 border rounded dark:bg-gray-600 dark:text-white"
        value={stops}
        onChange={(e) => setStops(e.target.value)}
      >
        <option value={0}>Direct (0 stops)</option>
        <option value={1}>1 stop</option>
        <option value={2}>2 stops</option>
        <option value={3}>3 stops</option>
      </select>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
      >
        {loading ? "Predicting..." : "Predict Price"}
      </button>
    </form>
  );
}
