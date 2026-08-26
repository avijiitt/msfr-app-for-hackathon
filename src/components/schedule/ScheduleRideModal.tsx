import React, { useState } from 'react';
import { Calendar, Clock, Bell, Plus, CheckCircle2, Navigation, Trash2, X } from 'lucide-react';
import { ScheduledRide } from '../../types/transit';
import { BHUBANESWAR_STATIONS } from '../../data/cities/bhubaneswar';
import { supabaseService } from '../../services/supabaseClient';
import { tripService } from '../../services/tripService';
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

  const handleCreateSchedule = async () => {
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
      routeTitle: `Transit Route (${originSt.name} ➔ ${destSt.name})`,
      estimatedFare: 20,
      notificationMinutesBefore: 15,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    supabaseService.saveScheduledRide(newRide);
    setScheduledRides(supabaseService.getScheduledRides());

    // Also record as a scheduled trip in database
    await tripService.recordTrip({
      origin: originSt.name,
      destination: destSt.name,
      fareAmount: 20,
      mode: 'bus',
      routeName: `Scheduled Transit (${date} at ${time})`,
      status: 'scheduled',
    });

    setScheduledSuccess(true);
    setTimeout(() => {
      setScheduledSuccess(false);
    }, 2500);
  };

  const handleRemoveSchedule = (id: string) => {
    const updated = scheduledRides.filter(r => r.id !== id);
    setScheduledRides(updated);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 text-slate-900 dark:text-white space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.scheduleTrip || 'Schedule Automated Rides'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pre-book & auto-notify daily commutes & trips
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Create Schedule Form */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 shadow-sm">
          <h3 className="font-bold text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> New Schedule
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">Departure</label>
              <select
                value={originId}
                onChange={(e) => setOriginId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                {BHUBANESWAR_STATIONS.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">Destination</label>
              <select
                value={destId}
                onChange={(e) => setDestId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                {BHUBANESWAR_STATIONS.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded text-blue-600 focus:ring-0 cursor-pointer"
              />
              <span>Daily Mon-Fri Commute</span>
            </label>

            <button
              onClick={handleCreateSchedule}
              className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" />
              Schedule & Save
            </button>
          </div>
        </div>

        {scheduledSuccess && (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Ride scheduled and recorded in database! Push notifications enabled.</span>
          </div>
        )}

        {/* Existing Schedules */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Schedules</h4>
          {scheduledRides.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No scheduled rides yet.</p>
          ) : (
            scheduledRides.map((ride) => (
              <div
                key={ride.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs shadow-sm"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 dark:text-white">
                    {ride.originStationName} ➔ {ride.destStationName}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-2">
                    <Clock className="w-3 h-3 text-blue-600" />
                    <span>{ride.time} {ride.isRecurring ? '(Mon-Fri Daily)' : ride.date}</span>
                    <span className="font-mono text-emerald-600">₹{ride.estimatedFare}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveSchedule(ride.id)}
                  className="text-rose-500 hover:text-rose-700 p-1.5"
                  title="Delete schedule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};
