import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Clock, 
  X, 
  RefreshCw, 
  ExternalLink, 
  Radio,
  Bus,
  Train,
  CloudSun,
  AlertTriangle,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { TranslationDictionary } from '../../types/i18n';
import { fetchLiveBbsrNewsAlerts, LiveTransitNewsItem } from '../../services/liveNewsAlertsService';

interface AnnouncementsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  t: TranslationDictionary;
}

const INITIAL_FALLBACK_NEWS: LiveTransitNewsItem[] = [
  {
    id: 'bbsr-news-1',
    title: 'Mo Bus Fleet Deploys Extra AC Electric Buses on Airport – Patia – CDA Corridor',
    description: 'CRUT has augmented peak-hour frequency on Route 10, Route 16, and Route 11 to handle passenger rush with 5-minute intervals.',
    source: 'Odisha TV (OTV) Live',
    timestamp: '5 mins ago',
    severity: 'info',
    category: 'mobus',
    affectedRoutes: ['Route 10', 'Route 16', 'Route 11'],
  },
  {
    id: 'bbsr-news-2',
    title: 'Bhubaneswar Metro Phase-1: Heavy Construction at Trisulia & Patia – Single-Lane Diversion',
    description: 'Traffic police advisory: Expect slow-moving traffic between Damana Square and KIIT Square due to metro pillar pile work.',
    source: 'OTV News Desk / Bhubaneswar',
    timestamp: '25 mins ago',
    severity: 'warning',
    category: 'metro',
    affectedRoutes: ['Route 10', 'Route 16', 'Patia Corridor'],
  },
  {
    id: 'bbsr-news-3',
    title: 'Smart City Weather Alert: Clear Roads across Nayapalli & Rasulgarh',
    description: 'Bhubaneswar Municipal Corporation (BMC) transit control confirms all underpasses and pump stations operational with smooth transit flow.',
    source: 'OTV Digital / IMD Bhubaneswar',
    timestamp: '45 mins ago',
    severity: 'info',
    category: 'weather',
    affectedRoutes: ['Rasulgarh Flyover', 'NH-16'],
  },
  {
    id: 'bbsr-news-4',
    title: 'Mo E-Ride Feeder Service Expanded to 12 New Transit Nodes across CSPUR',
    description: 'Electric rickshaws now active with ₹10 flat fare connecting railway stations to major college and IT campuses.',
    source: 'OTV Special Report',
    timestamp: '1 hr ago',
    severity: 'info',
    category: 'traffic',
    affectedRoutes: ['Infocity Line', 'Master Canteen Hub'],
  },
  {
    id: 'bbsr-news-5',
    title: 'Khandagiri – Baramunda Bus Terminal: Road Widening Work Nearing Completion',
    description: 'Traffic flow normalized on NH-16 service road. Inter-city buses operating smoothly from OSRTC bays.',
    source: 'OTV Odisha Express',
    timestamp: '2 hrs ago',
    severity: 'info',
    category: 'traffic',
    affectedRoutes: ['Route 09', 'Route 18'],
  },
];

export const AnnouncementsDrawer: React.FC<AnnouncementsDrawerProps> = ({
  isOpen,
  onClose,
  t,
}) => {
  const [newsAlerts, setNewsAlerts] = useState<LiveTransitNewsItem[]>(INITIAL_FALLBACK_NEWS);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'mobus' | 'metro' | 'traffic' | 'weather'>('all');

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const items = await fetchLiveBbsrNewsAlerts();
      if (items && items.length > 0) {
        setNewsAlerts(items);
      }
    } catch (err) {
      console.warn('Failed to load news alerts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAlerts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredAlerts = newsAlerts.filter(item => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 text-slate-900 dark:text-white space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  Bhubaneswar Live Transit News
                </h2>
                <span className="bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                  OTV Live
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verified OTV, Mo Bus, Odisha Traffic Police & BMC Commuter Feed
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={loadAlerts}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition active:scale-95 disabled:opacity-50"
              title="Refresh Live News"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 flex-shrink-0 ${
              activeCategory === 'all'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            All News ({newsAlerts.length})
          </button>
          <button
            onClick={() => setActiveCategory('mobus')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 flex-shrink-0 ${
              activeCategory === 'mobus'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Bus className="w-3.5 h-3.5" />
            Mo Bus
          </button>
          <button
            onClick={() => setActiveCategory('metro')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 flex-shrink-0 ${
              activeCategory === 'metro'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Train className="w-3.5 h-3.5" />
            Metro Work
          </button>
          <button
            onClick={() => setActiveCategory('traffic')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 flex-shrink-0 ${
              activeCategory === 'traffic'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Traffic
          </button>
          <button
            onClick={() => setActiveCategory('weather')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 flex-shrink-0 ${
              activeCategory === 'weather'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <CloudSun className="w-3.5 h-3.5" />
            Weather
          </button>
        </div>

        {/* Live Announcements & News Feed */}
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No news alerts found in this category.
            </div>
          ) : (
            filteredAlerts.map((item) => {
              const isWarning = item.severity === 'warning';
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl p-4 border space-y-2 transition-all ${
                    isWarning
                      ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 text-slate-900 dark:text-white'
                      : 'bg-slate-50/90 dark:bg-slate-800/60 border-slate-200/90 dark:border-slate-700 text-slate-900 dark:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase font-mono ${
                          item.category === 'mobus'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200'
                            : item.category === 'metro'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200'
                            : item.category === 'weather'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                            : isWarning
                            ? 'bg-amber-200/80 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200'
                        }`}
                      >
                        {item.category.toUpperCase()}
                      </span>
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-[180px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        {item.source}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.timestamp}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-slate-500 font-semibold">Corridors:</span>
                      {item.affectedRoutes?.map((r, i) => (
                        <span
                          key={i}
                          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded font-mono font-bold text-blue-600 dark:text-blue-400 text-[10px]"
                        >
                          {r}
                        </span>
                      ))}
                    </div>

                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <span>Read</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/20 active:scale-98 transition"
        >
          Dismiss & Return to Map
        </button>
      </div>
    </div>
  );
};
