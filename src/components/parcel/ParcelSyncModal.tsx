import React, { useState } from 'react';
import { Package, Lock, CheckCircle2, ArrowRight, Truck, X } from 'lucide-react';
import { INITIAL_PARCEL_ITEMS } from '../../data/parcels';
import { ParcelLockerItem } from '../../types/transit';
import { TranslationDictionary } from '../../types/i18n';

interface ParcelSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: TranslationDictionary;
}

export const ParcelSyncModal: React.FC<ParcelSyncModalProps> = ({
  isOpen,
  onClose,
  t,
}) => {
  const [parcels, setParcels] = useState<ParcelLockerItem[]>(INITIAL_PARCEL_ITEMS);
  const [unlockedId, setUnlockedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUnlockLocker = (id: string) => {
    setUnlockedId(id);
    setTimeout(() => {
      setParcels(prev => prev.map(p => p.id === id ? { ...p, status: 'delivered' } : p));
      setUnlockedId(null);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 text-slate-900 dark:text-white space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {t.parcelDelivery || 'Parcel'}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Lockers & Delivery
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

        {/* Info Banner */}
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-700/50 rounded-2xl p-3.5 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
          <Truck className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <span>
            Drop parcels in smart station lockers for automated inter-city delivery via public buses & metro.
          </span>
        </div>

        {/* Active Locker Parcels */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {parcels.map((item) => (
            <div
              key={item.id}
              className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-2 text-xs shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{item.trackingCode}</span>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">Station: {item.stationName}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    item.status === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                      : item.status === 'in_transit'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                  }`}
                >
                  {item.status.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Locker Number</span>
                  <strong className="text-slate-800 dark:text-white font-mono">{item.lockerNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Recipient</span>
                  <span className="text-slate-700 dark:text-slate-300">{item.recipientPhone}</span>
                </div>
                {item.status !== 'delivered' && (
                  <button
                    onClick={() => handleUnlockLocker(item.id)}
                    disabled={unlockedId === item.id}
                    className="py-1 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-sm transition"
                  >
                    {unlockedId === item.id ? (
                      <span>Unlocking...</span>
                    ) : (
                      <>
                        <Lock className="w-3 h-3" />
                        <span>Unlock</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:opacity-90 text-white font-bold text-xs transition"
        >
          Close Parcel Hub
        </button>
      </div>
    </div>
  );
};
