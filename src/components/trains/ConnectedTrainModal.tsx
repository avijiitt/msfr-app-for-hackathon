import React, { useState, useEffect } from 'react';
import {
  Train,
  X,
  Search,
  Clock,
  MapPin,
  Calendar,
  Share2,
  CheckCircle2,
  Bus,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import {
  fetchTrainSchedule,
  TrainScheduleData,
  BHUBANESWAR_CONNECTED_TRAINS,
  POPULAR_CONNECTED_TRAINS,
  ConnectedTrainSummary
} from '../../services/irctcTrainService';

interface ConnectedTrainModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTrainNo?: string;
  originStation?: string;
  onSelectStationForMap?: (stationName: string) => void;
}

export const ConnectedTrainModal: React.FC<ConnectedTrainModalProps> = ({
  isOpen,
  onClose,
  defaultTrainNo = '12936',
  originStation,
  onSelectStationForMap,
}) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'connected_list'>('schedule');
  const [trainInput, setTrainInput] = useState(defaultTrainNo);
  const [searchedTrainNo, setSearchedTrainNo] = useState(defaultTrainNo);
  const [scheduleData, setScheduleData] = useState<TrainScheduleData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSchedule(searchedTrainNo);
    }
  }, [isOpen, searchedTrainNo]);

  const loadSchedule = async (num: string) => {
    setIsLoading(true);
    try {
      const data = await fetchTrainSchedule(num);
      setScheduleData(data);
    } catch (err) {
      console.warn('Failed to load train schedule:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trainInput.trim()) {
      setSearchedTrainNo(trainInput.trim());
      setActiveTab('schedule');
    }
  };

  const handleQuickSelect = (num: string) => {
    setTrainInput(num);
    setSearchedTrainNo(num);
    setActiveTab('schedule');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `🚆 ${scheduleData?.train_name} (#${scheduleData?.train_number})\nRoute: ${scheduleData?.source_station} ➔ ${scheduleData?.dest_station}\nVerified on Musafir India Transit.`
      );
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="max-w-2xl w-full bg-slate-900 border border-amber-500/30 rounded-3xl p-5 sm:p-7 text-white shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Train className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  Indian Railways Live Schedule & Rail Connect
                </h2>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  IRCTC RapidAPI
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-Time Rail Stoppages, Live Timetable & Intermodal Mo Bus Transfers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 gap-2 mt-4 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800 text-xs font-extrabold">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'schedule'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Train Schedule (# {searchedTrainNo})</span>
          </button>
          <button
            onClick={() => setActiveTab('connected_list')}
            className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'connected_list'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Train className="w-4 h-4" />
            <span>Connected Trains (BBS / CTC)</span>
          </button>
        </div>

        {/* Search Input & Quick Selectors */}
        <div className="space-y-2 mt-3">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={trainInput}
                onChange={(e) => setTrainInput(e.target.value)}
                placeholder="Enter 5-digit Train No (e.g. 12936, 20836, 12074)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
            >
              {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Get Schedule</span>
            </button>
          </form>

          {/* Quick Select Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
            <span className="text-slate-400 text-[10px] font-bold uppercase whitespace-nowrap">Frequent:</span>
            {[
              { no: '12936', label: '12936 Surat Intercity' },
              { no: '20836', label: '20836 Vande Bharat (Puri-Rourkela)' },
              { no: '12074', label: '12074 Jan Shatabdi (BBS-HWH)' },
              { no: '12801', label: '12801 Purushottam Exp (NDLS)' },
              { no: '12822', label: '12822 Dhauli Exp' },
            ].map((t) => (
              <button
                key={t.no}
                type="button"
                onClick={() => handleQuickSelect(t.no)}
                className={`px-2.5 py-1 rounded-lg border font-mono font-bold whitespace-nowrap transition ${
                  searchedTrainNo === t.no
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-3">
          {activeTab === 'schedule' ? (
            scheduleData ? (
              <div className="space-y-3">
                {/* Train Summary Card */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-500 text-slate-950 font-mono font-black text-xs px-2 py-0.5 rounded-md">
                          #{scheduleData.train_number}
                        </span>
                        <span className="text-xs font-bold text-amber-400">
                          {scheduleData.train_type || 'Superfast Intercity'}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-extrabold text-white mt-1">
                        {scheduleData.train_name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {scheduleData.source_station} ➔ {scheduleData.dest_station}
                      </p>
                    </div>

                    <button
                      onClick={handleShare}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Share Train Details"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  {copiedNotification && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Train details copied to clipboard!</span>
                    </div>
                  )}

                  {/* Run Days */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-800/80 text-xs">
                    <span className="text-slate-400 font-semibold text-[11px]">Days of Run:</span>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                      const isActive = scheduleData.run_days.includes(day);
                      return (
                        <span
                          key={day}
                          className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                            isActive
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-900 text-slate-600 border border-slate-800 line-through'
                          }`}
                        >
                          {day}
                        </span>
                      );
                    })}
                  </div>

                  {/* Mo Bus Transfer Intermodal Hub Notice */}
                  <div className="bg-blue-950/40 border border-blue-800/60 rounded-xl p-3 flex items-start gap-2.5">
                    <Bus className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-200 leading-relaxed">
                      <strong className="text-white">Intermodal Mo Bus Transfers:</strong> Direct connections available with{' '}
                      <strong className="text-amber-300">Mo Bus Route 10 (Airport ➔ CDA Cuttack)</strong>,{' '}
                      <strong className="text-emerald-300">Route 11 (Cuttack Trunk)</strong>, and{' '}
                      <strong className="text-blue-300">Route 16</strong> at Master Canteen / Central Station Terminal bays.
                    </div>
                  </div>
                </div>

                {/* Stoppage Table */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="bg-slate-800/60 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                    <span>Stoppage & Station</span>
                    <div className="flex items-center gap-6 pr-2">
                      <span>Arr / Dep</span>
                      <span>Platform</span>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-800/50 max-h-[340px] overflow-y-auto">
                    {scheduleData.route.map((stn, idx) => (
                      <div
                        key={`${stn.station_code}-${idx}`}
                        className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-800/30 transition text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-mono font-bold flex items-center justify-center">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="font-extrabold text-white flex items-center gap-1.5">
                              <span>{stn.station_name}</span>
                              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded">
                                {stn.station_code}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {stn.distance} km • Day {stn.day}
                              {stn.halt && stn.halt !== '0' ? ` • Halt: ${stn.halt} mins` : ''}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-right">
                          <div className="font-mono text-xs">
                            <span className="text-emerald-400 font-bold">{stn.sta}</span>
                            <span className="text-slate-500 mx-1">/</span>
                            <span className="text-amber-400 font-bold">{stn.std}</span>
                          </div>
                          <div className="w-8 text-center font-mono font-bold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">
                            {stn.platform || '1'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                Enter train number or select from chips above to load schedule.
              </div>
            )
          ) : (
            /* Connected Trains List */
            <div className="space-y-2.5">
              <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200">
                ⚡ <strong>Connected Trains from Bhubaneswar (BBS) & Cuttack (CTC):</strong> Direct intercity trains
                integrated with Mo Bus timetables for seamless transfers.
              </div>

              {BHUBANESWAR_CONNECTED_TRAINS.map((train) => (
                <div
                  key={train.trainNo}
                  onClick={() => handleQuickSelect(train.trainNo)}
                  className="bg-slate-950/80 border border-slate-800 hover:border-amber-400/50 rounded-2xl p-4 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-500 text-slate-950 font-mono font-black text-xs px-2 py-0.5 rounded-md">
                        #{train.trainNo}
                      </span>
                      <span className="text-[11px] font-bold text-amber-300">
                        {train.trainType}
                      </span>
                    </div>
                    <span className="text-xs font-black text-emerald-400">
                      ₹{train.fareInr}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-white">
                      {train.trainName}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {train.origin} ➔ {train.destination}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                    <div className="flex items-center gap-2 text-slate-300 font-mono">
                      <span>BBS Dep: <strong className="text-amber-300">{train.departureBBS}</strong></span>
                      <span>•</span>
                      <span>Arr: <strong className="text-emerald-300">{train.arrivalDest}</strong></span>
                    </div>
                    <span className="text-amber-400 hover:underline text-[11px] font-bold flex items-center gap-1">
                      View Schedule <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
