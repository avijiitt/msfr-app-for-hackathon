import React, { useState } from 'react';
import {
  Users,
  Star,
  List,
  MapPin,
  BarChart3,
  Clock,
  Trophy,
  Bell,
  SlidersHorizontal,
  Plus,
  ShieldAlert,
  ChevronDown,
  Map as MapIcon,
  Layers,
  Crosshair,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useCommunityStore, CommunityReport } from '../../services/communityReportsService';
import { ReportIncidentDrawer } from './ReportIncidentDrawer';
import { IncidentDetailsModal } from './IncidentDetailsModal';
import { CommunityPolls } from './CommunityPolls';
import { LiveIncidentMap } from './LiveIncidentMap';

interface CommunityHubProps {
  onNavigateToMap?: () => void;
}

type TabView = 'feed' | 'map' | 'polls' | 'my_reports' | 'leaderboard';

// Custom Map Marker Icons matching mockup exactly
const createPinIcon = (bgColor: string, emoji: string) => {
  return L.divIcon({
    className: 'custom-civic-pin',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: ${bgColor};
        border: 2px solid #ffffff;
        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
      ">
        ${emoji}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const overcrowdingIcon = createPinIcon('#e11d48', '👥');
const poorLightingIcon = createPinIcon('#f59e0b', '💡');
const waterloggingIcon = createPinIcon('#0284c7', '🌧️');
const busDelayIcon = createPinIcon('#10b981', '🚌');

interface TopReporter {
  rank: number;
  name: string;
  points: number;
  avatarUrl: string;
  badgeColor?: string;
  ribbon?: string;
}

const DEFAULT_TOP_REPORTERS: TopReporter[] = [
  {
    rank: 1,
    name: 'Ananya Sahoo',
    points: 120,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    badgeColor: 'border-amber-400 text-amber-400',
    ribbon: '🏅',
  },
  {
    rank: 2,
    name: 'Rakesh Nayak',
    points: 85,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    badgeColor: 'border-slate-400 text-slate-300',
    ribbon: '🥈',
  },
  {
    rank: 3,
    name: 'Subhashree Das',
    points: 60,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
    badgeColor: 'border-amber-600 text-amber-500',
    ribbon: '🥉',
  },
];

export const CommunityHubView: React.FC<CommunityHubProps> = ({ onNavigateToMap }) => {
  const store = useCommunityStore();
  
  const [activeTab, setActiveTab] = useState<TabView>('feed');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isReportDrawerOpen, setIsReportDrawerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<CommunityReport | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isFullscreenMapOpen, setIsFullscreenMapOpen] = useState(false);

  const [topReporters, setTopReporters] = useState<TopReporter[]>(() => {
    try {
      const cached = localStorage.getItem('musafir_top_reporters_v2');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_TOP_REPORTERS;
  });

  const handleReportSubmit = (reportData: any) => {
    store.addReport(reportData);
    setIsReportDrawerOpen(false);

    const reporterName = reportData.reporterName || 'You (Verified Citizen)';
    setTopReporters((prev) => {
      const updated = [...prev];
      const existingIdx = updated.findIndex(
        (r) => r.name.trim().toLowerCase() === reporterName.trim().toLowerCase()
      );

      if (existingIdx >= 0) {
        updated[existingIdx] = {
          ...updated[existingIdx],
          points: updated[existingIdx].points + 35,
        };
      } else {
        updated.push({
          rank: updated.length + 1,
          name: reporterName,
          points: 45,
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
        });
      }

      updated.sort((a, b) => b.points - a.points);
      const ranked = updated.map((r, i) => ({
        ...r,
        rank: i + 1,
        badgeColor:
          i === 0
            ? 'border-amber-400 text-amber-400'
            : i === 1
            ? 'border-slate-400 text-slate-300'
            : i === 2
            ? 'border-amber-600 text-amber-500'
            : 'border-purple-500 text-purple-400',
        ribbon: i === 0 ? '🏅' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🎖️',
      }));

      try {
        localStorage.setItem('musafir_top_reporters_v2', JSON.stringify(ranked));
      } catch {}
      return ranked;
    });
  };

  // Filter Logic
  const filteredReports = store.reports.filter(r => {
    if (activeTab === 'my_reports') {
      const currentName = r.reporterName?.toLowerCase() || '';
      if (!currentName.includes('you') && !currentName.includes('avijeet')) return false;
    }
    if (selectedFilter === 'overcrowding' && r.category !== 'overcrowding') return false;
    if (selectedFilter === 'poor_lighting' && r.category !== 'poor_lighting') return false;
    if (selectedFilter === 'waterlogging' && r.category !== 'waterlogging') return false;
    if (selectedFilter === 'bus_delays' && r.category !== 'bus_delayed_cancelled') return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col min-h-full bg-[#080C16] text-white p-3 sm:p-5 md:p-6 overflow-y-auto pb-24 font-sans">
      
      {/* ─── 1. TOP HEADER (Exact matching mockup) ─── */}
      <div className="bg-gradient-to-r from-[#170F33] via-[#1E1442] to-[#121132] border border-purple-900/40 rounded-3xl p-4 sm:p-6 flex items-center justify-between shadow-2xl relative overflow-hidden shrink-0 mb-4">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-inner flex-shrink-0">
            <Users className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-black uppercase tracking-wider text-white">
              CIVIC COMMUNITY
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/80 font-medium">
              Voice of the City. Power of Citizens.
            </p>
          </div>
        </div>

        {/* Right Star Karma Badge */}
        <div className="bg-[#121A33]/90 border border-slate-700/60 backdrop-blur-md rounded-2xl px-3.5 py-2 sm:px-5 sm:py-2.5 flex items-center gap-3 shadow-lg relative z-10 flex-shrink-0">
          <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
          <div className="text-right sm:text-left">
            <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium leading-none">
              Your Civic Karma
            </div>
            <div className="text-xs sm:text-base font-black text-white mt-0.5">
              {store.userKarma || 320} Points
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. TOP NAVIGATION TABS (Exact matching mockup) ─── */}
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 mb-4 shrink-0">
        {[
          { id: 'feed', icon: <List className="w-4 h-4" />, label: 'Live Feed' },
          { id: 'map', icon: <MapIcon className="w-4 h-4" />, label: 'Incident Map' },
          { id: 'polls', icon: <BarChart3 className="w-4 h-4" />, label: 'Community Polls' },
          { id: 'my_reports', icon: <Clock className="w-4 h-4" />, label: 'My Reports' },
          { id: 'leaderboard', icon: <Trophy className="w-4 h-4" />, label: 'Leaderboard' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabView)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-[#7C3AED] text-white shadow-lg shadow-purple-900/50'
                  : 'bg-[#101528] text-slate-400 hover:text-white border border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── 3. TAB 1: LIVE FEED VIEW (Mockup 2-column layout) ─── */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          
          {/* Jayadev Vihar Area Alerts Banner */}
          <div className="bg-[#0B152B] border border-blue-900/50 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-white">
                  Jayadev Vihar Area Alerts
                </h4>
                <p className="text-[11px] text-slate-400">
                  Get notified about severe disruptions near you.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer flex-shrink-0 active:scale-95 ${
                notificationsEnabled
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#10182E] hover:bg-[#162242] text-slate-200 border border-slate-700'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{notificationsEnabled ? 'Notifications On' : 'Enable Notifications'}</span>
            </button>
          </div>

          {/* Filter Chips Bar */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto hide-scrollbar pb-1">
            <div className="flex items-center gap-2">
              {[
                { id: 'all', label: 'All Incidents' },
                { id: 'overcrowding', label: '🚨 Overcrowding' },
                { id: 'poor_lighting', label: '💡 Poor Lighting' },
                { id: 'waterlogging', label: '🌧️ Waterlogging' },
                { id: 'bus_delays', label: '🚌 Bus Delays' },
              ].map((chip) => {
                const isSelected = selectedFilter === chip.id;
                return (
                  <button
                    key={chip.id}
                    onClick={() => setSelectedFilter(chip.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-900/40'
                        : 'bg-[#101528] text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setSelectedFilter('all')}
              className="bg-[#101528] text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer flex-shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span>Filters</span>
            </button>
          </div>

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* ── LEFT COLUMN: INCIDENT FEED (7 Cols) ── */}
            <div className="lg:col-span-7 space-y-3.5">
              {filteredReports.slice(0, visibleCount).map((report) => {
                // Determine badge styles exactly matching mockup
                const isOvercrowd = report.category === 'overcrowding';
                const isLighting = report.category === 'poor_lighting';
                const isWaterlogging = report.category === 'waterlogging';
                const isBusDelay = report.category === 'bus_delayed_cancelled';

                const categoryLabel = isOvercrowd
                  ? 'OVERCROWDING'
                  : isLighting
                  ? 'POOR LIGHTING'
                  : isWaterlogging
                  ? 'WATERLOGGING'
                  : isBusDelay
                  ? 'BUS DELAY'
                  : report.category.replace('_', ' ').toUpperCase();

                const categoryBadgeClass = isOvercrowd
                  ? 'bg-[#450A0A] text-[#F87171] border border-[#7F1D1D]'
                  : isLighting
                  ? 'bg-[#451A03] text-[#FBBF24] border border-[#78350F]'
                  : isWaterlogging
                  ? 'bg-[#082F49] text-[#38BDF8] border border-[#0369A1]'
                  : 'bg-[#064E3B] text-[#34D399] border border-[#065F46]';

                const statusLabel = report.status === 'verified_by_crut'
                  ? 'verified by crut'
                  : report.status === 'investigating'
                  ? 'investigating'
                  : report.status === 'resolved'
                  ? 'resolved'
                  : 'verified';

                const statusBadgeClass = report.status === 'investigating'
                  ? 'bg-slate-800 text-slate-300 border border-slate-700'
                  : 'bg-[#2E1065] text-[#C084FC] border border-[#581C87]';

                return (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className="bg-[#0D1527] border border-slate-800/90 rounded-3xl p-4 sm:p-5 hover:border-purple-500/40 transition-all cursor-pointer group shadow-md"
                  >
                    {/* Top Badges */}
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${categoryBadgeClass}`}>
                        {categoryLabel}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${statusBadgeClass}`}>
                        {statusLabel}
                      </span>
                    </div>

                    {/* Middle Content + Thumbnail */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-black text-white group-hover:text-purple-300 transition-colors leading-snug">
                          {report.title}
                        </h3>
                        <p className="text-xs text-slate-300/90 mt-1 leading-relaxed line-clamp-2">
                          {report.description}
                        </p>
                        
                        {/* Location */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                          <span className="truncate">{report.locationName}</span>
                        </div>
                      </div>

                      {/* Right Thumbnail */}
                      {report.photoUrl && (
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-slate-700/60 flex-shrink-0 relative">
                          <img
                            src={report.photoUrl}
                            alt={report.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {/* 40+ badge on overcrowding card matching mockup */}
                          {isOvercrowd && (
                            <div className="absolute bottom-1.5 right-1.5 bg-[#4C1D95]/90 backdrop-blur-sm text-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-purple-500/30">
                              <Users className="w-2.5 h-2.5" />
                              <span>40+</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-slate-400 mt-3.5 pt-2.5 border-t border-slate-800/60">
                      <div>
                        By <span className="text-slate-200 font-bold">{report.reporterName}</span>
                      </div>
                      <div className="font-mono text-slate-400">{report.reportedAt}</div>
                    </div>
                  </div>
                );
              })}

              {/* Load More Button matching mockup */}
              {visibleCount < filteredReports.length && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + 3)}
                    className="w-full py-3 rounded-2xl bg-[#0D1527] hover:bg-slate-800/70 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <ChevronDown className="w-4 h-4" />
                    <span>Load More Incidents</span>
                  </button>
                </div>
              )}
            </div>

            {/* ── RIGHT COLUMN: WIDGETS (5 Cols) ── */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Widget 1: Live Incident Map matching mockup */}
              <div className="bg-[#0D1527] border border-slate-800 rounded-3xl p-4 overflow-hidden shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span>Live Incident Map</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsFullscreenMapOpen(true)}
                    className="text-xs font-bold text-purple-400 hover:text-purple-300 hover:underline cursor-pointer"
                  >
                    View Fullscreen
                  </button>
                </div>

                {/* Map Preview */}
                <div className="w-full h-56 rounded-2xl overflow-hidden relative border border-slate-800">
                  <MapContainer
                    center={[20.3150, 85.8200]}
                    zoom={12}
                    className="w-full h-full z-0"
                    zoomControl={false}
                  >
                    <TileLayer
                      url="https://mt1.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}"
                      attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
                      maxZoom={19}
                    />

                    {/* Bhubaneswar Hotspot Pins matching screenshot */}
                    <Marker position={[20.3039, 85.8188]} icon={overcrowdingIcon}>
                      <Popup>
                        <div className="text-xs font-bold text-slate-900 p-1">
                          <span className="text-rose-600 font-extrabold block">🚨 Overcrowding</span>
                          <span>Jayadev Vihar Mo Bus Stand</span>
                        </div>
                      </Popup>
                    </Marker>

                    <Marker position={[20.3567, 85.8166]} icon={poorLightingIcon}>
                      <Popup>
                        <div className="text-xs font-bold text-slate-900 p-1">
                          <span className="text-amber-600 font-extrabold block">💡 Poor Lighting</span>
                          <span>Patia Railway Station Walkway</span>
                        </div>
                      </Popup>
                    </Marker>

                    <Marker position={[20.3700, 85.8250]} icon={waterloggingIcon}>
                      <Popup>
                        <div className="text-xs font-bold text-slate-900 p-1">
                          <span className="text-blue-600 font-extrabold block">🌧️ Waterlogging</span>
                          <span>Nandankanan Road near Trisulia</span>
                        </div>
                      </Popup>
                    </Marker>

                    <Marker position={[20.2588, 85.7865]} icon={busDelayIcon}>
                      <Popup>
                        <div className="text-xs font-bold text-slate-900 p-1">
                          <span className="text-emerald-600 font-extrabold block">🚌 Bus Delay</span>
                          <span>Khandagiri Junction</span>
                        </div>
                      </Popup>
                    </Marker>

                    <Marker position={[20.3541, 85.8175]} icon={busDelayIcon}>
                      <Popup>
                        <div className="text-xs font-bold text-slate-900 p-1">
                          <span className="text-emerald-600 font-extrabold block">🚌 Mo Bus Hub</span>
                          <span>KIIT Square</span>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>

                  {/* Layer / Center buttons on map matching screenshot */}
                  <div className="absolute right-2 bottom-2 z-[1000] flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsFullscreenMapOpen(true)}
                      className="w-8 h-8 rounded-xl bg-slate-950/80 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center backdrop-blur-sm cursor-pointer"
                      title="Fullscreen"
                    >
                      <Layers className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {}}
                      className="w-8 h-8 rounded-xl bg-slate-950/80 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center backdrop-blur-sm cursor-pointer"
                      title="Recenter"
                    >
                      <Crosshair className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Map Legend matching mockup footer */}
                <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold pt-1 px-1">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                    <span>Overcrowding</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                    <span>Poor Lighting</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                    <span>Waterlogging</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    <span>Bus Delay</span>
                  </div>
                </div>
              </div>

              {/* Widget 2: Make a Report matching mockup */}
              <div className="bg-[#0D1527] border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-lg space-y-3">
                <div>
                  <h3 className="text-sm font-black text-white">Make a Report</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Help your city. Report issues in your area.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsReportDrawerOpen(true)}
                  className="w-full py-3 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black text-sm shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Report an Issue</span>
                </button>
              </div>

              {/* Widget 3: Top Reporters This Week matching mockup */}
              <div className="bg-[#0D1527] border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-lg space-y-3.5">
                <h3 className="text-sm font-black text-white">Top Reporters This Week</h3>

                <div className="space-y-3">
                  {topReporters.map((user) => (
                    <div
                      key={`${user.rank}-${user.name}`}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-[#11192E]/60 border border-slate-800/80 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        {/* Rank Circle */}
                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center font-black text-xs ${user.badgeColor || 'border-purple-500 text-purple-400'}`}
                        >
                          {user.rank}
                        </div>

                        {/* Avatar photo */}
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-700"
                        />

                        {/* Name */}
                        <span className="font-bold text-xs text-white">{user.name}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400 font-bold">
                          {user.points} Points
                        </span>
                        <span className="text-base">{user.ribbon || '🎖️'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: INCIDENT MAP VIEW ─── */}
      {activeTab === 'map' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-white">Full City Incident Radar</h2>
            <button
              onClick={() => setIsReportDrawerOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#7C3AED] text-white font-black text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Report Incident</span>
            </button>
          </div>
          <LiveIncidentMap
            reports={store.reports.filter((r) => r.status !== 'resolved')}
            onReportClick={setSelectedReport}
          />
        </div>
      )}

      {/* ─── TAB 3: COMMUNITY POLLS VIEW ─── */}
      {activeTab === 'polls' && (
        <div className="space-y-4">
          <CommunityPolls polls={store.polls} onVote={store.voteOnPoll} />
        </div>
      )}

      {/* ─── TAB 4: MY REPORTS VIEW ─── */}
      {activeTab === 'my_reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-white">Your Submitted Reports</h2>
              <p className="text-xs text-slate-400">Track status updates and civic reward points.</p>
            </div>
            <button
              onClick={() => setIsReportDrawerOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#7C3AED] text-white font-black text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Report</span>
            </button>
          </div>

          {filteredReports.length === 0 ? (
            <div className="text-center p-12 bg-[#0D1527] rounded-3xl border border-slate-800 space-y-3">
              <ShieldAlert className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="font-bold text-slate-300">No reports submitted yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Spot broken streetlights, waterlogging, or severe bus crowding? Submit your first report and earn 25 Civic Karma points!
              </p>
              <button
                onClick={() => setIsReportDrawerOpen(true)}
                className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black rounded-xl cursor-pointer"
              >
                Report Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className="bg-[#0D1527] border border-slate-800 rounded-3xl p-4 cursor-pointer hover:border-purple-500/50 transition space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-purple-400">
                      {report.category}
                    </span>
                    <span className="text-xs text-slate-400">{report.reportedAt}</span>
                  </div>
                  <h4 className="font-bold text-sm text-white">{report.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{report.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 5: LEADERBOARD VIEW ─── */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4">
          <div className="bg-[#0D1527] border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-black text-white">Full Civic Karma Leaderboard</h2>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Your Score: </span>
                <span className="text-sm font-black text-purple-400">{store.userKarma || 320} Pts</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {store.leaderboard.map((user) => (
                <div
                  key={user.rank}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#11192E]/70 border border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-black text-sm text-slate-400 w-5">#{user.rank}</span>
                    <span className="text-2xl">{user.avatar}</span>
                    <div>
                      <div className="font-bold text-xs text-white flex items-center gap-1.5">
                        <span>{user.name}</span>
                        {user.trustScore > 90 && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-purple-400 font-semibold">{user.badge}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-black text-amber-400">{user.karmaPoints} pts</div>
                    <div className="text-[10px] text-slate-500 font-medium">Trust: {user.trustScore}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── FULLSCREEN INCIDENT MAP MODAL ─── */}
      {isFullscreenMapOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex flex-col p-3 sm:p-6 animate-in fade-in">
          <div className="bg-[#0C1322] border border-slate-800 rounded-3xl flex-1 flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
                <h3 className="text-sm font-black text-white">Live Incident Map (Bhubaneswar Transit Radar)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFullscreenMapOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 w-full h-full relative">
              <LiveIncidentMap
                reports={store.reports.filter((r) => r.status !== 'resolved')}
                onReportClick={(r) => {
                  setIsFullscreenMapOpen(false);
                  setSelectedReport(r);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── DRAWERS & MODALS ─── */}
      {isReportDrawerOpen && (
        <ReportIncidentDrawer
          onClose={() => setIsReportDrawerOpen(false)}
          onSubmit={handleReportSubmit}
          onDuplicateWarning={store.checkDuplicateReport ? (cat, lat, lng) => store.checkDuplicateReport(cat, lat, lng) !== null : undefined}
        />
      )}

      {selectedReport && (
        <IncidentDetailsModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onUpvote={(id) => {
            store.upvoteReport(id);
            setSelectedReport({
              ...selectedReport,
              upvotes: selectedReport.hasUpvoted ? selectedReport.upvotes - 1 : selectedReport.upvotes + 1,
              hasUpvoted: !selectedReport.hasUpvoted,
            });
          }}
          onAttachPhoto={(id, photoUrl) => {
            store.attachPhotoToReport(id, photoUrl);
            setSelectedReport({
              ...selectedReport,
              photoUrl,
            });
          }}
        />
      )}
    </div>
  );
};
