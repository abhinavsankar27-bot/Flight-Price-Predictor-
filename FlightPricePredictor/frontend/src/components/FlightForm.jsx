import React, { useState, useRef, useEffect } from "react";
import { Sparkles, PlaneTakeoff, PlaneLanding, Calendar, Plane, MapPin, Search, ChevronDown, Check } from "lucide-react";
import airports from "../assets/airports.json";
import { motion, AnimatePresence } from "framer-motion";

const AIRLINES = [
  "American Airlines", "Emirates", "Qatar Airways", "Singapore Airlines",
  "IndiGo", "Air India", "Lufthansa", "British Airways", "Etihad"
];

// Helper to get initials or simple logo
const getAirlineLogo = (name) => {
  return name.substring(0, 2).toUpperCase();
};

const CustomSelect = ({ value, onChange, options, placeholder, icon: Icon, type }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => {
    if (type === "airport") {
      const text = `${opt.code} ${opt.city} ${opt.name}`.toLowerCase();
      return text.includes(query.toLowerCase());
    }
    return opt.toLowerCase().includes(query.toLowerCase());
  });

  const selectedOption = type === "airport" 
    ? options.find(o => o.code === value) 
    : value;

  return (
    <div className="relative w-full" ref={ref}>
      <div 
        className="input-modern flex items-center justify-between cursor-pointer group"
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {selectedOption ? (
            type === "airport" ? (
              <div className="flex items-center gap-2 truncate">
                <span className="font-bold text-[var(--text-main)]">{selectedOption.code}</span>
                <span className="text-[var(--text-secondary)] truncate">{selectedOption.city}</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold">
                  {getAirlineLogo(selectedOption)}
                </div>
                <span className="font-medium text-[var(--text-main)] truncate">{selectedOption}</span>
              </div>
            )
          ) : (
            <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
          )}
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-gray-700/50 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-xl"
          >
            <div className="p-2 border-b border-gray-100 dark:border-gray-700/50 flex items-center gap-2">
              <Search size={14} className="text-gray-400 ml-2" />
              <input
                type="text"
                className="w-full bg-transparent border-none focus:outline-none text-sm p-1 text-[var(--text-main)]"
                placeholder="Search..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoFocus
              />
            </div>
            <div className="max-h-60 overflow-y-auto p-1 scrollbar-thin">
              {filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-400">No results found.</div>
              ) : (
                filteredOptions.map((opt, i) => {
                  const isSelected = type === "airport" ? value === opt.code : value === opt;
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
                      onClick={() => {
                        onChange(type === "airport" ? opt.code : opt);
                        setIsOpen(false);
                        setQuery("");
                      }}
                    >
                      {type === "airport" ? (
                        <>
                          <div className="flex flex-col flex-1 truncate">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-sm text-[var(--text-main)]">{opt.code}</span>
                                {isSelected && <Check size={14} className="text-blue-500" />}
                            </div>
                            <span className="text-xs text-[var(--text-secondary)] truncate">{opt.name}, {opt.city}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold">
                            {getAirlineLogo(opt)}
                          </div>
                          <span className="flex-1 font-medium text-sm text-[var(--text-main)] truncate">{opt}</span>
                          {isSelected && <Check size={14} className="text-blue-500" />}
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


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
      const API_URL = process.env.REACT_APP_API_URL || "https://flight-price-predictor-77yj.onrender.com";
      const res = await fetch(`${API_URL}/parse_flight_query`, {
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
        <label className="flex items-center gap-2 text-sm font-semibold text-[var(--text-main)] mb-3">
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
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleMagicFill}
            disabled={magicLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-70 shadow-lg shadow-purple-500/20"
          >
            {magicLoading ? (
               <div className="loading border-t-white" />
            ) : (
               <span className="font-medium">Generate</span>
            )}
          </motion.button>
        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent my-1"></div>

      <form onSubmit={submit} className="flex flex-col gap-5">
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2">
            <Plane size={16} className="text-blue-500" /> Airline
          </label>
          <CustomSelect 
            value={airline} 
            onChange={setAirline} 
            options={AIRLINES} 
            type="airline" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2">
              <PlaneTakeoff size={16} className="text-blue-500" /> From
            </label>
            <CustomSelect 
              value={source} 
              onChange={setSource} 
              options={airports} 
              placeholder="Select Origin"
              type="airport" 
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2">
              <PlaneLanding size={16} className="text-purple-500" /> To
            </label>
            <CustomSelect 
              value={destination} 
              onChange={setDestination} 
              options={airports} 
              placeholder="Select Destination"
              type="airport" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2">
              <Calendar size={16} className="text-blue-500" /> Date
            </label>
            <input type="date" className="input-modern" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2">
              <MapPin size={16} className="text-purple-500" /> Stops
            </label>
            <select className="input-modern appearance-none" value={stops} onChange={(e) => setStops(e.target.value)}>
              <option value={0}>Direct (0 stops)</option>
              <option value={1}>1 stop</option>
              <option value={2}>2 stops</option>
            </select>
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit" 
          disabled={loading} 
          className="btn-primary mt-6 flex items-center justify-center gap-2 py-4 text-lg"
        >
          {loading ? (
             <>
               <div className="loading border-t-white" /> Analyzing Route...
             </>
          ) : (
             <>
               Predict Price
             </>
          )}
        </motion.button>

      </form>
    </div>
  );
}
