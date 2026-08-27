import React, { useState } from 'react';
import { Package, Lock, Plus, Truck, CheckCircle2, Phone, AlertCircle, QrCode, X } from 'lucide-react';
import { ParcelBooking } from '../../types/transit';
import { BHUBANESWAR_STATIONS } from '../../data/cities/bhubaneswar';
import { supabaseService } from '../../services/supabaseClient';
import { TranslationDictionary } from '../../types/i18n';

interface ParcelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: TranslationDictionary;
}

export const ParcelBookingModal: React.FC<ParcelBookingModalProps> = ({
  isOpen,
  onClose,
  t,
}) => {
  const [activeTab, setActiveTab] = useState<'track' | 'book'>('track');
  const [bookings, setBookings] = useState<ParcelBooking[]>(supabaseService.getParcelBookings());

  // Form State - read from logged-in user
  const getUserInfo = () => {
    try {
      const profile = localStorage.getItem('musafir_user_profile');
      const demoUser = localStorage.getItem('musafir_demo_user');
      let name = '';
      let phone = '';
      if (profile) {
        const p = JSON.parse(profile);
        name = p.fullName || '';
        phone = p.phone || '';
      }
      if (!name && demoUser) {
        const u = JSON.parse(demoUser);
        name = u.fullName || u.full_name || '';
      }
      return { name, phone };
    } catch { return { name: '', phone: '' }; }
  };
  const userInfo = getUserInfo();
  const [senderName, setSenderName] = useState(userInfo.name);
  const [senderPhone, setSenderPhone] = useState(userInfo.phone);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [alternateRecipientPhone, setAlternateRecipientPhone] = useState('');
  const [originStation, setOriginStation] = useState(BHUBANESWAR_STATIONS[0].name);
  const [destStation, setDestStation] = useState(BHUBANESWAR_STATIONS[3].name);
  const [weightKg, setWeightKg] = useState(1.5);
  const [bookedSuccess, setBookedSuccess] = useState<ParcelBooking | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleBookParcel = () => {
    if (!recipientName || !recipientPhone || !alternateRecipientPhone) {
      setValidationError('Please fill in Recipient Name, Primary Phone, and Alternate Contact Number.');
      return;
    }
    if (recipientPhone.trim() === alternateRecipientPhone.trim()) {
      setValidationError('Alternate phone number must be different from primary phone number for delivery fallback.');
      return;
    }

    setValidationError(null);
    const trackingCode = 'MSFR-TRK-' + Math.floor(100000 + Math.random() * 900000);
    const lockerPin = Math.floor(1000 + Math.random() * 9000).toString();

    const newParcel: ParcelBooking = {
      id: 'PARCEL-' + Date.now(),
      trackingCode,
      senderName,
      senderPhone,
      recipientName,
      recipientPhone,
      alternateRecipientPhone,
      originStation,
      destStation,
      lockerNumber: 'Locker #B-' + Math.floor(10 + Math.random() * 90),
      lockerPin,
      weightKg,
      fare: Math.round(weightKg * 20) + 15,
      status: 'booked',
      createdAt: 'Just now',
      estimatedDelivery: 'Today by Transit Courier in 45 mins',
    };

    supabaseService.saveParcelBooking(newParcel);
    setBookings(supabaseService.getParcelBookings());
    setBookedSuccess(newParcel);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 text-slate-900 dark:text-white space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.parcelDelivery || 'Transit Parcel Sync & Lockers'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transit Parcel & Smart Station Lockers
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

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
          <button
            onClick={() => { setActiveTab('track'); setBookedSuccess(null); }}
            className={`flex-1 py-2 rounded-xl font-bold transition ${
              activeTab === 'track'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-blue-600'
            }`}
          >
            📦 Active Lockers ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('book')}
            className={`flex-1 py-2 rounded-xl font-bold transition ${
              activeTab === 'book'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-blue-600'
            }`}
          >
            ➕ Book Transit Parcel
          </button>
        </div>

        {/* Tab 1: Track Parcels */}
        {activeTab === 'track' && (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {bookings.length === 0 ? (
              <div className="text-center py-10 text-slate-500 dark:text-slate-400 text-xs space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <p className="font-medium">No active parcels yet. Book a new transit locker parcel below!</p>
                <button
                  onClick={() => setActiveTab('book')}
                  className="py-2 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition"
                >
                  Book Parcel
                </button>
              </div>
            ) : (
              bookings.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 relative overflow-hidden space-y-2 text-xs shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                        {p.trackingCode}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {p.originStation} ➔ {p.destStation}
                      </p>
                    </div>
                    <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase">
                      {p.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Locker Location</span>
                      <strong className="text-slate-800 dark:text-white">{p.lockerNumber}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">OTP Unlock PIN</span>
                      <strong className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">
                        {p.lockerPin}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Recipient Contact</span>
                      <span className="text-slate-700 dark:text-slate-300">{p.recipientPhone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Alternate Contact</span>
                      <span className="text-slate-700 dark:text-slate-300">{p.alternateRecipientPhone}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Book Parcel Form */}
        {activeTab === 'book' && (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {bookedSuccess ? (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 p-5 rounded-2xl text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-300">
                  Parcel Booked Successfully!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Tracking Code: <strong>{bookedSuccess.trackingCode}</strong>
                </p>
                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-emerald-200 dark:border-emerald-700 text-xs">
                  Locker Assigned: <strong>{bookedSuccess.lockerNumber}</strong> | PIN:{' '}
                  <strong className="text-emerald-600 font-mono">{bookedSuccess.lockerPin}</strong>
                </div>
                <button
                  onClick={() => { setActiveTab('track'); setBookedSuccess(null); }}
                  className="w-full py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  View Active Parcels
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {validationError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-700 text-rose-700 dark:text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Jena"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Primary Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 00000"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 mb-1">
                    <Phone className="w-3.5 h-3.5" />
                    Alternate Phone Number (Fallback Delivery)
                  </label>
                  <input
                    type="tel"
                    placeholder="Must be different from primary contact"
                    value={alternateRecipientPhone}
                    onChange={(e) => setAlternateRecipientPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Origin Locker Station
                    </label>
                    <select
                      value={originStation}
                      onChange={(e) => setOriginStation(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      {BHUBANESWAR_STATIONS.map((s) => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Destination Locker Station
                    </label>
                    <select
                      value={destStation}
                      onChange={(e) => setDestStation(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      {BHUBANESWAR_STATIONS.map((s) => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleBookParcel}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition mt-2"
                >
                  Confirm & Reserve Locker (₹{Math.round(weightKg * 20) + 15})
                </button>
              </div>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition"
        >
          Close Hub
        </button>
      </div>
    </div>
  );
};
