import React, { useState } from 'react';
import { Package, Lock, Plus, Truck, CheckCircle2, Phone, AlertCircle, QrCode } from 'lucide-react';
import { ParcelBooking, Station } from '../../types/transit';
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

  // Form State
  const [senderName, setSenderName] = useState('Abhijit Sahoo');
  const [senderPhone, setSenderPhone] = useState('+91 98765 43210');
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
      estimatedDelivery: 'Today by Mo Bus #10 in 45 mins',
    };

    supabaseService.saveParcelBooking(newParcel);
    setBookings(supabaseService.getParcelBookings());
    setBookedSuccess(newParcel);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="max-w-xl w-full glass-panel rounded-3xl p-5 sm:p-6 text-on-surface space-y-5 border border-primary/30 shadow-2xl ambient-glow-primary">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-primary/15 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface font-headline-md">
                {t.parcelDelivery}
              </h2>
              <p className="text-xs text-on-surface-variant">
                Transit Parcel & Smart Station Lockers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-bright text-on-surface-variant text-sm border border-primary/20"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-surface-container p-1 rounded-xl border border-primary/20 text-xs font-label-caps">
          <button
            onClick={() => { setActiveTab('track'); setBookedSuccess(null); }}
            className={`flex-1 py-2 rounded-lg font-bold transition ${
              activeTab === 'track' ? 'bg-primary text-on-primary shadow' : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            📦 Active Lockers ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('book')}
            className={`flex-1 py-2 rounded-lg font-bold transition ${
              activeTab === 'book' ? 'bg-primary text-on-primary shadow' : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            ➕ Book Transit Parcel
          </button>
        </div>

        {/* Tab 1: Track Parcels */}
        {activeTab === 'track' && (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {bookings.length === 0 ? (
              <div className="text-center py-8 text-on-surface-variant text-xs space-y-2">
                <Package className="w-8 h-8 text-primary/50 mx-auto" />
                <p>No active parcels yet. Book a new transit locker parcel below!</p>
                <button
                  onClick={() => setActiveTab('book')}
                  className="py-1.5 px-4 rounded-xl bg-primary text-on-primary font-bold text-xs font-label-caps"
                >
                  Book Parcel
                </button>
              </div>
            ) : (
              bookings.map((p) => (
                <div key={p.id} className="bg-surface-container/80 rounded-xl p-4 border border-surface-variant relative overflow-hidden space-y-2 text-xs">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary-fixed"></div>
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-on-surface text-sm">Smart Locker Pick-up</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{p.lockerNumber}, {p.destStation}</p>
                    </div>
                    <span className="bg-secondary-fixed/20 text-secondary-fixed text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider font-label-caps">
                      Ready
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-surface-container-high p-2.5 rounded-xl border border-primary/10 text-[11px]">
                    <div>
                      <span className="text-on-surface-variant block font-label-caps">RECIPIENT:</span>
                      <strong className="text-on-surface">{p.recipientName}</strong>
                      <div className="text-[10px] text-on-surface-variant font-mono">{p.recipientPhone}</div>
                    </div>
                    <div>
                      <span className="text-on-surface-variant block font-label-caps">ALTERNATE PHONE:</span>
                      <strong className="text-primary font-mono">{p.alternateRecipientPhone}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-surface-variant/50 text-[11px] text-on-surface-variant">
                    <span>Locker PIN: <strong className="text-primary font-mono text-xs">{p.lockerPin}</strong></span>
                    <span className="text-tertiary font-semibold">{p.estimatedDelivery}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Book Form */}
        {activeTab === 'book' && (
          <div className="space-y-3 text-xs">
            {bookedSuccess ? (
              <div className="bg-surface-container border border-primary/30 rounded-2xl p-5 text-center space-y-3 animate-in zoom-in-95">
                <CheckCircle2 className="w-10 h-10 text-primary mx-auto" />
                <h3 className="text-base font-bold text-on-surface font-headline-md">Transit Parcel Booked Successfully!</h3>
                <div className="bg-surface-container-high p-3 rounded-xl border border-primary/10 text-left space-y-1 font-mono text-[11px]">
                  <div>Tracking Code: <strong className="text-primary">{bookedSuccess.trackingCode}</strong></div>
                  <div>Assigned Station Locker: <strong className="text-tertiary">{bookedSuccess.lockerNumber}</strong></div>
                  <div>Pickup PIN: <strong className="text-secondary">{bookedSuccess.lockerPin}</strong></div>
                  <div>Alternate Contact: <strong className="text-on-surface">{bookedSuccess.alternateRecipientPhone}</strong></div>
                </div>
                <button
                  onClick={() => { setActiveTab('track'); setBookedSuccess(null); }}
                  className="py-2 px-4 rounded-xl bg-surface-container hover:bg-surface-bright text-on-surface font-bold text-xs border border-primary/20 font-label-caps"
                >
                  View Active Parcels
                </button>
              </div>
            ) : (
              <>
                {validationError && (
                  <div className="bg-error-container/30 border border-error rounded-xl p-2.5 text-[11px] text-error flex items-center gap-1.5 font-label-caps">
                    <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">Sender Name</label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full bg-surface-container border border-primary/20 rounded-xl p-2 text-on-surface text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">Recipient Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Priyanka Dash"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full bg-surface-container border border-primary/20 rounded-xl p-2 text-on-surface text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* Primary and Mandatory Alternate Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">Primary Recipient Phone</label>
                    <input
                      type="tel"
                      placeholder="+91 91234 56789"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      className="w-full bg-surface-container border border-primary/20 rounded-xl p-2 text-on-surface text-xs focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-primary block mb-1">
                      Alternate Phone Number <span className="text-secondary">*Mandatory</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 94370 99887"
                      value={alternateRecipientPhone}
                      onChange={(e) => setAlternateRecipientPhone(e.target.value)}
                      className="w-full bg-surface-container border border-primary/40 rounded-xl p-2 text-on-surface text-xs focus:outline-none focus:border-primary font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">Pickup Station Locker</label>
                    <select
                      value={originStation}
                      onChange={(e) => setOriginStation(e.target.value)}
                      className="w-full bg-surface-container border border-primary/20 rounded-xl p-2 text-on-surface text-xs focus:outline-none"
                    >
                      {BHUBANESWAR_STATIONS.map((st) => (
                        <option key={st.id} value={st.name} className="bg-surface-container-high">{st.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">Destination Station Locker</label>
                    <select
                      value={destStation}
                      onChange={(e) => setDestStation(e.target.value)}
                      className="w-full bg-surface-container border border-primary/20 rounded-xl p-2 text-on-surface text-xs focus:outline-none"
                    >
                      {BHUBANESWAR_STATIONS.map((st) => (
                        <option key={st.id} value={st.name} className="bg-surface-container-high">{st.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-on-surface-variant">
                    Est. Delivery Fare: <strong className="text-tertiary font-mono text-sm">₹{Math.round(weightKg * 20) + 15}</strong>
                  </div>
                  <span className="text-[10px] text-primary font-label-caps">● Intra-City Mo Bus Locker</span>
                </div>

                <button
                  onClick={handleBookParcel}
                  className="w-full py-3 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary font-bold text-xs shadow-lg shadow-primary/20 transition flex items-center justify-center gap-2 font-label-caps"
                >
                  <Package className="w-4 h-4" />
                  <span>Confirm & Generate Smart Locker PIN</span>
                </button>
              </>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-surface-container hover:bg-surface-bright text-on-surface font-bold text-xs border border-primary/20 font-label-caps"
        >
          Close Hub
        </button>
      </div>
    </div>
  );
};
