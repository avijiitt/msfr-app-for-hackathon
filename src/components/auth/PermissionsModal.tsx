import React, { useState } from 'react';
import { Bell, MapPin, Navigation2, CheckCircle2, ChevronRight, Shield } from 'lucide-react';

interface PermissionsModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

interface Permission {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  why: string;
  status: 'pending' | 'granted' | 'denied';
}

export const PermissionsModal: React.FC<PermissionsModalProps> = ({ isOpen, onComplete }) => {
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: 'location',
      icon: <MapPin className="w-6 h-6 text-blue-600" />,
      title: 'Location Access',
      description: 'Know your exact position on the map',
      why: 'Used for real-time GPS tracking, finding nearby bus stops, and showing your live position on the map — just like Google Maps.',
      status: 'pending',
    },
    {
      id: 'notifications',
      icon: <Bell className="w-6 h-6 text-violet-600" />,
      title: 'Notifications',
      description: 'Get real-time transit alerts',
      why: 'Used for bus arrival alerts, trip delay notices, OTP delivery, and safety SOS confirmations.',
      status: 'pending',
    },
  ]);

  const [requesting, setRequesting] = useState<string | null>(null);
  const [allDone, setAllDone] = useState(false);

  if (!isOpen) return null;

  const requestPermission = async (id: string) => {
    setRequesting(id);

    if (id === 'location') {
      if (!navigator.geolocation) {
        updateStatus(id, 'denied');
        setRequesting(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        () => { updateStatus(id, 'granted'); setRequesting(null); checkAllDone(); },
        () => { updateStatus(id, 'denied'); setRequesting(null); checkAllDone(); },
        { timeout: 8000 }
      );
    }

    if (id === 'notifications') {
      if (!('Notification' in window)) {
        updateStatus(id, 'denied');
        setRequesting(null);
        return;
      }
      const result = await Notification.requestPermission();
      updateStatus(id, result === 'granted' ? 'granted' : 'denied');
      setRequesting(null);
      checkAllDone();
    }
  };

  const updateStatus = (id: string, status: Permission['status']) => {
    setPermissions(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const checkAllDone = () => {
    // Check after a tick
    setTimeout(() => {
      setPermissions(prev => {
        const anyPending = prev.some(p => p.status === 'pending');
        if (!anyPending) setAllDone(true);
        return prev;
      });
    }, 100);
  };

  const grantedCount = permissions.filter(p => p.status === 'granted').length;
  const doneCount = permissions.filter(p => p.status !== 'pending').length;

  return (
    <div className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">

        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-700 p-7 text-white text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/30 border-2 border-blue-400/40 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-300" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Navigation2 className="w-4 h-4 text-blue-300" />
            <span className="font-extrabold text-lg tracking-tight">musafir</span>
          </div>
          <p className="text-slate-300 text-sm">needs a few permissions to give you the full experience</p>
        </div>

        {/* Permission Cards */}
        <div className="p-5 space-y-3">
          {permissions.map(p => (
            <div
              key={p.id}
              className={`rounded-2xl border-2 p-4 transition-all ${
                p.status === 'granted'
                  ? 'border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20'
                  : p.status === 'denied'
                  ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 opacity-70'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                  {p.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm text-slate-800 dark:text-white">{p.title}</span>
                    {p.status === 'granted' && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                    {p.status === 'denied' && <span className="text-[10px] text-slate-400 font-semibold">Skipped</span>}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{p.description}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">{p.why}</p>
                </div>
              </div>

              {p.status === 'pending' && (
                <button
                  onClick={() => requestPermission(p.id)}
                  disabled={requesting === p.id}
                  className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
                >
                  {requesting === p.id ? (
                    <span className="animate-pulse">Requesting...</span>
                  ) : (
                    <>Allow {p.title} <ChevronRight className="w-3.5 h-3.5" /></>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 space-y-3">
          {grantedCount > 0 && (
            <p className="text-center text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              ✅ {grantedCount}/{permissions.length} permission{grantedCount > 1 ? 's' : ''} granted
            </p>
          )}

          <button
            onClick={onComplete}
            disabled={doneCount === 0 && !allDone}
            className={`w-full py-3 rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2 ${
              allDone || doneCount > 0
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
          >
            {allDone ? '🚀 Open musafir' : doneCount > 0 ? 'Continue to musafir →' : 'Allow permissions above to continue'}
          </button>

          <button onClick={onComplete} className="w-full text-xs text-slate-400 hover:text-slate-600 py-1 transition">
            Skip for now (limited functionality)
          </button>
        </div>
      </div>
    </div>
  );
};
