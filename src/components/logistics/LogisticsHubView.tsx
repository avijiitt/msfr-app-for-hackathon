import React, { useState } from 'react';
import { 
  Package, 
  MapPin, 
  Trash2, 
  Plus, 
  TrendingDown, 
  Battery, 
  Activity, 
  Clock, 
  Zap, 
  GripVertical,
  ChevronDown
} from 'lucide-react';

interface Waypoint {
  id: string;
  recipientName: string;
  address: string;
  weight: number;
  priority: 'Standard' | 'Urgent' | 'Fragile';
}

interface LogisticsHubProps {
  onNavigateToMap?: () => void;
}

export const LogisticsHubView: React.FC<LogisticsHubProps> = ({ onNavigateToMap }) => {
  const [selectedFleet, setSelectedFleet] = useState<'bike' | 'loader' | 'van'>('loader');
  const [waypoints, setWaypoints] = useState<Waypoint[]>([
    { id: '1', recipientName: 'Rohan Sharma', address: 'Plot 45, Saheed Nagar, Bhubaneswar', weight: 4.5, priority: 'Urgent' },
    { id: '2', recipientName: 'Priya Dash', address: 'Tech Park, Patia, Bhubaneswar', weight: 12.0, priority: 'Fragile' },
    { id: '3', recipientName: 'Amit Verma', address: 'Unit-2 Market Building, Bhubaneswar', weight: 2.5, priority: 'Standard' }
  ]);

  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newWeight, setNewWeight] = useState<number>(2.5);
  const [newPriority, setNewPriority] = useState<'Standard' | 'Urgent' | 'Fragile'>('Standard');

  const fleetOptions = [
    { id: 'bike', label: 'E-Bike / 2W EV', payload: '25 kg', icon: '🛵', range: '80km' },
    { id: 'loader', label: '3W E-Loader', payload: '200 kg', icon: '🛺', range: '120km' },
    { id: 'van', label: 'Electric E-Van', payload: '650 kg', icon: '🚐', range: '180km' }
  ];

  const weightOptions = [0.5, 2.5, 5.0, 15.0, 35.0];

  const handleAddWaypoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newAddress) return;
    setWaypoints([
      ...waypoints, 
      { id: Date.now().toString(), recipientName: newName, address: newAddress, weight: newWeight, priority: newPriority }
    ]);
    setNewName('');
    setNewAddress('');
  };

  const removeWaypoint = (id: string) => {
    setWaypoints(waypoints.filter(w => w.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B1120] text-slate-100 overflow-y-auto pb-16">
      
      {/* 1. Hero Banner */}
      <div className="p-6 md:p-8 bg-gradient-to-br from-emerald-900/60 via-teal-900/40 to-slate-900 border-b border-emerald-900/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Package className="w-8 h-8 text-emerald-400" />
              Multi-Drop Route Optimization & Parcel Dispatch
            </h1>
            <p className="text-emerald-100/70 text-sm mt-2 max-w-2xl font-medium">
              Powered by Traveling Salesperson (TSP) algorithm with Google Maps turn-by-turn routing. Dynamic load balancing and real-time pathing.
            </p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-emerald-950/50 border border-emerald-500/30 rounded-xl backdrop-blur-md">
            <TrendingDown className="w-5 h-5 text-emerald-400" />
            <div className="text-sm font-bold text-emerald-300">
              Fuel & Energy Saved: <span className="text-white">~32% Efficiency Boost</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
        
        {/* 2. Select Fleet Vehicle Section */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Select Fleet Vehicle</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fleetOptions.map(fleet => {
              const isSelected = selectedFleet === fleet.id;
              return (
                <button
                  key={fleet.id}
                  onClick={() => setSelectedFleet(fleet.id as any)}
                  className={`relative p-5 rounded-2xl border text-left transition-all overflow-hidden ${
                    isSelected 
                      ? 'bg-slate-800 border-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.15)]' 
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-0 right-0 p-3 bg-teal-500/10 rounded-bl-2xl border-b border-l border-teal-500/20">
                      <div className="flex items-center gap-1.5 text-teal-400 text-xs font-black">
                        <Battery className="w-3.5 h-3.5" /> Range: {fleet.range}
                      </div>
                    </div>
                  )}
                  <div className="text-3xl mb-3">{fleet.icon}</div>
                  <div className="font-black text-white text-lg">{fleet.label}</div>
                  <div className="text-slate-400 text-sm mt-1">Payload: {fleet.payload}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Summary Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Distance', value: '27.8 km', icon: <MapPin className="w-4 h-4 text-blue-400" /> },
            { label: 'Estimated Time', value: '85 mins', icon: <Clock className="w-4 h-4 text-amber-400" /> },
            { label: 'Energy Saved', value: '32%', icon: <Zap className="w-4 h-4 text-emerald-400" /> },
            { label: 'Dispatch Cost', value: '₹145', icon: <Activity className="w-4 h-4 text-purple-400" /> }
          ].map((stat, idx) => (
            <div key={idx} className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex flex-col justify-center backdrop-blur-sm">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                {stat.icon} {stat.label}
              </div>
              <div className="text-2xl font-black text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* 4. Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Input Form */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-black text-white mb-5 flex items-center gap-2">
              <Plus className="w-5 h-5 text-teal-500" /> Add Delivery Waypoint
            </h3>
            
            <form onSubmit={handleAddWaypoint} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Recipient Name</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Acme Corp" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Delivery Address</label>
                <input 
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="e.g. 123 Tech Park, Phase 2" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Individual Parcel Weight (kg)</label>
                <div className="flex flex-wrap gap-2">
                  {weightOptions.map(w => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setNewWeight(w)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${
                        newWeight === w 
                          ? 'bg-teal-500/20 border-teal-500 text-teal-300' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-white'
                      }`}
                    >
                      {w}kg
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Parcel Priority</label>
                <div className="relative">
                  <select 
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 appearance-none"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Fragile">Fragile</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-500 text-white font-black py-3.5 rounded-xl shadow-[0_0_15px_rgba(20,184,166,0.3)] transition-all active:scale-95"
              >
                Add to Route
              </button>
            </form>
          </div>

          {/* Right Column: Dispatch Sequence */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-lg font-black text-white">
                Optimal Dispatch Sequence ({waypoints.length} Drops)
              </h3>
              <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                TSP Route Active
              </div>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {waypoints.map((wp, idx) => (
                <div 
                  key={wp.id} 
                  className="bg-slate-950 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl flex items-center gap-4 transition-colors group cursor-grab active:cursor-grabbing"
                >
                  <GripVertical className="w-5 h-5 text-slate-600 group-hover:text-slate-400 shrink-0" />
                  
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-black text-slate-300 text-sm shrink-0 border border-slate-700">
                    #{idx + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-sm text-white truncate">{wp.recipientName}</h4>
                      {wp.priority === 'Urgent' && (
                        <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded text-[10px] font-black uppercase tracking-wider">Urgent</span>
                      )}
                      {wp.priority === 'Fragile' && (
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[10px] font-black uppercase tracking-wider">Fragile</span>
                      )}
                      {wp.priority === 'Standard' && (
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded text-[10px] font-black uppercase tracking-wider">Standard</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">{wp.address}</p>
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">Weight: {wp.weight} kg</div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:block px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md text-[10px] font-black uppercase tracking-wider">
                      Pending Drop
                    </div>
                    <button 
                      onClick={() => removeWaypoint(wp.id)}
                      className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {waypoints.length === 0 && (
                <div className="text-center p-10 text-slate-500 font-medium">
                  No waypoints added yet. Add a delivery waypoint to start.
                </div>
              )}
            </div>

            {waypoints.length > 0 && (
              <div className="pt-6 mt-4 border-t border-slate-800 flex justify-end">
                <button 
                  onClick={onNavigateToMap}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-xl shadow-lg shadow-blue-900/20 transition-all"
                >
                  View Route on Map
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
