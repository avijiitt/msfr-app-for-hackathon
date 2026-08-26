import React, { useState } from 'react';
import { Package, Lock, QrCode, CheckCircle2, ArrowRight, Truck } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="max-w-lg w-full glass-panel-glow rounded-3xl p-5 sm:p-6 text-white space-y-5 border border-amber-500/30 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {t.parcelDelivery}
              </h2>
              <p className="text-xs text-slate-400">
                Intra-City Bus/Metro Locker Delivery Network
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

        {/* Info Banner */}
        <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-3.5 text-xs text-amber-200 flex items-center gap-2">
          <Truck className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            Send and receive parcels securely across smart station lockers transported via public transit buses & metro.
          </span>
        </div>

        {/* Parcels List */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {parcels.map((p) => {
            const isReady = p.status === 'ready_pickup';
            const isDelivered = p.status === 'delivered';

            return (
              <div key={p.id} className="bg-slate-900/90 border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-mono">{p.trackingCode}</span>
                    <h3 className="font-bold text-sm text-white">{p.stationName}</h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                      isReady
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : isDelivered
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {p.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-2.5 rounded-xl border border-white/10">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Locker Number:</span>
                    <strong className="text-white font-mono">{p.lockerNumber}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Pickup PIN:</span>
                    <strong className="text-cyan-300 font-mono">{p.pin}</strong>
                  </div>
                </div>

                {isReady && (
                  <button
                    onClick={() => handleUnlockLocker(p.id)}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{unlockedId === p.id ? 'Unlocking Smart Locker Door...' : '1-Tap Bluetooth Locker Open'}</span>
                  </button>
                )}

                {isDelivered && (
                  <div className="text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1 bg-emerald-500/10 py-1.5 rounded-xl border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Parcel Collected from Locker</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
        >
          Close Parcel Hub
        </button>
      </div>
    </div>
  );
};
