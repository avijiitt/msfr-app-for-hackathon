import React, { useState } from 'react';
import { Calendar, Clock, Bell, Plus, CheckCircle2, Navigation, Trash2 } from 'lucide-react';
import { ScheduledRide, Station } from '../../types/transit';
import { BHUBANESWAR_STATIONS } from '../../data/cities/bhubaneswar';
import { supabaseService } from '../../services/supabaseClient';
import { TranslationDictionary } from '../../types/i18n';

interface ScheduleRideModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: TranslationDictionary;
}

export const ScheduleRideModal: React.FC<ScheduleRideModalProps> = ({
  isOpen,
  onClose,
  t,
}) => {
  const [scheduledRides, setScheduledRides] = useState<ScheduledRide[]>(supabaseService.getScheduledRides());
  const [originId, setOriginId] = useState(BHUBANESWAR_STATIONS[0].id);
  const [destId, setDestId] = useState(BHUBANESWAR_STATIONS[3].id);
  const [date, setDate] = useState('2026-08-26');
  const [time, setTime] = useState('09:00');
  const [isRecurring, setIsRecurring] = useState(true);
  const [scheduledSuccess, setScheduledSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCreateSchedule = () => {
    const originSt = BHUBANESWAR_STATIONS.find(s => s.id === originId) || BHUBANESWAR_STATIONS[0];
    const destSt = BHUBANESWAR_STATIONS.find(s => s.id === destId) || BHUBANESWAR_STATIONS[3];

    const newRide: ScheduledRide = {
      id: 'SCH-' + Math.floor(1000 + Math.random() * 9000),
      originStationId: originSt.id,
      originStationName: originSt.name,
      destStationId: destSt.id,
      destStationName: destSt.name,
      date,
      time,
      isRecurring,
      recurringDays: isRecurring ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] : undefined,
      routeTitle: `Mo Bus AC Route 10 (${originSt.name} ➔ ${destSt.name})`,
      estimatedFare: 20,
      notificationMinutesBefore: 15,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    supabaseService.saveScheduledRide(newRide);
    setScheduledRides(supabaseService.getScheduledRides());
    setScheduledSuccess(true);
    setTimeout(() => {
      setScheduledSuccess(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="max-w-lg w-full glass-panel-glow rounded-3xl p-5 sm:p-6 text-white space-y-5 border border-cyan-500/30 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {t.navSchedule}
              </h2>
              <p className="text-xs text-slate-400">
                Automated Commute Reminders & Reserved Sync Trips
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm"
          >
            ✕
          </button>
        </div>

        {/* Success Notice */}
        {scheduledSuccess && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-2xl p-3.5 text-xs text-emerald-300 font-bold flex items-center gap-2 animate-in zoom-in-95">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Ride scheduled successfully! Automated departure alert configured.</span>
          </div>
        )}

        {/* Schedule Form */}
        <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-4 space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Pick Origin Station</label>
              <select
                value={originId}
                onChange={(e) => setOriginId(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-white text-xs focus:outline-none"
              >
                {BHUBANESWAR_STATIONS.map((st) => (
                  <option key={st.id} value={st.id}>{st.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Destination Station</label>
              <select
                value={destId}
                onChange={(e) => setDestId(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-white text-xs focus:outline-none"
              >
                {BHUBANESWAR_STATIONS.map((st) => (
                  <option key={st.id} value={st.id}>{st.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-white text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Departure Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-white text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded bg-slate-950 border-white/20 text-cyan-500 focus:ring-0"
              />
              <span className="text-slate-300">Repeat every weekday (Mon-Fri)</span>
            </label>
            <span className="text-cyan-400 font-mono">Fare: ₹20</span>
          </div>

          <button
            onClick={handleCreateSchedule}
            className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Confirm & Schedule Daily Ride</span>
          </button>
        </div>

        {/* Existing Active Schedules */}
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Active Commute Schedules ({scheduledRides.length})
          </span>
          {scheduledRides.map((ride) => (
            <div key={ride.id} className="bg-slate-900/80 border border-white/10 p-3 rounded-xl flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-white">{ride.originStationName} ➔ {ride.destStationName}</div>
                <div className="text-[11px] text-cyan-300 font-mono">
                  {ride.time} • {ride.isRecurring ? 'Weekdays (Mon-Fri)' : ride.date}
                </div>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                ● Alert: 15m Prior
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
        >
          Close
        </button>
      </div>
    </div>
  );
};
