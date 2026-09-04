import React, { useState } from 'react';
import { Share2, Bus, Train, Footprints, Clock, Navigation, CheckCircle, ShieldCheck, Ticket, Plus, Trash2, Calendar, Calculator, Sparkles } from 'lucide-react';
import { getNearbyLocationsAlongCorridor, findMatchingMoBusRoutes } from '../../data/cities/bhubaneswar';
import { TranslationDictionary } from '../../types/i18n';
import { PaymentGatewayModal } from '../payment/PaymentGatewayModal';
import { isBhubaneswarRegion, calculateAmaBusAcFare, calculateAmaBusNonAcFare } from '../../services/fareMatrixService';

interface JourneyDetailPanelProps {
  originName?: string;
  destinationName?: string;
  originCoords?: [number, number] | null;
  destCoords?: [number, number] | null;
  selectedRouteId?: string;
  onStartNavigation: () => void;
  onShareTrip: () => void;
  onBookPass: () => void;
  onOpenTripAssurance: () => void;
  onOpenScheduleRide: () => void;
  onOpenFareDetails: () => void;
  t?: TranslationDictionary;
}

export const JourneyDetailPanel: React.FC<JourneyDetailPanelProps> = ({
  originName = 'Jayadev Vihar',
  destinationName = 'KIIT Square, Patia',
  originCoords,
  destCoords,
  selectedRouteId = 'route-rec',
  onStartNavigation,
  onShareTrip,
  onBookPass,
  onOpenTripAssurance,
  onOpenScheduleRide,
  onOpenFareDetails,
  t,
}) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [viaStops, setViaStops] = useState<string[]>([]);
  const [newStopInput, setNewStopInput] = useState('');
  const [showAddStop, setShowAddStop] = useState(false);
  const [isTicketPaymentOpen, setIsTicketPaymentOpen] = useState(false);

  // Dynamic matched Mo Bus routes
  const matchedBus = React.useMemo(() => {
    return findMatchingMoBusRoutes(originName, destinationName);
  }, [originName, destinationName]);

  const primaryBus = matchedBus.primarySuggestion || { route: '10', path: 'Bhubaneswar Airport – MANU University' };
  const altBus = matchedBus.directRoutes[1] || matchedBus.connectedRoutes[0] || { route: '11', path: 'Bhubaneswar Railway Station – Nandankanan' };

  // Dynamic road/transit distance estimation
  const distanceKm = React.useMemo(() => {
    if (originCoords && destCoords) {
      const latDiff = originCoords[0] - destCoords[0];
      const lngDiff = (originCoords[1] - destCoords[1]) * Math.cos((originCoords[0] * Math.PI) / 180);
      const d = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111.32;
      return Math.max(1.5, Math.round(d * 10) / 10);
    }
    return 8.5;
  }, [originCoords, destCoords]);

  // Clean names
  const cleanFrom = originName.split(',')[0] || 'Origin';
  const cleanTo = destinationName.split(',')[0] || 'Destination';

  const isBbsr = isBhubaneswarRegion(originName, destinationName, originCoords, destCoords);
  const acFare = isBbsr ? calculateAmaBusAcFare(distanceKm) : Math.round(distanceKm * 2.2);
  const nonAcFare = isBbsr ? calculateAmaBusNonAcFare(distanceKm) : Math.round(distanceKm * 1.2);

  // Dynamic calculated metrics based on selected route mode
  const isCheap = selectedRouteId === 'route-cheap';
  const isEco = selectedRouteId === 'route-eco';

  const totalDurationMins = !isBbsr
    ? (isCheap ? Math.max(110, Math.round(distanceKm * 1.3) + 30) : isEco ? Math.min(180, Math.round(distanceKm * 0.15) + 90) : Math.max(90, Math.round(distanceKm * 1.1) + 20))
    : (isEco
      ? Math.max(14, Math.round(distanceKm * 2.1))
      : isCheap
      ? Math.max(18, Math.round(distanceKm * 3.2))
      : Math.max(12, Math.round(distanceKm * 2.4)));

  const totalFareInr = !isBbsr
    ? (isCheap ? Math.max(150, Math.round(distanceKm * 1.8)) : isEco ? Math.max(2800, Math.round(distanceKm * 4.5)) : Math.max(120, Math.round(distanceKm * 0.95)))
    : (isEco ? nonAcFare + 10 : isCheap ? nonAcFare : acFare);

  const serviceName = !isBbsr
    ? (isCheap ? 'State Transport Coach (OSRTC / Volvo)' : isEco ? 'Direct Domestic Air Flight' : 'Indian Railways Express (Superfast / Vande Bharat)')
    : (isEco
      ? 'Ama E-Ride Electric Auto + Feeder'
      : isCheap
      ? `Ama Bus Ordinary Non-AC (Route ${altBus.route})`
      : `Ama Bus AC Electric Express (Route ${primaryBus.route})`);

  const serviceBadge = !isBbsr
    ? (isCheap ? '🚌 Highway Intercity Express' : isEco ? '✈️ Direct Flight Transit' : '🚆 Indian Railways Superfast')
    : (isEco
      ? '🌿 100% Zero-Emission Feeder'
      : isCheap
      ? '💰 Lowest Public Bus Fare'
      : '⚡ Fastest Direct AC Corridor');

  const now = new Date();
  const formatTime = (addMins: number) => {
    const d = new Date(now.getTime() + addMins * 60000);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleAddStop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStopInput.trim()) return;
    setViaStops([...viaStops, newStopInput.trim()]);
    setNewStopInput('');
    setShowAddStop(false);
  };

  const handleRemoveStop = (index: number) => {
    const updated = [...viaStops];
    updated.splice(index, 1);
    setViaStops(updated);
  };

  const handleNavClick = () => {
    setIsNavigating(true);
    onStartNavigation();
  };

  return (
    <div className="w-full lg:w-96 flex-shrink-0 dashboard-card rounded-3xl p-5 flex flex-col justify-start gap-4 lg:self-start lg:sticky lg:top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              Selected Ride Details
            </h3>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-bold truncate max-w-[180px]">
              {serviceName}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenScheduleRide}
              className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition"
              title="Schedule Ride for later"
            >
              <Calendar className="w-4 h-4" />
            </button>
            <button
              onClick={onShareTrip}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5 hover:bg-blue-100 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>

        <div className="mb-2.5">
          <span className="text-[10px] font-extrabold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800">
            {serviceBadge}
          </span>
        </div>

        {/* Top Summary Metrics Pill */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 pb-3 border-b border-slate-100 dark:border-slate-800">
          <span className="flex items-center gap-1 font-bold text-slate-900 dark:text-white">
            <Clock className="w-3.5 h-3.5 text-blue-500" /> {totalDurationMins} min ({distanceKm} km)
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
            {isEco ? '⇄ Shared Feeder' : '🟢 Direct Ride'}
          </span>
          <span className="font-extrabold text-blue-600 dark:text-blue-400 text-base">₹{totalFareInr}</span>
        </div>

        {/* Multiple Intermediate Stops Section (Via Stops) */}
        <div className="pt-2 pb-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Route Stops ({2 + viaStops.length})
            </span>
            <button
              onClick={() => setShowAddStop(!showAddStop)}
              className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stop</span>
            </button>
          </div>

          {showAddStop && (
            <div className="space-y-2 mt-2">
              <form onSubmit={handleAddStop} className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Enter intermediate stop..."
                  value={newStopInput}
                  onChange={(e) => setNewStopInput(e.target.value)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none border border-slate-200 dark:border-slate-700"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Add
                </button>
              </form>

              {/* Quick suggestions from nearby corridor */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-500" />
                  <span>Stops on this Route Corridor:</span>
                </span>
                <div className="flex flex-wrap gap-1">
                  {getNearbyLocationsAlongCorridor(
                    originName,
                    destinationName,
                    originCoords ? { lat: originCoords[0], lng: originCoords[1] } : undefined,
                    destCoords ? { lat: destCoords[0], lng: destCoords[1] } : undefined
                  ).slice(0, 5).map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => {
                        const stopName = loc.name.split('/')[0].trim();
                        if (!viaStops.includes(stopName)) {
                          setViaStops([...viaStops, stopName]);
                        }
                        setShowAddStop(false);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold hover:bg-blue-100 transition"
                    >
                      + {loc.name.split('/')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {viaStops.length > 0 && (
            <div className="space-y-1.5 mt-2">
              {viaStops.map((stop, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-xl bg-blue-50/50 dark:bg-blue-900/20 text-xs border border-blue-100 dark:border-blue-800"
                >
                  <span className="font-semibold text-blue-800 dark:text-blue-200">
                    Via Stop {i + 1}: <strong>{stop}</strong>
                  </span>
                  <button
                    onClick={() => handleRemoveStop(i)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step-by-Step Interactive Timeline */}
        <div className="py-3 space-y-4 pr-2">
          {/* Step 1: Your Departure Location */}
          <div className="flex items-start gap-3 relative">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-600 bg-white dark:bg-slate-900 mt-1 flex-shrink-0 z-10 shadow-xs"></div>
            <div className="flex-1 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 dark:text-white">Board at {cleanFrom}</span>
              <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold">{formatTime(0)}</span>
            </div>
          </div>

          {/* Walk / Platform Access */}
          <div className="pl-1.5 ml-1 border-l-2 border-dashed border-slate-300 dark:border-slate-700 py-1 space-y-1">
            <div className="pl-4 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <Footprints className="w-3.5 h-3.5 text-blue-500" />
              <span>Walk 2 min (150 m) to Transit Bay</span>
            </div>
          </div>

          {/* Step 2: Primary Connected Leg */}
          <div className="flex items-start gap-3 relative">
            <div className={`w-6 h-6 rounded-lg ${isEco ? 'bg-pink-500' : isCheap ? 'bg-emerald-500' : 'bg-blue-600'} text-white flex items-center justify-center flex-shrink-0 z-10 shadow-sm font-bold text-xs`}>
              {isEco ? '🛺' : '🚍'}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white">
                  {!isBbsr
                    ? (isCheap ? 'OSRTC Intercity AC Coach' : isEco ? 'Connecting Air Flight Transfer' : 'Indian Railways Express (Superfast / Vande Bharat)')
                    : (isEco ? 'Ama E-Ride Electric Auto' : isCheap ? `Ama Bus Route ${altBus.route} (Non-AC)` : `Ama Bus Route ${primaryBus.route} (AC Electric)`)}
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold">{formatTime(2)}</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {cleanFrom} ➔ {!isBbsr ? cleanTo : (isEco ? 'Ama Transit Interchange' : cleanTo)}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                <span>{Math.round(totalDurationMins * (isEco ? 0.6 : 0.9))} min • {!isBbsr ? 'Direct Corridor' : `${Math.max(3, Math.round(distanceKm * 0.8))} stops`}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                  Live: On Time 🟢
                </span>
              </div>
            </div>
          </div>

          {/* Optional Transfer Leg for Eco Route */}
          {isEco && (
            <>
              <div className="pl-1.5 ml-2.5 border-l-2 border-dashed border-slate-300 dark:border-slate-700 py-1 space-y-1">
                <div className="pl-4 flex items-center gap-2 text-[11px] text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-pink-500" />
                  <span>Doorstep Feeder Connection • 3 min</span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold ml-auto">{formatTime(Math.round(totalDurationMins * 0.6) + 2)}</span>
                </div>
              </div>

              {/* Step 3: Pink Safe Shuttle Leg */}
              <div className="flex items-start gap-3 relative">
                <div className="w-6 h-6 rounded-lg bg-pink-600 text-white flex items-center justify-center flex-shrink-0 z-10 shadow-sm text-xs">
                  ⚡
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {isBbsr ? 'Pink Safe Ama Bus Feeder' : 'Station Connection Feeder'}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold">{formatTime(Math.round(totalDurationMins * 0.6) + 5)}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Interchange ➔ {cleanTo}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <span>{Math.round(totalDurationMins * 0.35)} min • 2 stops</span>
                    <span className="px-2 py-0.5 rounded bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 font-bold text-[10px]">
                      Safe Transit
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 4: Arrival at Destination */}
          <div className="flex items-start gap-3 relative pt-1">
            <div className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center flex-shrink-0 z-10 text-[9px] shadow-sm font-bold">
              📍
            </div>
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                <span>Alight at {cleanTo}</span>
                <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold">{formatTime(totalDurationMins)}</span>
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                Destination reached • Total Fare ₹{totalFareInr}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions: Ticket Booking directly under plan, Navigation & Assurance */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        {/* Prominent Unified Ticket Booking Card right below trip plan */}
        <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-emerald-500/5 border border-emerald-500/30 dark:border-emerald-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Ticket className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-black text-slate-900 dark:text-white">Unified Connected QR Pass</span>
            </div>
            <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">₹{totalFareInr}</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
            Single digital pass valid across all connected Feeder + Ama Bus routes. No cash ticket needed.
          </p>
          <button
            type="button"
            onClick={() => setIsTicketPaymentOpen(true)}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 transition active:scale-98 flex items-center justify-center gap-1.5"
          >
            <Ticket className="w-4 h-4" />
            <span>🎟️ Book Unified Ticket Pass (₹{totalFareInr})</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onStartNavigation}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition active:scale-98"
          >
            <Navigation className="w-4 h-4 fill-white" />
            <span>{t?.startTripSync || 'Track & Sync Trip'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenFareDetails}
            className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
          >
            <Calculator className="w-3.5 h-3.5 text-blue-600" />
            <span>{t?.fareBreakdown || 'Fare Breakdown'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenTripAssurance}
            className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-100 transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Assurance</span>
          </button>
        </div>
      </div>

      {/* Ticket Booking Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={isTicketPaymentOpen}
        onClose={() => setIsTicketPaymentOpen(false)}
        amount={totalFareInr}
        purpose={`Unified Connected QR Pass: ${cleanFrom} ➔ ${cleanTo} (All Feeder + Ama Bus + Interchanges Included)`}
        customerName="Traveller"
        onPaymentSuccess={(result) => {
          setIsTicketPaymentOpen(false);
          alert(`🎉 Unified Connected QR Pass Active!\nReceipt: ${result.receiptNumber}\nValid across all connected rides (Feeder + Ama Bus) with a single QR scan.`);
        }}
      />
    </div>
  );
};
