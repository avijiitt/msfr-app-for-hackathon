import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Bell, Plus, CheckCircle2, Navigation, Trash2, X, MapPin, Search } from 'lucide-react';
import { ScheduledRide } from '../../types/transit';
import { BHUBANESWAR_STATIONS, BHUBANESWAR_LOCALITIES } from '../../data/cities/bhubaneswar';
import { STOP_COORDINATES_MAP } from '../../data/busRoutesData';
import { POPULAR_INDIAN_LOCATIONS } from '../../services/indiaGeocodingService';
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
  const [departureQuery, setDepartureQuery] = useState('Master Canteen Bus Terminal & Railway Hub');
  const [destinationQuery, setDestinationQuery] = useState('Trident Academy of Technology');
  const [isDepFocused, setIsDepFocused] = useState(false);
  const [isDestFocused, setIsDestFocused] = useState(false);
  const [date, setDate] = useState('2026-08-26');
  const [time, setTime] = useState('09:00');
  const [isRecurring, setIsRecurring] = useState(true);
  const [scheduledSuccess, setScheduledSuccess] = useState(false);

  // Compile all available locations across the city & transit network
  const allLocationsList = useMemo(() => {
    const list: string[] = [
      'Trident Academy of Technology',
      'Master Canteen Bus Terminal & Railway Hub',
      'Patia / KIIT University Bus Terminal',
      'Jayadev Vihar Square',
      'Baramunda ISBT Bus Terminal',
      'Infocity IT Hub, Patia',
      'Biju Patnaik International Airport',
      'Silicon University, Chandaka',
      'Vani Vihar Square',
      'Rasulgarh Square',
      'Khandagiri Square',
      'AIIMS Hospital & Trauma Bus Bay',
      'Lingaraj Temple Old Town',
      'Cuttack Badambadi Bus Stand',
      'Damana Square, Patia',
      'Chandrasekharpur Police Station',
      'Kalinga Stadium Gate 2',
      'Mani Tribhuban, Nandankanan Road',
      'Royal Lagoon, Raghunathpur',
      'Nandankanan Zoological Park',
      'ITER College, Jagamara',
      'OUTR / CET Ghatikia',
    ];

    // Add localities
    BHUBANESWAR_LOCALITIES.forEach((loc) => {
      if (!list.includes(loc.name)) list.push(loc.name);
    });

    // Add stations
    BHUBANESWAR_STATIONS.forEach((st) => {
      if (!list.includes(st.name)) list.push(st.name);
    });

    // Add surveyed stop names
    Object.keys(STOP_COORDINATES_MAP).forEach((name) => {
      const formatted = name.charAt(0).toUpperCase() + name.slice(1);
      if (!list.includes(formatted)) list.push(formatted);
    });

    return list;
  }, []);

  const filteredDepLocations = useMemo(() => {
    const q = departureQuery.toLowerCase().trim();
    if (!q) return allLocationsList.slice(0, 7);
    return allLocationsList
      .filter((loc) => loc.toLowerCase().includes(q))
      .slice(0, 7);
  }, [departureQuery, allLocationsList]);

  const filteredDestLocations = useMemo(() => {
    const q = destinationQuery.toLowerCase().trim();
    if (!q) return allLocationsList.slice(0, 7);
    return allLocationsList
      .filter((loc) => loc.toLowerCase().includes(q))
      .slice(0, 7);
  }, [destinationQuery, allLocationsList]);

  if (!isOpen) return null;

  const handleCreateSchedule = async () => {
    const originName = departureQuery.trim() || 'Master Canteen';
    const destName = destinationQuery.trim() || 'Trident Academy of Technology';

    const newRide: ScheduledRide = {
      id: 'SCH-' + Math.floor(1000 + Math.random() * 9000),
      originStationId: 'loc-orig-' + Date.now(),
      originStationName: originName,
      destStationId: 'loc-dest-' + Date.now(),
      destStationName: destName,
      date,
      time,
      isRecurring,
      recurringDays: isRecurring ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] : undefined,
      routeTitle: `Transit Route (${originName} ➔ ${destName})`,
      estimatedFare: 20,
      notificationMinutesBefore: 15,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    supabaseService.saveScheduledRide(newRide);
    setScheduledRides(supabaseService.getScheduledRides());

    // Also record as a scheduled trip in database
    await tripService.recordTrip({
      origin: originName,
      destination: destName,
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
                {t.scheduleTrip || 'Schedule Commute'}
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
            {/* Departure Searchable Input */}
            <div className="relative">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">Departure</label>
              <div className="relative">
                <input
                  type="text"
                  value={departureQuery}
                  onFocus={() => setIsDepFocused(true)}
                  onBlur={() => setTimeout(() => setIsDepFocused(false), 200)}
                  onChange={(e) => setDepartureQuery(e.target.value)}
                  placeholder="Enter any departure location..."
                  className="w-full p-2.5 pl-8 pr-7 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
                />
                <span className="absolute left-2.5 top-3 text-emerald-500 text-[10px]">🟢</span>
                {departureQuery && (
                  <button
                    type="button"
                    onClick={() => setDepartureQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Autocomplete dropdown for departure */}
              {isDepFocused && (
                <div className="absolute left-0 right-0 top-[60px] z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto p-1 space-y-0.5">
                  {filteredDepLocations.map((loc, idx) => (
                    <div
                      key={idx}
                      onMouseDown={() => {
                        setDepartureQuery(loc);
                        setIsDepFocused(false);
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 cursor-pointer flex items-center gap-2 truncate"
                    >
                      <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{loc}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Destination Searchable Input */}
            <div className="relative">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">Destination</label>
              <div className="relative">
                <input
                  type="text"
                  value={destinationQuery}
                  onFocus={() => setIsDestFocused(true)}
                  onBlur={() => setTimeout(() => setIsDestFocused(false), 200)}
                  onChange={(e) => setDestinationQuery(e.target.value)}
                  placeholder="Enter any destination location..."
                  className="w-full p-2.5 pl-8 pr-7 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
                />
                <span className="absolute left-2.5 top-3 text-rose-500 text-[10px]">📍</span>
                {destinationQuery && (
                  <button
                    type="button"
                    onClick={() => setDestinationQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Autocomplete dropdown for destination */}
              {isDestFocused && (
                <div className="absolute left-0 right-0 top-[60px] z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto p-1 space-y-0.5">
                  {filteredDestLocations.map((loc, idx) => (
                    <div
                      key={idx}
                      onMouseDown={() => {
                        setDestinationQuery(loc);
                        setIsDestFocused(false);
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 cursor-pointer flex items-center gap-2 truncate"
                    >
                      <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{loc}</span>
                    </div>
                  ))}
                </div>
              )}
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
