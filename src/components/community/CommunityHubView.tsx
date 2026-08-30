import React, { useState } from 'react';
import {
  Users,
  AlertTriangle,
  ThumbsUp,
  Award,
  Plus,
  CheckCircle2,
  Clock,
  MapPin,
  Camera,
  Filter,
  ShieldCheck,
  Send,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import {
  CommunityReport,
  INITIAL_COMMUNITY_REPORTS,
  CIVIC_LEADERBOARD,
  ReportCategory
} from '../../services/communityReportsService';

interface CommunityHubProps {
  onNavigateToMap?: () => void;
}

export const CommunityHubView: React.FC<CommunityHubProps> = ({ onNavigateToMap }) => {
  const [reports, setReports] = useState<CommunityReport[]>(INITIAL_COMMUNITY_REPORTS);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Form State
  const [category, setCategory] = useState<ReportCategory>('overcrowding');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('Jayadev Vihar Bus Bay #2, Bhubaneswar');
  const [severity, setSeverity] = useState<'low' | 'moderate' | 'critical'>('moderate');

  const handleUpvote = (id: string) => {
    setReports(reports.map(r => {
      if (r.id === id) {
        const isUpvoted = r.hasUpvoted;
        return {
          ...r,
          upvotes: isUpvoted ? r.upvotes - 1 : r.upvotes + 1,
          hasUpvoted: !isUpvoted,
        };
      }
      return r;
    }));
  };

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newReport: CommunityReport = {
      id: `cr-${Date.now()}`,
      category,
      title: title.trim(),
      description: description.trim(),
      locationName: locationName.trim(),
      lat: 20.3039,
      lng: 85.8188,
      reporterName: 'You (Verified Citizen)',
      reportedAt: 'Just now',
      upvotes: 1,
      hasUpvoted: true,
      status: 'investigating',
      severity,
    };

    setReports([newReport, ...reports]);
    setIsReportModalOpen(false);
    setTitle('');
    setDescription('');
  };

  const filteredReports = reports.filter(r => {
    if (selectedFilter === 'all') return true;
    return r.category === selectedFilter;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 overflow-y-auto pb-16">
      {/* 1. Header Banner */}
      <div className="p-4 md:p-6 bg-gradient-to-r from-purple-800 via-indigo-800 to-blue-800 text-white rounded-3xl m-3 md:m-5 shadow-xl shadow-purple-800/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-2">
              <Users className="w-3.5 h-3.5 text-amber-300" />
              <span>Civic Voice & Commuter Network</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight">
              Community Transit Hub & Citizen Incident Reporting
            </h1>
            <p className="text-purple-100 text-xs md:text-sm mt-1 max-w-xl font-medium">
              Report bus overcrowding, broken streetlights, waterlogging, or delays. Upvote live incidents and earn Civic Karma points.
            </p>
          </div>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="px-5 py-3 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-900 font-black text-xs rounded-2xl shadow-lg transition flex items-center gap-2 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Report Transit Issue</span>
          </button>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="px-3 md:px-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Columns: Live Incident Reports Feed */}
        <div className="lg:col-span-2 space-y-4">
          {/* Category Filter Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {[
              { id: 'all', label: 'All Incidents' },
              { id: 'overcrowding', label: '🚨 Overcrowding' },
              { id: 'poor_lighting', label: '💡 Poor Lighting' },
              { id: 'waterlogging', label: '🌧️ Waterlogging' },
              { id: 'damaged_shelter', label: '🚏 Bus Shelter' },
              { id: 'road_blockage', label: '🚧 Blockage' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition flex-shrink-0 ${
                  selectedFilter === f.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Incident Feed Cards */}
          <div className="space-y-3">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-white dark:bg-slate-900 p-4 md:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition hover:border-purple-300 dark:hover:border-purple-800"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      report.category === 'overcrowding' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                      report.category === 'poor_lighting' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                      report.category === 'waterlogging' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                      'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                    }`}>
                      {report.category.replace('_', ' ')}
                    </span>

                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      report.status === 'resolved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                      report.status === 'verified_by_crut' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {report.status === 'resolved' ? '✅ Resolved by BMC' : report.status === 'verified_by_crut' ? '🛡️ Verified by CRUT' : '⏳ Investigating'}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400 font-medium">{report.reportedAt}</span>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{report.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{report.description}</p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>{report.locationName}</span>
                </div>

                {/* Card Footer: Upvote & Reporter */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    Reported by <span className="font-bold text-slate-700 dark:text-slate-200">{report.reporterName}</span>
                  </div>

                  <button
                    onClick={() => handleUpvote(report.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-xs transition active:scale-95 ${
                      report.hasUpvoted
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Confirm / Upvote ({report.upvotes})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Civic Karma Leaderboard & Rewards */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <Award className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white">Civic Karma Leaderboard</h3>
                <div className="text-[10px] text-slate-400 font-bold">Top Verified Citizen Contributors</div>
              </div>
            </div>

            <div className="space-y-3">
              {CIVIC_LEADERBOARD.map((user) => (
                <div
                  key={user.rank}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 font-black text-xs text-slate-400">#{user.rank}</span>
                    <span className="text-xl">{user.avatar}</span>
                    <div>
                      <div className="font-black text-xs text-slate-900 dark:text-white">{user.name}</div>
                      <div className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">{user.badge}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-xs text-amber-500">{user.karmaPoints} pts</div>
                    <div className="text-[9px] text-slate-400">{user.verifiedHelpfulCount} helped</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-2xl text-center space-y-1">
              <div className="text-xs font-black text-purple-700 dark:text-purple-300">Earn Free Bus & Metro Passes</div>
              <div className="text-[10px] text-slate-500">Reach 500 Civic Karma points to unlock a 50% discount Monthly Transit Pass!</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. New Incident Report Modal Dialog */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-purple-600" />
                <h3 className="font-black text-sm text-slate-900 dark:text-white">Submit Incident Report</h3>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Incident Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ReportCategory)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-purple-500"
                >
                  <option value="overcrowding">🚨 Overcrowded Bus / Train / Stop</option>
                  <option value="poor_lighting">💡 Poor Lighting / Dark Street Spot</option>
                  <option value="waterlogging">🌧️ Waterlogging / Road Damage</option>
                  <option value="road_blockage">🚧 Road Blockage / Traffic Jam</option>
                  <option value="bus_delayed_cancelled">❌ Cancelled / Missing Bus</option>
                  <option value="damaged_shelter">🚏 Broken Bus Stop / Missing ETA</option>
                  <option value="safety_concern">🛡️ Safety Concern / Harassment Alert</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Issue Title</label>
                <input
                  type="text"
                  placeholder="e.g. Heavy overcrowding on Route 10 bus"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Description & Details</label>
                <textarea
                  rows={3}
                  placeholder="Describe what happened, bus number, or specific location..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-purple-500"
                  required
                ></textarea>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Location / Stop</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md transition"
                >
                  Publish Report (+25 Karma)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
