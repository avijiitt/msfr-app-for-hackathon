import React, { useState } from 'react';
import {
  Package, Lock, Plus, Truck, CheckCircle2, Phone, AlertCircle, QrCode, X,
  MapPin, Navigation, Home, Clock, Sparkles, Building2, Search, ArrowRight
} from 'lucide-react';
import { ParcelBooking } from '../../types/transit';
import { BHUBANESWAR_STATIONS, BHUBANESWAR_LOCALITIES, getHumanReadableLocationName } from '../../data/cities/bhubaneswar';
import { supabaseService } from '../../services/supabaseClient';
import { geolocationService } from '../../services/geolocationService';
import { TranslationDictionary } from '../../types/i18n';
import { PaymentGatewayModal } from '../payment/PaymentGatewayModal';

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
        phone = u.phone || '';
      }
      return { name, phone };
    } catch { return { name: '', phone: '' }; }
  };

  const [senderName, setSenderName] = useState(() => getUserInfo().name || 'Abhijit Sahoo');
  const [senderPhone, setSenderPhone] = useState(() => getUserInfo().phone || '9876543210');
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
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  if (!isOpen) return null;

  // Rate calculation (Max Weight 50kg, 1/2 kg pricing: Normal = ₹10/0.5kg, Smart Locker = ₹50/0.5kg, Express = ₹25/0.5kg)
  const ratePerHalfKg = deliveryType === 'locker' ? 50 : deliveryType === 'express' ? 25 : 10;
  const halfKgUnits = Math.max(1, Math.ceil(Math.min(50, weightKg) / 0.5));
  const totalFare = halfKgUnits * ratePerHalfKg;

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
    setIsPaymentOpen(true);
  };

  const finalizeParcelBooking = (paymentReceipt?: string) => {
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
        ? 'Today Express (Mo Bus Courier)'
        : deliveryType === 'doorstep'
        ? 'Today in 60-90 mins (Doorstep Delivery)'
        : 'Ready for Pickup at Locker Hub in 40 mins',
    };

    supabaseService.saveParcelBooking(newParcel);
    setBookings(supabaseService.getParcelBookings());
    setBookedSuccess(newParcel);
    setIsPaymentOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 text-slate-900 dark:text-white space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl transition-colors max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{t.parcelDelivery || 'Parcel'}</span>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-extrabold">
                  BBSR
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Send packages to any address, doorstep, or locker in Bhubaneswar
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
                      onClick={() => setDeliveryType('doorstep')}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                        deliveryType === 'doorstep'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Home className="w-4 h-4" />
                      <span className="text-[11px] font-extrabold">Normal Doorstep</span>
                      <span className="text-[10px] text-emerald-600 font-bold">₹10 / 0.5kg</span>
                    </button>

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
                      <span className="text-[10px] text-emerald-600 font-bold">₹50 / 0.5kg</span>
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
                      <span className="text-[11px] font-extrabold">Express</span>
                      <span className="text-[10px] text-emerald-600 font-bold">₹25 / 0.5kg</span>
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

                {/* Pickup Location in Bhubaneswar / India */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      Pickup Location / Sender Hub *
                    </label>
                    <button
                      type="button"
                      onClick={async () => {
                        const loc = await geolocationService.getCurrentLivePosition();
                        if (loc) {
                          const name = getHumanReadableLocationName(loc.lat, loc.lng);
                          setOriginLocation(`${name.replace('Pinned Location ', '')}`);
                        }
                      }}
                      className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>📍 Use Live GPS</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter pickup locality, station or address in BBSR..."
                    value={originLocation}
                    onChange={(e) => setOriginLocation(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                  {/* Suggested Pickup Hubs */}
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <span className="text-[9px] font-bold uppercase text-slate-400 self-center">Suggested Hubs:</span>
                    {[
                      'Master Canteen Central Hub',
                      'Baramunda ISBT Hub',
                      'KIIT Square Hub',
                      'Trident Infocity Hub',
                      'Patia Station Hub',
                    ].map((hub) => (
                      <button
                        key={hub}
                        type="button"
                        onClick={() => setOriginLocation(`${hub}, Bhubaneswar`)}
                        className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-bold hover:bg-blue-100 transition"
                      >
                        📍 {hub.replace(' Hub', '')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Destination Location in Bhubaneswar */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Destination Locality / Delivery Hub in Bhubaneswar *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter delivery locality (e.g. Royal Lagoon, Sailashree Vihar, Nayapalli, AIIMS)..."
                    value={destLocation}
                    onChange={(e) => setDestLocation(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />

                  {/* Suggested Delivery Hubs */}
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <span className="text-[9px] font-bold uppercase text-slate-400 self-center">Suggested Drops:</span>
                    {[
                      'Royal Lagoon Apartments, Patia',
                      'Trident College, Infocity',
                      'KIIT Campus 6 Hub',
                      'Rasulgarh Square Hub',
                      'Khandagiri Caves Hub',
                      'Sailashree Vihar Phase 2',
                    ].map((hub) => (
                      <button
                        key={hub}
                        type="button"
                        onClick={() => setDestLocation(`${hub}, Bhubaneswar`)}
                        className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold hover:bg-emerald-100 transition"
                      >
                        📍 {hub.split(',')[0]}
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

                {/* Package Weight & Pricing Breakdown (Individual Weight Selection up to 50kg) */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Individual Parcel Weight (Max 50 kg)</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">🛡️ Mo Bus Cargo Transit Protection Included</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Fare</span>
                      <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                        ₹{totalFare}
                      </span>
                    </div>
                  </div>

                  {/* Quick Select Weight Chips */}
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {[0.5, 1.0, 2.0, 5.0, 10.0, 20.0, 30.0, 50.0].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setWeightKg(w)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold transition ${
                          weightKg === w
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        {w} kg
                      </button>
                    ))}
                  </div>

                  {/* Custom Individual Weight Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <label className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Custom Weight:</label>
                    <div className="relative flex-1 max-w-[130px]">
                      <input
                        type="number"
                        min="0.1"
                        max="50"
                        step="0.1"
                        value={weightKg}
                        onChange={(e) => setWeightKg(Math.max(0.1, Math.min(50, parseFloat(e.target.value) || 0.5)))}
                        className="w-full py-1 px-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold font-mono focus:border-blue-500 focus:outline-none"
                      />
                      <span className="absolute right-2 top-1 text-[11px] text-slate-400 font-bold">kg</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      ({halfKgUnits} × 0.5kg units)
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400">
                    Pricing Rate: <strong className="text-slate-700 dark:text-slate-200 font-mono">₹{ratePerHalfKg}</strong> per 0.5 kg • {halfKgUnits} × 0.5 kg units = ₹{totalFare}
                  </div>
                </div>

                <button
                  onClick={handleBookParcel}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition active:scale-98"
                >
                  Confirm & Dispatch Safe Parcel (₹{totalFare})
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

      {/* Parcel Postage Payment Gateway */}
      <PaymentGatewayModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        amount={totalFare}
        purpose={`Bhubaneswar Intra-City Parcel: ${originLocation.split(',')[0]} ➔ ${destLocation.split(',')[0]}`}
        customerName={senderName}
        customerPhone={senderPhone}
        onPaymentSuccess={(result) => {
          finalizeParcelBooking(result.receiptNumber);
        }}
      />
    </div>
  );
};
