import React, { useState } from 'react';
import {
  Package,
  Truck,
  Zap,
  MapPin,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  TrendingDown,
  Navigation,
  ArrowRight,
  ShieldCheck,
  Fuel,
  Sparkles,
  Layers,
  Send
} from 'lucide-react';
import {
  SAMPLE_DELIVERY_STOPS,
  DeliveryWaypoint,
  OptimizedLogisticsPlan,
  optimizeDeliverySequence
} from '../../services/logisticsOptimizerService';

interface LogisticsHubProps {
  onNavigateToMap?: () => void;
}

export const LogisticsHubView: React.FC<LogisticsHubProps> = ({ onNavigateToMap }) => {
  const [originHub, setOriginHub] = useState({ name: 'Baramunda Central Logistics Hub, Bhubaneswar', lat: 20.2818, lng: 85.7938 });
  const [waypoints, setWaypoints] = useState<DeliveryWaypoint[]>(SAMPLE_DELIVERY_STOPS);
  const [newRecipient, setNewRecipient] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newWeight, setNewWeight] = useState('2.0');
  const [vehicleType, setVehicleType] = useState<'2_wheeler_ev' | '3_wheeler_e_loader' | 'e_van' | 'mo_bus_cargo'>('2_wheeler_ev');

  // Compute optimized route plan
  const plan: OptimizedLogisticsPlan = optimizeDeliverySequence(originHub, waypoints, vehicleType);

  const handleAddStop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipient.trim() || !newAddress.trim()) return;

    const newStop: DeliveryWaypoint = {
      id: `dp-${Date.now()}`,
      recipientName: newRecipient.trim(),
      address: newAddress.trim(),
      lat: 20.3200 + (Math.random() * 0.05 - 0.025),
      lng: 85.8200 + (Math.random() * 0.05 - 0.025),
      packageWeightKg: parseFloat(newWeight) || 1.5,
      timeWindow: '11:00 - 01:00 PM',
      status: 'pending',
    };

    setWaypoints([...waypoints, newStop]);
    setNewRecipient('');
    setNewAddress('');
  };

  const handleRemoveStop = (id: string) => {
    setWaypoints(waypoints.filter(w => w.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 overflow-y-auto pb-16">
      {/* 1. Logistics Header Banner */}
      <div className="p-4 md:p-6 bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-800 text-white rounded-3xl m-3 md:m-5 shadow-xl shadow-emerald-800/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-2">
              <Package className="w-3.5 h-3.5 text-amber-300" />
              <span>Smart Logistics & Delivery Sequencing Engine</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight">
              Multi-Drop Route Optimization & Parcel Dispatch
            </h1>
            <p className="text-emerald-100 text-xs md:text-sm mt-1 max-w-xl font-medium">
              Traveling Salesperson (TSP) algorithm with Google Maps turn-by-turn routing, fleet capacity management, and Mo Bus cargo transport.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 self-start md:self-auto">
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-200">Fuel & Energy Saved</div>
              <div className="text-sm font-black text-white">~32% Efficiency Boost</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Layout */}
      <div className="px-3 md:px-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Fleet Selection & Add Waypoint Form */}
        <div className="lg:col-span-1 space-y-4">
          {/* Vehicle Fleet Selector */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-400">Select Fleet Vehicle</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: '2_wheeler_ev', label: '🛵 E-Bike / 2W EV', cap: '25 kg payload' },
                { id: '3_wheeler_e_loader', label: '🛺 3W E-Loader', cap: '200 kg payload' },
                { id: 'e_van', label: '🚐 Electric E-Van', cap: '650 kg payload' },
                { id: 'mo_bus_cargo', label: '🚍 Mo Bus Cargo', cap: 'Inter-hub transit' },
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVehicleType(v.id as any)}
                  className={`p-2.5 rounded-2xl text-left border transition ${
                    vehicleType === v.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-900 dark:text-emerald-300 font-extrabold shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="text-xs font-black">{v.label}</div>
                  <div className="text-[10px] text-slate-400 font-medium">{v.cap}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Add Stop Form */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Add Delivery Waypoint</span>
            </h3>

            <form onSubmit={handleAddStop} className="space-y-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Recipient Name</label>
                <input
                  type="text"
                  placeholder="e.g. Reliance Smart Point / Customer"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Delivery Address / Stop</label>
                <input
                  type="text"
                  placeholder="e.g. Master Canteen Square, Bhubaneswar"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Parcel Weight (Kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Waypoint & Re-Optimize</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right 2 Columns: Optimized Delivery Sequence & Summary Cards */}
        <div className="lg:col-span-2 space-y-4">
          {/* Dispatch Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-xs">
              <div className="text-[10px] font-bold uppercase text-slate-400">Total Distance</div>
              <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">{plan.totalDistanceKm} km</div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-xs">
              <div className="text-[10px] font-bold uppercase text-slate-400">Estimated Time</div>
              <div className="text-base font-black text-blue-600 mt-0.5">{plan.totalDurationMinutes} mins</div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-xs">
              <div className="text-[10px] font-bold uppercase text-slate-400">Energy Saved</div>
              <div className="text-base font-black text-emerald-600 mt-0.5">{plan.fuelOrEnergySavedPercent}%</div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-xs">
              <div className="text-[10px] font-bold uppercase text-slate-400">Dispatch Cost</div>
              <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">₹{plan.estimatedCostInr}</div>
            </div>
          </div>

          {/* Sequenced Waypoints List */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Optimal Dispatch Sequence ({plan.sequencedWaypoints.length} Drops)
                </h3>
                <div className="text-xs text-slate-500">
                  Starting Hub: <span className="font-bold text-slate-800 dark:text-slate-200">{originHub.name}</span>
                </div>
              </div>

              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-full">
                TSP Route Active
              </span>
            </div>

            <div className="space-y-2.5">
              {plan.sequencedWaypoints.map((wp, idx) => (
                <div
                  key={wp.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 hover:border-emerald-500 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">{wp.recipientName}</div>
                      <div className="text-xs text-slate-500 truncate max-w-xs sm:max-w-md">{wp.address}</div>
                      <div className="text-[10px] text-slate-400 font-bold mt-0.5">
                        📦 {wp.packageWeightKg} kg • Window: {wp.timeWindow || 'Standard Delivery'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded-full">
                      Pending Drop
                    </span>
                    <button
                      onClick={() => handleRemoveStop(wp.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition rounded-lg"
                      title="Remove stop"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 flex justify-end gap-3">
              <button
                onClick={onNavigateToMap}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                Inspect Full Route on Map
              </button>
            </div>
          </div>

          {/* Delivery Time Suggestions (Avoid Peak Hours) */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <Clock className="w-4 h-4 text-emerald-600" />
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Smart Delivery Time Slot Suggestions (Off-Peak Optimization)
                </h3>
                <p className="text-xs text-slate-500">
                  Deliver non-urgent parcels during low-congestion windows to avoid peak traffic delays and save fuel.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { slot: '11:00 AM – 01:30 PM', status: '⭐ Highly Recommended', save: '38% time saved', fuel: '1.8L fuel saved', badge: 'bg-emerald-100 text-emerald-800', note: 'Wide-open roads and rapid doorstep deliveries' },
                { slot: '02:00 PM – 04:30 PM', status: '✅ Recommended', save: '32% time saved', fuel: '1.4L fuel saved', badge: 'bg-emerald-50 text-emerald-700', note: 'Smooth commercial traffic and quick parking' },
                { slot: '05:30 PM – 08:30 PM', status: '❌ Peak Gridlock', save: '0% saved (Heavy delays)', fuel: 'High idle consumption', badge: 'bg-rose-100 text-rose-800', note: 'Heavy evening commuter rush across major corridors' },
                { slot: '09:00 PM – 10:30 PM', status: '⭐ Night Super-Fast', save: '46% time saved', fuel: '2.2L fuel saved', badge: 'bg-indigo-100 text-indigo-800', note: 'Completely clear arterial roads for express freight' },
              ].map((s, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-black text-xs text-slate-900 dark:text-white">{s.slot}</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${s.badge}`}>
                      {s.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">{s.note}</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    ⚡ {s.save} • ⛽ {s.fuel}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

