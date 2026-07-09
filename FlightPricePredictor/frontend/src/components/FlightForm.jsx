import React, { useState } from "react";
import { Sparkles, PlaneTakeoff, PlaneLanding, Calendar, Plane, MapPin } from "lucide-react";
import airports from "../assets/airports.json";

const AIRLINES = [
  "American Airlines", "Emirates", "Qatar Airways", "Singapore Airlines",
  "IndiGo", "Air India", "Lufthansa", "British Airways", "Etihad"
];

export default function FlightForm({ onPredict, loading }) {
  const [airline, setAirline] = useState(AIRLINES[0]);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [stops, setStops] = useState(0);


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
