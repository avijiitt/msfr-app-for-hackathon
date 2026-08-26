import React, { useState } from 'react';
import { MapPin, PhoneCall, Star, ShoppingBag, Coffee, Hospital, Shield, Zap, Search, Navigation, Clock } from 'lucide-react';
import { MOCK_AMENITIES } from '../../data/amenities';
import { Amenity } from '../../types/transit';
import { TranslationDictionary } from '../../types/i18n';

interface NearbyAmenitiesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  t: TranslationDictionary;
}

export const NearbyAmenitiesDrawer: React.FC<NearbyAmenitiesDrawerProps> = ({
  isOpen,
  onClose,
  t,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Places', icon: '📍' },
    { id: 'supermarket', label: '🛒 Grocery & Stores', icon: '🛒' },
    { id: 'pharmacy', label: '💊 24x7 Pharmacy', icon: '💊' },
    { id: 'hospital', label: '🏥 Hospitals & Blood Bank', icon: '🏥' },
    { id: 'cafe', label: '☕ Cafes & Dining', icon: '☕' },
    { id: 'hotel', label: '🏨 Hotels & Transit Stay', icon: '🏨' },
    { id: 'ev_charging', label: '⚡ EV Chargers', icon: '⚡' },
    { id: 'police', label: '👮 Police Help Kiosk', icon: '👮' },
  ];

  const filteredAmenities = MOCK_AMENITIES.filter((a) => {
    const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory;
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="max-w-2xl w-full glass-panel-glow rounded-3xl p-5 sm:p-6 text-white space-y-4 border border-purple-500/30 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {t.nearbyStoresHotels}
              </h2>
              <p className="text-xs text-slate-400">
                Google Maps-Style Real-Time Store & POI Discovery
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

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition border flex items-center gap-1 ${
                selectedCategory === cat.id
                  ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* List of Google Maps Style Place Cards */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {filteredAmenities.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              No matching stores or places found. Try another search.
            </div>
          ) : (
            filteredAmenities.map((am) => (
              <div
                key={am.id}
                className="bg-slate-900/90 hover:bg-slate-900 border border-white/10 hover:border-purple-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition shadow-md"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white">{am.name}</h3>
                    {am.priceLevel && (
                      <span className="text-[10px] text-slate-400 font-mono">{am.priceLevel}</span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400">{am.address}</p>

                  <div className="flex flex-wrap items-center gap-2.5 text-[11px] pt-1">
                    {/* Open/Closed Badge */}
                    <span className={`px-2 py-0.5 rounded font-semibold ${
                      am.isOpenNow ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      ● {am.isOpenNow ? 'Open Now' : 'Closed'} {am.openHours ? `(${am.openHours})` : ''}
                    </span>

                    {/* Ratings */}
                    {am.rating && (
                      <span className="text-amber-400 flex items-center gap-1 font-semibold">
                        <Star className="w-3 h-3 fill-current" /> {am.rating} ({am.userReviewsCount})
                      </span>
                    )}

                    {/* Distance from Station */}
                    <span className="text-cyan-400 font-mono">
                      📍 {am.distanceMeters}m away
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                  {am.phone && (
                    <a
                      href={`tel:${am.phone}`}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-white/10 flex items-center gap-1.5 transition text-xs font-semibold"
                      title="Call Store"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Call</span>
                    </a>
                  )}

                  <button
                    onClick={() => {
                      alert(`📍 Navigation path to ${am.name} loaded on map.`);
                      onClose();
                    }}
                    className="p-2.5 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-1.5 transition"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Route</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
        >
          Close Store Explorer
        </button>
      </div>
    </div>
  );
};
