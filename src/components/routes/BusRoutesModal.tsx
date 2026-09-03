import React from 'react';
import { BusRoutes } from './BusRoutes';
import { MoBusDetailRoute } from '../../data/busRoutesData';
import { X, Bus, Sparkles } from 'lucide-react';

interface BusRoutesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRoute: (origin: string, destination: string, route?: MoBusDetailRoute) => void;
}

export const BusRoutesModal: React.FC<BusRoutesModalProps> = ({
  isOpen,
  onClose,
  onSelectRoute,
}) => {
  if (!isOpen) return null;

  const handleRouteSelected = (route: MoBusDetailRoute) => {
    const origin = route.start || 'Bhubaneswar Railway Station';
    const destination = route.destination || 'Patia';

    onSelectRoute(origin, destination, route);
    onClose();
  };


  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all">
        
        {/* Modal Top Bar */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-inner">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight">CRUT Ama Bus Route Network</h1>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-100 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                  82+ Official Lines
                </span>
              </div>
              <p className="text-xs text-blue-100">
                Browse complete city bus routes across Bhubaneswar, Cuttack, Puri, Khordha & Konark
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-slate-900/50">
          <BusRoutes onSelectRoute={handleRouteSelected} onClose={onClose} />
        </div>

        {/* Footer */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center flex-shrink-0 flex items-center justify-between px-6 text-xs text-slate-500">
          <span className="font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Tap <strong>"Plan Route"</strong> on any bus card to navigate directly</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
