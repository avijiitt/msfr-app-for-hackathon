import React, { useState } from 'react';
import {
  Package, Lock, Plus, Truck, CheckCircle2, Phone, AlertCircle, QrCode, X,
  MapPin, Navigation, Home, Clock, Sparkles, Building2, Search, ArrowRight
} from 'lucide-react';
import { ParcelBooking } from '../../types/transit';
import { BHUBANESWAR_STATIONS, BHUBANESWAR_LOCALITIES } from '../../data/cities/bhubaneswar';
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
  const [senderName, setSenderName] = useState(userInfo.name || 'Commuter');
  const [senderPhone, setSenderPhone] = useState(userInfo.phone || '+91 90400 92069');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [alternateRecipientPhone, setAlternateRecipientPhone] = useState('');
  
  // Custom Locations in Bhubaneswar
  const [originLocation, setOriginLocation] = useState('Patia / KIIT Square, Bhubaneswar');
  const [destLocation, setDestLocation] = useState('Jayadev Vihar / Pal Heights, Bhubaneswar');
  const [destDoorstepAddress, setDestDoorstepAddress] = useState('');
  const [deliveryType, setDeliveryType] = useState<'locker' | 'doorstep' | 'express'>('doorstep');
  const [weightKg, setWeightKg] = useState(1.5);
  const [bookedSuccess, setBookedSuccess] = useState<ParcelBooking | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Rate calculation
  const baseRate = deliveryType === 'locker' ? 35 : deliveryType === 'doorstep' ? 55 : 75;
  const totalFare = Math.round(baseRate + (weightKg > 1 ? (weightKg - 1) * 15 : 0));

  const handleBookParcel = () => {
    if (!recipientName.trim() || !recipientPhone.trim() || !alternateRecipientPhone.trim()) {
      setValidationError('Please fill in Recipient Name, Primary Phone, and Alternate Contact Number.');
      return;
    }
    if (recipientPhone.trim() === alternateRecipientPhone.trim()) {
      setValidationError('Alternate phone number must be different from primary phone number for delivery fallback.');
      return;
    }
    if (!destLocation.trim()) {
      setValidationError('Please specify the destination location in Bhubaneswar.');
      return;
    }

    setValidationError(null);
    const trackingCode = 'MSFR-TRK-' + Math.floor(100000 + Math.random() * 900000);
    const lockerPin = Math.floor(1000 + Math.random() * 9000).toString();

    const finalDest = deliveryType === 'doorstep' && destDoorstepAddress.trim()
      ? `${destDoorstepAddress.trim()}, ${destLocation}`
      : destLocation;

    const newParcel: ParcelBooking = {
      id: 'PARCEL-' + Date.now(),
      trackingCode,
      senderName,
      senderPhone,
      recipientName,
      recipientPhone,
      alternateRecipientPhone,
      originStation: originLocation,
      destStation: finalDest,
      lockerNumber: deliveryType === 'locker' 
        ? 'Locker #B-' + Math.floor(10 + Math.random() * 90)
        : 'Transit Courier Doorstep Van #BBSR-' + Math.floor(10 + Math.random() * 90),
      lockerPin,
      weightKg,
      fare: totalFare,
      status: 'booked',
      createdAt: 'Just now',
      estimatedDelivery: deliveryType === 'express'
        ? 'Today in 35-45 mins (Express Mo Bus Courier)'
        : deliveryType === 'doorstep'
        ? 'Today in 60-90 mins (Doorstep Delivery)'
        : 'Ready for Pickup at Locker Hub in 40 mins',
    };

    supabaseService.saveParcelBooking(newParcel);
    setBookings(supabaseService.getParcelBookings());
    setBookedSuccess(newParcel);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 text-slate-900 dark:text-white space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl transition-colors max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{t.parcelDelivery || 'Bhubaneswar Intra-City Parcel & Courier'}</span>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-extrabold">
                  All BBSR Covered
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Send packages to any address, doorstep, or locker across Bhubaneswar via Mo Bus network
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
            onClick={() => setActiveTab('track')}
            className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'track'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Active Deliveries ({bookings.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('book')}
            className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'book'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Send Parcel to Any BBSR Location</span>
          </button>
        </div>

        {/* Tab 1: Track Parcels */}
        {activeTab === 'track' && (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {bookings.length === 0 ? (
              <div className="text-center py-10 text-slate-500 dark:text-slate-400 text-xs space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Package className="w-6 h-6 text-amber-500" />
                </div>
                <p className="font-medium">No parcels booked yet. Send packages to any colony, street, or hub in Bhubaneswar!</p>
                <button
                  onClick={() => setActiveTab('book')}
                  className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition"
                >
                  Send Parcel Now
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
                      <span className="text-slate-400 block text-[10px]">Locker / Van Assignment</span>
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
                      <span className="text-slate-400 block text-[10px]">Estimated Delivery</span>
                      <span className="text-slate-700 dark:text-slate-300">{p.estimatedDelivery}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Book Parcel Form */}
        {activeTab === 'book' && (
          <div className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
            {bookedSuccess ? (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 p-5 rounded-2xl text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-300">
                  Parcel Dispatched in Bhubaneswar Network!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Tracking Code: <strong className="font-mono">{bookedSuccess.trackingCode}</strong>
                </p>
                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-emerald-200 dark:border-emerald-700 text-xs text-left space-y-1">
                  <div><strong>Pickup:</strong> {bookedSuccess.originStation}</div>
                  <div><strong>Delivery To:</strong> {bookedSuccess.destStation}</div>
                  <div><strong>Assignment:</strong> {bookedSuccess.lockerNumber}</div>
                  <div><strong>Secure PIN:</strong> <span className="font-mono font-bold text-emerald-600">{bookedSuccess.lockerPin}</span></div>
                  <div><strong>ETA:</strong> {bookedSuccess.estimatedDelivery}</div>
                </div>
                <button
                  onClick={() => { setActiveTab('track'); setBookedSuccess(null); }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  View Active Deliveries
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

                {/* Delivery Mode Choice */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Choose Delivery Mode in Bhubaneswar
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('locker')}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                        deliveryType === 'locker'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Lock className="w-4 h-4" />
                      <span className="text-[11px] font-extrabold">Smart Locker</span>
                      <span className="text-[10px] text-emerald-600 font-bold">₹35</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType('doorstep')}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                        deliveryType === 'doorstep'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Home className="w-4 h-4" />
                      <span className="text-[11px] font-extrabold">Any Doorstep</span>
                      <span className="text-[10px] text-emerald-600 font-bold">₹55</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType('express')}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                        deliveryType === 'express'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                      <span className="text-[11px] font-extrabold">45-Min Express</span>
                      <span className="text-[10px] text-emerald-600 font-bold">₹75</span>
                    </button>
                  </div>
                </div>

                {/* Sender & Recipient Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Recipient Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Chinmayee Pattnaik"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      Recipient Mobile Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 mb-1">
                    <Phone className="w-3.5 h-3.5" />
                    Alternate Contact Number (Fallback Delivery) *
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 94370 12345 (different from primary)"
                    value={alternateRecipientPhone}
                    onChange={(e) => setAlternateRecipientPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                {/* Pickup Location in Bhubaneswar */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Pickup Location / Area in Bhubaneswar *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter pickup locality, station or address in BBSR..."
                    value={originLocation}
                    onChange={(e) => setOriginLocation(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Destination Location in Bhubaneswar */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Destination Locality / Area in Bhubaneswar *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter delivery locality (e.g. Sailashree Vihar, Nayapalli, Old Town, AIIMS)..."
                    value={destLocation}
                    onChange={(e) => setDestLocation(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />

                  {/* Quick Bhubaneswar Locality Chips */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {BHUBANESWAR_LOCALITIES.slice(0, 8).map((loc) => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => setDestLocation(`${loc.name}, Bhubaneswar`)}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] hover:bg-blue-50 hover:text-blue-600 transition"
                      >
                        + {loc.name.split('/')[0].trim()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Specific Doorstep Address if Doorstep Selected */}
                {deliveryType !== 'locker' && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                      House / Flat No., Apartment & Landmark (For Doorstep Delivery)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Plot No. 421/B, Royal Palms, Near DAV School"
                      value={destDoorstepAddress}
                      onChange={(e) => setDestDoorstepAddress(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                )}

                {/* Package Weight & Pricing Breakdown */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Package Weight</span>
                    <div className="flex items-center gap-1.5">
                      {[0.5, 1.5, 3.0, 5.0].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setWeightKg(w)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                            weightKg === w
                              ? 'bg-blue-600 text-white'
                              : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {w} kg
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Transit Fare</span>
                    <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                      ₹{totalFare}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleBookParcel}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition active:scale-98"
                >
                  Confirm & Dispatch Parcel across Bhubaneswar (₹{totalFare})
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
