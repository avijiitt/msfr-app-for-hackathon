import React, { useState, useEffect } from 'react';
import { Calculator, X, ArrowRight, ShieldCheck, MapPin, Navigation, Shuffle, Bus, Sparkles, CheckCircle2 } from 'lucide-react';
import { calculateAreaFareMatrix, calculateDistanceBetweenLocations, AreaFareComparison } from '../../services/fareMatrixService';
import { BHUBANESWAR_LOCALITIES } from '../../data/cities/bhubaneswar';

interface FareCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  originName?: string;
  destName?: string;
}

const POPULAR_LOCALITIES = [
  'Master Canteen',
  'Jayadev Vihar',
  'KIIT University, Patia',
  'Infocity IT Hub',
  'Baramunda ISBT',
  'Biju Patnaik Airport',
  'Khandagiri Caves',
  'Cuttack Badambadi',
  'Vani Vihar Square',
  'Rasulgarh Square',
  'AIIMS Hospital',
];

export const FareCalculatorModal: React.FC<FareCalculatorModalProps> = ({
  isOpen,
  onClose,
  originName = 'Jayadev Vihar',
  destName = 'KIIT Square, Patia',
}) => {
  const [manualOrigin, setManualOrigin] = useState(originName);
  const [manualDest, setManualDest] = useState(destName);
  const [isAutoMeasured, setIsAutoMeasured] = useState(true);
  
  // Calculate initial auto distance
  const [distanceKm, setDistanceKm] = useState(() => 
    calculateDistanceBetweenLocations(originName, destName)
  );

  useEffect(() => {
    if (originName) setManualOrigin(originName);
    if (destName) setManualDest(destName);
    const measured = calculateDistanceBetweenLocations(originName, destName);
    setDistanceKm(measured);
    setIsAutoMeasured(true);
  }, [originName, destName]);

  // When user edits origin or destination, auto-calculate road distance
  const handleOriginChange = (val: string) => {
    setManualOrigin(val);
    const measured = calculateDistanceBetweenLocations(val, manualDest);
    setDistanceKm(measured);
    setIsAutoMeasured(true);
  };

  const handleDestChange = (val: string) => {
    setManualDest(val);
    const measured = calculateDistanceBetweenLocations(manualOrigin, val);
    setDistanceKm(measured);
    setIsAutoMeasured(true);
  };

  const [fareData, setFareData] = useState<AreaFareComparison>(() =>
    calculateAreaFareMatrix(manualOrigin, manualDest, distanceKm)
  );

  useEffect(() => {
    setFareData(calculateAreaFareMatrix(manualOrigin, manualDest, distanceKm));
  }, [manualOrigin, manualDest, distanceKm]);

  if (!isOpen) return null;

  const handleSwap = () => {
    const tempOrig = manualOrigin;
    const tempDest = manualDest;
    setManualOrigin(tempDest);
    setManualDest(tempOrig);
    const measured = calculateDistanceBetweenLocations(tempDest, tempOrig);
    setDistanceKm(measured);
    setIsAutoMeasured(true);
  };

  const handleQuickSelect = (place: string, target: 'origin' | 'dest') => {
    if (target === 'origin') {
      handleOriginChange(place);
    } else {
      handleDestChange(place);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="max-w-3xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl shadow-xs">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                Transit Fare Calculator
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Compare official Ama Bus (CRUT Slabs), Auto, Cab & Bike fares for any route
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 📍 Manual Location Input Section */}
        <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-blue-600" />
              <span>Select or Type Route Places (Auto-Calculates Distance)</span>
            </div>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Auto-Distance Active
            </span>
          </div>

          {/* Datalist for existing places */}
          <datalist id="bbsr-places">
            {BHUBANESWAR_LOCALITIES.map((loc) => (
              <option key={loc.id} value={loc.name}>
                {loc.popularLandmark || loc.category}
              </option>
            ))}
          </datalist>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] items-center gap-2">
            {/* Origin Input */}
            <div className="relative">
              <div className="absolute left-3 top-3 text-emerald-500 font-bold text-xs">🟢</div>
              <input
                type="text"
                list="bbsr-places"
                placeholder="From (e.g. Master Canteen)"
                value={manualOrigin}
                onChange={(e) => handleOriginChange(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-2.5 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition shadow-2xs"
              />
            </div>

            {/* Swap Button */}
            <button
              onClick={handleSwap}
              className="p-2.5 self-center mx-auto rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 transition active:scale-95 shadow-2xs"
              title="Swap From and To"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>

            {/* Destination Input */}
            <div className="relative">
              <div className="absolute left-3 top-3 text-rose-500 font-bold text-xs">📍</div>
              <input
                type="text"
                list="bbsr-places"
                placeholder="To (e.g. KIIT University, Patia)"
                value={manualDest}
                onChange={(e) => handleDestChange(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-2.5 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition shadow-2xs"
              />
            </div>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Quick Pick Existing Places:
            </span>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              {POPULAR_LOCALITIES.map((place) => (
                <button
                  key={place}
                  onClick={() => handleQuickSelect(place, 'dest')}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 text-[11px] font-semibold transition shadow-2xs active:scale-95"
                >
                  {place.split(',')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 📏 Distance Slider & Route Info */}
        <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
              <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="truncate">{manualOrigin || 'Origin'} ➔ {manualDest || 'Destination'}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{isAutoMeasured ? 'Real-world road distance auto-computed' : 'Manually customized distance'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto flex-shrink-0">
            <div className="text-right">
              <span className="text-sm font-black text-blue-600 dark:text-blue-400 block whitespace-nowrap">
                {distanceKm} km
              </span>
              <span className="text-[9px] text-slate-400 uppercase font-bold">Road Dist</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="0.5"
              value={distanceKm}
              onChange={(e) => {
                setDistanceKm(parseFloat(e.target.value));
                setIsAutoMeasured(false);
              }}
              className="w-36 accent-blue-600 cursor-pointer"
            />
          </div>
        </div>

        {/* 💰 All Available Fares Grid (Ama Bus, Auto, Cab, Bike, Train) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {fareData.modes.map((mode, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl flex flex-col justify-between gap-3 hover:border-blue-500 dark:hover:border-blue-500 transition shadow-xs"
            >
              <div className="flex items-start justify-between">
                <span className="text-2xl">{mode.icon}</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {mode.badge}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  {mode.category}
                </span>
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                  {mode.title}
                </h4>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-baseline justify-between">
                <div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    ₹{mode.fareInr}
                  </div>
                  {mode.concessionFareInr && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      Student/Senior: ₹{mode.concessionFareInr}
                    </span>
                  )}
                </div>
                <div className="text-right text-[11px] text-slate-400 font-medium">
                  <div>⏱️ {mode.durationMins} mins</div>
                  <div className="text-[10px] text-emerald-600 font-bold">🌱 {mode.carbonGrams}g CO₂</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:opacity-90 text-white font-bold text-xs transition shadow-sm"
        >
          Close Calculator
        </button>
      </div>
    </div>
  );
};

