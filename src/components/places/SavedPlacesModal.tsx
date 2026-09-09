import React, { useState, useEffect } from 'react';
import { 
  Bookmark, 
  Plus, 
  Trash2, 
  Edit2, 
  MapPin, 
  Check, 
  X, 
  Home, 
  Briefcase, 
  GraduationCap, 
  Star,
  Search,
  Navigation
} from 'lucide-react';
import { SavedLocation } from '../../types/transit';
import { sosService } from '../../services/sosService';
import { geocodeAddressIndia } from '../../services/indiaGeocodingService';

interface SavedPlacesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlace?: (address: string) => void;
  onLocationsUpdated?: () => void;
}

const CATEGORY_ICONS = [
  { category: 'home', label: 'Home', icon: Home, emoji: '🏠' },
  { category: 'work', label: 'Work', icon: Briefcase, emoji: '💼' },
  { category: 'college', label: 'College', icon: GraduationCap, emoji: '🎓' },
  { category: 'custom', label: 'Favorite', icon: Star, emoji: '⭐' },
];

export const SavedPlacesModal: React.FC<SavedPlacesModalProps> = ({
  isOpen,
  onClose,
  onSelectPlace,
  onLocationsUpdated,
}) => {
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCategory, setEditCategory] = useState<SavedLocation['category']>('custom');
  
  // Adding new place state
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCategory, setNewCategory] = useState<SavedLocation['category']>('custom');
  const [isSearching, setIsSearching] = useState(false);

  const refreshLocations = () => {
    const list = sosService.getSavedLocations();
    setLocations([...list]);
  };

  useEffect(() => {
    if (isOpen) {
      refreshLocations();
      setIsAdding(false);
      setEditingId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartEdit = (loc: SavedLocation) => {
    setEditingId(loc.id);
    setEditName(loc.name);
    setEditAddress(loc.address);
    setEditCategory(loc.category);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditAddress('');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim() || !editAddress.trim()) return;
    
    let lat = 20.3541;
    let lng = 85.8175;
    try {
      const geo = await geocodeAddressIndia(editAddress.trim());
      if (geo && geo[0]) {
        lat = geo[0].lat;
        lng = geo[0].lng;
      }
    } catch {}

    const selectedCat = CATEGORY_ICONS.find(c => c.category === editCategory);
    sosService.updateSavedLocation(id, {
      name: editName.trim(),
      address: editAddress.trim(),
      category: editCategory,
      icon: selectedCat?.emoji || '📍',
      lat,
      lng,
    });

    setEditingId(null);
    refreshLocations();
    onLocationsUpdated?.();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this saved location?')) {
      sosService.deleteSavedLocation(id);
      refreshLocations();
      onLocationsUpdated?.();
    }
  };

  const handleAddNew = async () => {
    if (!newName.trim() || !newAddress.trim()) return;
    setIsSearching(true);

    let lat = 20.3541;
    let lng = 85.8175;
    try {
      const geo = await geocodeAddressIndia(newAddress.trim());
      if (geo && geo[0]) {
        lat = geo[0].lat;
        lng = geo[0].lng;
      }
    } catch {}

    const selectedCat = CATEGORY_ICONS.find(c => c.category === newCategory);
    sosService.addSavedLocation({
      name: newName.trim(),
      address: newAddress.trim(),
      category: newCategory,
      icon: selectedCat?.emoji || '📍',
      lat,
      lng,
    });

    setIsSearching(false);
    setIsAdding(false);
    setNewName('');
    setNewAddress('');
    refreshLocations();
    onLocationsUpdated?.();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'home':
        return <Home className="w-4 h-4 text-blue-600" />;
      case 'work':
        return <Briefcase className="w-4 h-4 text-indigo-600" />;
      case 'college':
        return <GraduationCap className="w-4 h-4 text-purple-600" />;
      default:
        return <Star className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 text-slate-900 dark:text-white space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                Saved Places
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage your frequent addresses for instant 1-click route planning
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Button: Add New Place */}
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-2.5 px-4 rounded-2xl border-2 border-dashed border-blue-300 dark:border-blue-700/60 hover:border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98"
          >
            <Plus className="w-4 h-4" />
            Add New Saved Location
          </button>
        )}

        {/* Form: Add New Place */}
        {isAdding && (
          <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300">Add New Place</span>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Place Label (e.g. Home, Gym, Library)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Full Address or Landmark (e.g. Trident Academy, Patia)"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
              
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] font-semibold text-slate-500">Category:</span>
                <div className="flex gap-1.5 flex-wrap">
                  {CATEGORY_ICONS.map((cat) => (
                    <button
                      key={cat.category}
                      type="button"
                      onClick={() => setNewCategory(cat.category as SavedLocation['category'])}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                        newCategory === cat.category
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNew}
                disabled={isSearching || !newName.trim() || !newAddress.trim()}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSearching ? 'Saving...' : 'Save Place'}
              </button>
            </div>
          </div>
        )}

        {/* List of Saved Locations */}
        <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
          {locations.map((loc) => {
            const isEditing = editingId === loc.id;

            if (isEditing) {
              return (
                <div key={loc.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-blue-400 dark:border-blue-600 space-y-2.5">
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    />
                    <input
                      type="text"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {CATEGORY_ICONS.map((cat) => (
                        <button
                          key={cat.category}
                          type="button"
                          onClick={() => setEditCategory(cat.category as SavedLocation['category'])}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 ${
                            editCategory === cat.category
                              ? 'bg-blue-600 text-white'
                              : 'bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <span>{cat.emoji}</span>
                          <span>{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1 rounded-lg text-xs text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(loc.id)}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Save
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={loc.id}
                className="group flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition"
              >
                <div 
                  className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                  onClick={() => {
                    if (onSelectPlace) {
                      onSelectPlace(loc.address);
                      onClose();
                    }
                  }}
                >
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                    {loc.icon || getCategoryIcon(loc.category)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{loc.name}</span>
                      <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                        {loc.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[240px] sm:max-w-[280px]">
                      {loc.address}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 pl-2">
                  <button
                    onClick={() => handleStartEdit(loc)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
                    title="Edit address"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(loc.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                    title="Delete location"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="text-[11px] text-slate-400 text-center pt-2 border-t border-slate-100 dark:border-slate-800">
          💡 Click any saved place to instantly set it as your transit route destination.
        </div>
      </div>
    </div>
  );
};
