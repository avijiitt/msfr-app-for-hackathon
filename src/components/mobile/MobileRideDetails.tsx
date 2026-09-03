import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface MobileRideDetailsProps {
  originName: string;
  destinationName: string;
  onBack: () => void;
  onShareTrip: () => void;
  onScheduleTrip: () => void;
  onStartTracking: () => void;
}

export const MobileRideDetails: React.FC<MobileRideDetailsProps> = ({
  originName = 'Jayadev Vihar',
  destinationName = 'Near Niladri Vihar (Utkal Multi...)',
  onBack,
  onShareTrip,
  onScheduleTrip,
  onStartTracking,
}) => {
  const cleanFrom = originName ? originName.split(',')[0].trim() : 'Jayadev Vihar';
  const cleanTo = destinationName ? destinationName.split(',')[0].trim() : 'Near Niladri Vihar';

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 pb-24 overflow-y-auto">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-glass p-4 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-20 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className="p-2 rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onScheduleTrip}
              className="p-2 glass-panel rounded-full text-slate-600 dark:text-slate-300 hover:text-blue-600 transition"
              title="Schedule Ride"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            </button>
            <button
              onClick={onShareTrip}
              className="px-3 py-1.5 glass-panel rounded-full text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 hover:text-blue-600 transition active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">share</span>
              <span>Share</span>
            </button>
          </div>
        </div>

        <div>
          <h2 className="font-extrabold text-lg text-slate-900 dark:text-white">Selected Ride Details</h2>
          <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">
            Ama Bus AC Electric Express (Route 10)
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-extrabold mt-3">
          <span className="material-symbols-outlined text-[14px]">bolt</span>
          <span>Fastest Direct AC Corridor</span>
        </div>

        <div className="flex justify-between items-end mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-extrabold text-base">
            <span className="material-symbols-outlined text-slate-400 text-[18px]">schedule</span>
            <span>12 min <span className="text-xs font-normal text-slate-500">(3.5 km)</span></span>
          </div>

          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span>Direct Ride</span>
            </div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
              ₹15
            </div>
          </div>
        </div>
      </div>

      {/* Timeline / Route Stops */}
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Route Stops & Real-Time Schedule
          </h3>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Live GPS Verified</span>
        </div>

        <div className="relative pl-3 space-y-6">
          <div className="timeline-line"></div>
          {/* Stop 1: Origin */}
          <div className="flex gap-3.5 relative timeline-node">
            <div className="w-8 h-8 rounded-full border-2 border-blue-600 bg-white dark:bg-slate-900 flex items-center justify-center flex-shrink-0 z-10 shadow-sm">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            </div>
            <div className="flex-1 bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="flex justify-between items-start">
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                  Board at {cleanFrom}
                </h4>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                  02:55 pm
                </span>
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-xs bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="material-symbols-outlined text-blue-600 text-[16px]">directions_walk</span>
                <span>Walk 2 min (150 m) to Transit Bay</span>
              </div>
            </div>
          </div>

          {/* Stop 2: Transit In-Motion */}
          <div className="flex gap-3.5 relative timeline-node">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 z-10 shadow-md shadow-blue-600/30">
              <span className="material-symbols-outlined text-[16px]">directions_bus</span>
            </div>
            <div className="flex-1 bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                    Ama Bus Route 10 / 24
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {cleanFrom} ➔ {cleanTo}
                  </p>
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                  02:57 pm
                </span>
              </div>
              <div className="mt-2.5 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">11 min • 3 stops</span>
                <span className="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Live: On Time</span>
                </span>
              </div>
            </div>
          </div>

          {/* Stop 3: Destination Alight */}
          <div className="flex gap-3.5 relative timeline-node">
            <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center flex-shrink-0 z-10 shadow-md shadow-rose-600/30">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
            </div>
            <div className="flex-1 bg-white dark:bg-slate-800/90 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="flex justify-between items-start">
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                  Alight at {cleanTo}
                </h4>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                  03:07 pm
                </span>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-2">
                ✓ Destination reached • Total Stage Fare ₹15
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Floating CTA Button */}
      <div className="p-4 pt-2">
        <button
          onClick={onStartTracking}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 rounded-2xl font-extrabold text-sm shadow-xl shadow-blue-600/30 flex justify-center items-center gap-2 active:scale-[0.98] transition"
        >
          <span className="material-symbols-outlined text-[20px]">navigation</span>
          <span>Start Live GPS Navigation</span>
        </button>
      </div>
    </div>
  );
};
