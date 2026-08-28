import React, { useState } from 'react';
import { MapPin, PhoneCall, Star, Search, Navigation, X } from 'lucide-react';
import { TranslationDictionary } from '../../types/i18n';
import { Amenity } from '../../types/transit';

interface NearbyAmenitiesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  t: TranslationDictionary;
  amenities: Amenity[];
}

export const NearbyAmenitiesDrawer: React.FC<NearbyAmenitiesDrawerProps> = ({
  isOpen,
  onClose,
  t,
  amenities,
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

  const filteredAmenities = amenities.filter((a) => {
    const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory;
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 text-slate-900 dark:text-white space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 border border-purple-300 dark:border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Nearby Stores
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Discover grocery stores, pharmacies, restaurants & essentials near your location
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

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder={t.searchPlaceholder || 'Search stores, pharmacies, restaurants, blood banks...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-purple-500 transition"
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
                  ? 'bg-purple-600 border-purple-600 text-white shadow-sm shadow-purple-600/30 font-bold'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-purple-600'
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
                className="bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-400 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{am.name}</h3>
                    {am.priceLevel && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-semibold">{am.priceLevel}</span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400">{am.address}</p>

                  <div className="flex flex-wrap items-center gap-2.5 text-[11px] pt-1">
                    {/* Open/Closed Badge */}
                    <span
                      className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                        am.isOpenNow
                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300'
                      }`}
                    >
                      ● {am.isOpenNow ? 'Open Now' : 'Closed'} {am.openHours ? `(${am.openHours})` : ''}
                    </span>

                    {/* Ratings */}
                    {am.rating && (
                      <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-bold text-[11px]">
                        <Star className="w-3 h-3 fill-current text-amber-500" /> {am.rating} ({am.userReviewsCount})
                      </span>
                    )}

                    {/* Distance from Station */}
                    <span className="text-blue-600 dark:text-cyan-400 font-mono font-bold text-[11px]">
                      📍 {am.distanceMeters}m away
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                  {am.phone && (
                    <a
                      href={`tel:${am.phone}`}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 flex items-center gap-1.5 transition text-xs font-semibold shadow-sm"
                      title="Call Store"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                      <span className="hidden sm:inline">Call</span>
                    </a>
                  )}

                  <button
                    onClick={() => {
                      alert(`📍 Navigation path to ${am.name} loaded on map.`);
                      onClose();
                    }}
                    className="p-2.5 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm shadow-purple-600/30 flex items-center gap-1.5 transition"
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
          className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:opacity-90 text-white font-bold text-xs transition"
        >
          Close Store Explorer
        </button>
      </div>
    </div>
  );
};
