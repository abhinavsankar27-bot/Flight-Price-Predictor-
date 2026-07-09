import React, { useState } from "react";
import { Sparkles, PlaneTakeoff, PlaneLanding, Calendar, Plane, MapPin } from "lucide-react";
import airports from "../assets/airports.json";

const AIRLINES = [
  "American Airlines", "Emirates", "Qatar Airways", "Singapore Airlines",
  "IndiGo", "Air India", "Lufthansa", "British Airways", "Etihad"
];

export default function FlightForm({ onPredict, loading }) {
  const [magicQuery, setMagicQuery] = useState("");
  const [magicLoading, setMagicLoading] = useState(false);

  const [airline, setAirline] = useState(AIRLINES[0]);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [stops, setStops] = useState(0);

  const handleMagicFill = async () => {
    if (!magicQuery) return;
    try {
      setMagicLoading(true);
      const res = await fetch("http://127.0.0.1:5000/parse_flight_query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: magicQuery })
      });
      const data = await res.json();
      
      if (data.source_code) setSource(data.source_code);
      if (data.destination_code) setDestination(data.destination_code);
      if (data.date) setDate(data.date);
      if (data.airline && AIRLINES.includes(data.airline)) setAirline(data.airline);
      if (data.stops !== undefined) setStops(data.stops);
      
      setMagicQuery("");
    } catch (err) {
      console.error(err);
      alert("Failed to reach the AI server.");
    } finally {
      setMagicLoading(false);
    }
  };


  const submit = (e) => {
    e.preventDefault();
    if (!source || !destination || !date) return alert("Please fill all fields");
    if (source === destination) return alert("Source and destination cannot be same");
    
    const dt = new Date(date);
    onPredict({
      airline,
      source,
      destination,
      day: dt.getDate(),
      month: dt.getMonth() + 1,
      stops: Number(stops)
    });
  };

  return (
    <div className="glass-card flex flex-col gap-6">

      {/* AI Prompt Box */}
      <div className="glass-card-secondary border-blue-500/30 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <label className="flex items-center gap-2 text-sm font-semibold text-[var(--text-main)] mb-2">
          <Sparkles size={16} className="text-purple-500 magic-sparkle" />
          Describe Your Trip
        </label>
        <div className="flex gap-2 relative z-10">
          <input
            type="text"
            className="input-modern bg-white/50 dark:bg-black/20"
            placeholder="e.g. Business trip from Delhi to Dubai next Friday"
            value={magicQuery}
            onChange={(e) => setMagicQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleMagicFill();
              }
            }}
          />
          <button
            type="button"
            onClick={handleMagicFill}
            disabled={magicLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-70"
          >
            {magicLoading ? (
               <div className="loading border-t-white" />
            ) : (
               <span>Generate</span>
            )}
          </button>
        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
            <Plane size={16} /> Airline
          </label>
          <select 
            className="input-modern"
            value={airline}
            onChange={(e) => setAirline(e.target.value)}
          >
            {AIRLINES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
              <PlaneTakeoff size={16} /> From
            </label>
            <select className="input-modern" value={source} onChange={(e) => setSource(e.target.value)}>
              <option value="">Select Origin</option>
              {airports.map(a => <option key={a.code} value={a.code}>{a.city} ({a.code})</option>)}
            </select>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
              <PlaneLanding size={16} /> To
            </label>
            <select className="input-modern" value={destination} onChange={(e) => setDestination(e.target.value)}>
              <option value="">Select Destination</option>
              {airports.map(a => <option key={a.code} value={a.code}>{a.city} ({a.code})</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
              <Calendar size={16} /> Date
            </label>
            <input type="date" className="input-modern" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
              <MapPin size={16} /> Stops
            </label>
            <select className="input-modern" value={stops} onChange={(e) => setStops(e.target.value)}>
              <option value={0}>Direct (0 stops)</option>
              <option value={1}>1 stop</option>
              <option value={2}>2 stops</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary mt-4 flex items-center justify-center gap-2">
          {loading ? (
             <>
               <div className="loading border-t-white" /> Analyzing...
             </>
          ) : (
             <>
               Predict Price
             </>
          )}
        </button>

      </form>
    </div>
  );
}
