import React, { useState } from 'react';
import {
  Users, ThumbsUp, Award, Plus, MapPin, Bell, ShieldAlert,
  Map, List, BarChart3, Clock, CheckCircle2
} from 'lucide-react';
import { useCommunityStore, CommunityReport, ReportCategory } from '../../services/communityReportsService';
import { ReportIncidentDrawer } from './ReportIncidentDrawer';
import { IncidentDetailsModal } from './IncidentDetailsModal';
import { CommunityPolls } from './CommunityPolls';
import { LiveIncidentMap } from './LiveIncidentMap';

interface CommunityHubProps {
  onNavigateToMap?: () => void;
}

type TabView = 'feed' | 'map' | 'polls' | 'my_reports' | 'resolved';

export const CommunityHubView: React.FC<CommunityHubProps> = ({ onNavigateToMap }) => {
  const store = useCommunityStore();
  
  const [activeTab, setActiveTab] = useState<TabView>('feed');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isReportDrawerOpen, setIsReportDrawerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<CommunityReport | null>(null);

  // Filter Logic
  const filteredReports = store.reports.filter(r => {
    if (activeTab === 'resolved' && r.status !== 'resolved') return false;
    if (activeTab === 'my_reports' && r.reporterName !== 'You (Verified Citizen)') return false;
    if (activeTab === 'feed' && r.status === 'resolved') return false; // Hide resolved from active feed

    if (selectedFilter !== 'all' && r.category !== selectedFilter) return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 overflow-y-auto pb-16">
      
      {/* 1. Header Banner */}
      <div className="p-4 md:p-6 bg-gradient-to-r from-purple-800 via-indigo-800 to-blue-800 text-white rounded-3xl m-3 md:m-5 shadow-xl shadow-purple-800/20 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-2">
              <Users className="w-3.5 h-3.5 text-amber-300" />
              <span>Civic Voice & Commuter Network</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight">
              Community Transit Hub & Citizen Reporting
            </h1>
            <p className="text-purple-100 text-xs md:text-sm mt-1 max-w-xl font-medium">
              Report issues, follow live emergency maps, and earn Civic Karma points.
            </p>
          </div>

          <button
            onClick={() => setIsReportDrawerOpen(true)}
            className="px-5 py-3 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-900 font-black text-xs rounded-2xl shadow-lg transition flex items-center gap-2 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Report Transit Issue</span>
          </button>
        </div>
      </div>

      {/* 2. Top Navigation Tabs */}
      <div className="px-3 md:px-5 mb-5 flex overflow-x-auto hide-scrollbar gap-2 shrink-0">
        {[
          { id: 'feed', icon: <List className="w-4 h-4" />, label: 'Live Feed' },
          { id: 'map', icon: <Map className="w-4 h-4" />, label: 'Incident Map' },
          { id: 'polls', icon: <BarChart3 className="w-4 h-4" />, label: 'Community Polls' },
          { id: 'my_reports', icon: <Clock className="w-4 h-4" />, label: 'My Reports' },
          { id: 'resolved', icon: <CheckCircle2 className="w-4 h-4" />, label: 'Resolved' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabView)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-purple-300'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Area Alert (Only on Feed) */}
      {activeTab === 'feed' && (
        <div className="px-3 md:px-5 mb-4 shrink-0">
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-2xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Jayadev Vihar Area Alerts</h4>
                <p className="text-[10px] text-slate-500">Get notified about severe disruptions near you.</p>
              </div>
            </div>
            <button className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-lg shadow-sm">
              Follow Area
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Content Grid */}
      <div className="px-3 md:px-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left 2 Columns: Dynamic Content based on Active Tab */}
        <div className="lg:col-span-2 space-y-4">
          
          {(activeTab === 'feed' || activeTab === 'my_reports' || activeTab === 'resolved') && (
            <>
              {/* Category Filter Chips */}
              <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                {[
                  { id: 'all', label: 'All Incidents' },
                  { id: 'overcrowding', label: '🚨 Overcrowding' },
                  { id: 'poor_lighting', label: '💡 Poor Lighting' },
                  { id: 'waterlogging', label: '🌧️ Waterlogging' },
                  { id: 'damaged_shelter', label: '🚏 Bus Shelter' },
                  { id: 'road_blockage', label: '🚧 Blockage' },
                  { id: 'safety_concern', label: '🛡️ Safety' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFilter(f.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-[11px] font-extrabold transition flex-shrink-0 ${
                      selectedFilter === f.id
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Feed Cards */}
              <div className="space-y-3">
                {filteredReports.length === 0 ? (
                  <div className="text-center p-10 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                    <h3 className="font-bold text-slate-700 dark:text-slate-300">No reports found</h3>
                    <p className="text-xs text-slate-500 mt-1">Try changing the category filter or check another tab.</p>
                  </div>
                ) : (
                  filteredReports.map((report) => (
                    <div
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className="bg-white dark:bg-slate-900 p-4 md:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition hover:border-purple-300 dark:hover:border-purple-800 cursor-pointer group relative overflow-hidden"
                    >
                      {/* Emergency Indicator Bar */}
                      {report.severity === 'emergency' && (
                        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-rose-500 animate-pulse" />
                      )}

                      <div className="flex justify-between items-start gap-2 pl-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            report.category === 'overcrowding' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                            report.category === 'poor_lighting' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                            report.category === 'waterlogging' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                            report.category === 'safety_concern' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                            'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                          }`}>
                            {report.category.replace('_', ' ')}
                          </span>

                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            report.status === 'resolved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                            report.status === 'verified_by_crut' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' :
                            report.status === 'in_progress' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {report.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-medium shrink-0">{report.reportedAt}</span>
                      </div>

                      <div className="pl-1">
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {report.title}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed line-clamp-2">
                          {report.description}
                        </p>
                      </div>

                      {report.photoUrl && (
                        <div className="pl-1 pt-1">
                          <img 
                            src={report.photoUrl} 
                            alt="Attached Evidence" 
                            className="w-full max-h-48 object-cover rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs"
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium pl-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>{report.locationName}</span>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between pl-1">
                        <div className="text-[11px] text-slate-400">
                          By <span className="font-bold text-slate-700 dark:text-slate-200">{report.reporterName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-[11px] bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{report.upvotes} Upvotes</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {activeTab === 'map' && (
            <LiveIncidentMap 
              reports={store.reports.filter(r => r.status !== 'resolved')} 
              onReportClick={setSelectedReport} 
            />
          )}

          {activeTab === 'polls' && (
            <CommunityPolls 
              polls={store.polls} 
              onVote={store.voteOnPoll} 
            />
          )}

        </div>

        {/* Right Column: Civic Karma Leaderboard & Rewards */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 sticky top-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">Civic Karma</h3>
                  <div className="text-[10px] text-slate-400 font-bold">Top Contributors</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-purple-600 dark:text-purple-400 leading-none">
                  {store.userKarma}
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase">Your Pts</div>
              </div>
            </div>

            <div className="space-y-3">
              {store.leaderboard.map((user) => (
                <div
                  key={user.rank}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 font-black text-xs text-slate-400">#{user.rank}</span>
                    <span className="text-xl">{user.avatar}</span>
                    <div>
                      <div className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-1">
                        {user.name}
                        {user.trustScore > 90 && <ShieldAlert className="w-3 h-3 text-emerald-500" />}
                      </div>
                      <div className="text-[9px] text-purple-600 dark:text-purple-400 font-bold">{user.badge}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-xs text-amber-500">{user.karmaPoints} pts</div>
                    <div className="text-[9px] text-slate-400 font-medium">Trust: {user.trustScore}%</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-2xl text-center space-y-1 mt-2">
              <div className="text-xs font-black text-purple-700 dark:text-purple-300">Earn Free Bus Passes</div>
              <div className="text-[10px] text-slate-500">Reach 500 Civic Karma points to unlock a 50% discount Monthly Transit Pass!</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals & Drawers */}
      {isReportDrawerOpen && (
        <ReportIncidentDrawer
          onClose={() => setIsReportDrawerOpen(false)}
          onSubmit={(reportData) => {
            store.addReport(reportData);
            setIsReportDrawerOpen(false);
          }}
          onDuplicateWarning={store.checkDuplicateReport ? (cat, lat, lng) => store.checkDuplicateReport(cat, lat, lng) !== null : undefined}
        />
      )}

      {selectedReport && (
        <IncidentDetailsModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onUpvote={(id) => {
            store.upvoteReport(id);
            // Update local state instantly for UI reaction
            setSelectedReport({
              ...selectedReport,
              upvotes: selectedReport.hasUpvoted ? selectedReport.upvotes - 1 : selectedReport.upvotes + 1,
              hasUpvoted: !selectedReport.hasUpvoted
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
