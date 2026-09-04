import React, { useState, useEffect } from 'react';
import { 
  Clock, X, MapPin, ArrowRight, Ticket, CheckCircle2, 
  RotateCcw, Sparkles, Navigation, Calendar, Bus, Zap, 
  Receipt, Trash2, ExternalLink
} from 'lucide-react';
import { tripService, TripRecord } from '../../services/tripService';
import { TranslationDictionary } from '../../types/i18n';

interface TripsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTripRoute?: (origin: string, dest: string) => void;
  onOpenDynamicTicket?: () => void;
  t?: TranslationDictionary;
}

export const TripsHistoryModal: React.FC<TripsHistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectTripRoute,
  onOpenDynamicTicket,
  t,
}) => {
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TripRecord | null>(null);

  useEffect(() => {
    if (isOpen) {
      const localTrips = tripService.getTrips();
      setTrips(localTrips);
      tripService.fetchUserTrips().then((fetched) => {
        if (fetched && fetched.length > 0) {
          setTrips(fetched);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your local trips history?')) {
      tripService.clearTrips();
      setTrips([]);
    }
  };

  const handleRebook = (trip: TripRecord) => {
    if (onSelectTripRoute) {
      onSelectTripRoute(trip.origin, trip.destination);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span>Trip History & Activity</span>
                <span className="text-xs bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">
                  {trips.length} Rides
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verified travel receipts, live tickets & route carbon metrics
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

        {/* Digital Ticket Modal Preview (if clicked) */}
        {selectedTicket && (
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-xl space-y-3 relative overflow-hidden animate-in fade-in">
            <div className="flex items-center justify-between border-b border-white/20 pb-2">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5" />
                <span className="font-extrabold text-sm uppercase tracking-wider">TransitPay Digital E-Ticket</span>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="text-xs bg-white/20 hover:bg-white/30 rounded-lg px-2 py-1 font-bold"
              >
                ✕ Close Ticket
              </button>
            </div>

            <div className="flex justify-between items-center text-xs">
              <div>
                <span className="text-white/70 block text-[10px]">ROUTE NAME</span>
                <span className="font-bold text-sm">{selectedTicket.route_name || 'Ama Bus AC Express'}</span>
              </div>
              <div className="text-right">
                <span className="text-white/70 block text-[10px]">TICKET REF</span>
                <span className="font-mono font-bold text-sm">{selectedTicket.booking_reference || 'MSFR-TKT-9941'}</span>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-3 flex items-center justify-between text-xs backdrop-blur-xs">
              <div className="truncate max-w-[180px]">
                <span className="text-[10px] text-white/70 block">FROM</span>
                <span className="font-bold truncate block">{selectedTicket.origin}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-white/80 flex-shrink-0" />
              <div className="truncate max-w-[180px] text-right">
                <span className="text-[10px] text-white/70 block">TO</span>
                <span className="font-bold truncate block">{selectedTicket.destination}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-1 text-xs border-t border-white/20">
              <div>
                <span className="text-[10px] text-white/70">FARE PAID: </span>
                <span className="font-black text-base">₹{selectedTicket.fare_amount}</span>
              </div>
              <div className="flex items-center gap-2">
                {onOpenDynamicTicket && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenDynamicTicket();
                    }}
                    className="px-2.5 py-1 bg-white text-blue-700 font-bold rounded-lg text-xs shadow-sm hover:bg-blue-50 transition"
                  >
                    View Dynamic QR Pass 🎟️
                  </button>
                )}
                <div className="flex items-center gap-1 text-emerald-200 font-bold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trip Cards List */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {trips.length === 0 ? (
            <div className="text-center py-10 space-y-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center mx-auto">
                <Navigation className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No Trips Recorded Yet</p>
                <p className="text-xs text-slate-400">Plan a route or book a transit pass to start building your travel history!</p>
              </div>
            </div>
          ) : (
            trips.map((trip) => (
              <div
                key={trip.id}
                className="bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition shadow-xs"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs">
                      {trip.mode === 'auto' ? <Zap className="w-3.5 h-3.5" /> : <Bus className="w-3.5 h-3.5" />}
                    </span>
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      {trip.route_name || 'Ama Bus Transit Route'}
                    </h4>
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                      Completed
                    </span>
                  </div>

                  {/* Route Journey */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold truncate">
                    <span className="truncate">{trip.origin}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{trip.destination}</span>
                  </div>

                  {/* Trip Stats */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                    <span>⏱️ {trip.duration_mins} mins</span>
                    <span>📍 {trip.distance_km} km</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">🌱 {trip.co2_saved_kg || 1.2}kg CO₂ saved</span>
                    <span className="font-mono text-[10px] opacity-75">
                      {new Date(trip.created_at).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Right Side: Fare & Action Buttons */}
                <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 self-stretch sm:self-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-slate-700">
                  <div className="text-left sm:text-right">
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      ₹{trip.fare_amount}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedTicket(trip)}
                      className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                      title="View E-Ticket Receipt"
                    >
                      <Receipt className="w-3.5 h-3.5 text-blue-600" />
                      <span>Ticket</span>
                    </button>

                    <button
                      onClick={() => handleRebook(trip)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm shadow-blue-600/30"
                      title="Re-book this Route"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Re-Book</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          {trips.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="ml-auto py-2 px-6 rounded-xl bg-slate-900 dark:bg-slate-700 hover:opacity-90 text-white font-bold text-xs transition"
          >
            Close History
          </button>
        </div>
      </div>
    </div>
  );
};
