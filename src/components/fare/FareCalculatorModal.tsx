import React, { useState } from 'react';
import { Calculator, X, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { calculateAreaFareMatrix, AreaFareComparison } from '../../services/fareMatrixService';

interface FareCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  originName?: string;
  destName?: string;
}

export const FareCalculatorModal: React.FC<FareCalculatorModalProps> = ({
  isOpen,
  onClose,
  originName = 'Jayadev Vihar',
  destName = 'KIIT Square, Bhubaneswar',
}) => {
  const [distanceKm, setDistanceKm] = useState(8.5);
  const [fareData, setFareData] = useState<AreaFareComparison>(
    calculateAreaFareMatrix(originName, destName, distanceKm)
  );

  if (!isOpen) return null;

  const handleDistanceChange = (dist: number) => {
    setDistanceKm(dist);
    setFareData(calculateAreaFareMatrix(originName, destName, dist));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-xl">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                All Transit Fares in This Area
              </h3>
              <p className="text-xs text-slate-400">Compare official fares across all public & private modes for your trip</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Distance Slider & Route Info */}
        <div className="dashboard-card p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
            <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>{fareData.origin} ➔ {fareData.destination}</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Distance: {distanceKm} km</span>
            <input
              type="range"
              min="1"
              max="40"
              step="0.5"
              value={distanceKm}
              onChange={(e) => handleDistanceChange(parseFloat(e.target.value))}
              className="w-32 accent-blue-600 cursor-pointer"
            />
          </div>
        </div>

        {/* All Available Fares Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {fareData.modes.map((mode, idx) => (
            <div
              key={idx}
              className="dashboard-card p-4 rounded-2xl flex flex-col justify-between gap-3 hover:border-blue-400 dark:hover:border-blue-600 transition"
            >
              <div className="flex items-start justify-between">
                <span className="text-2xl">{mode.icon}</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
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

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
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
                  <div className="text-[10px] text-emerald-600">🌱 {mode.carbonGrams}g CO₂</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
