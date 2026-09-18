import React from 'react';
import { CheckCircle2, Sparkles, Bot, MapPin, FileText, AlertCircle } from 'lucide-react';
import { CommunityPoll } from '../../services/communityReportsService';

interface CommunityPollsProps {
  polls: CommunityPoll[];
  onVote: (pollId: string, optionId: string) => void;
}

export const CommunityPolls: React.FC<CommunityPollsProps> = ({ polls, onVote }) => {
  return (
    <div className="space-y-4">
      {/* 100% Autonomous AI Civic Consensus Engine Header */}
      <div className="bg-gradient-to-r from-[#170F33] via-[#211145] to-[#121338] border border-purple-800/50 rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-56 h-56 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-600/30 border border-purple-500/40 text-[10px] sm:text-xs font-black uppercase tracking-wider text-purple-300">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>100% Autonomous AI Consensus Engine</span>
          </div>

          <h3 className="text-base sm:text-xl font-black text-white">
            AI Consensus Polls (Auto-Generated from Registered Reports)
          </h3>

          <p className="text-xs sm:text-sm text-purple-200/90 max-w-2xl leading-relaxed">
            Citizens do not need to create polls. As complaints (potholes, waterlogging, overcrowding, dark walkways) are registered across the city, our AI autonomously synthesizes public consensus polls to measure citizen priority before municipal dispatch.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <span className="text-[10px] sm:text-xs font-bold px-3 py-1 rounded-xl bg-purple-950/70 border border-purple-800/60 text-purple-300 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              <span>{polls.length} Autonomous AI Polls Synchronized</span>
            </span>
            <span className="text-[10px] sm:text-xs font-bold px-3 py-1 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Real-Time Citizen Consensus Active</span>
            </span>
          </div>
        </div>
      </div>

      {/* AI Polls Feed */}
      {polls.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 bg-[#0D1527] rounded-3xl border border-slate-800 space-y-2">
          <Bot className="w-10 h-10 mb-1 opacity-60 text-purple-400 animate-bounce" />
          <p className="text-sm font-bold text-slate-300">AI is analyzing registered reports...</p>
          <p className="text-xs text-slate-500">Autonomous consensus polls will appear as complaints are submitted.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => (
            <div 
              key={poll.id} 
              className="bg-[#0D1527] rounded-3xl p-5 border border-purple-800/50 hover:border-purple-500/70 transition-all space-y-4 shadow-lg shadow-purple-950/20 group"
            >
              <div>
                {/* Meta Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-0.5 bg-gradient-to-r from-purple-900/80 to-indigo-900/80 text-purple-300 border border-purple-500/50 rounded-full shadow-xs">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      <span>AI Autonomous Poll</span>
                    </span>

                    {poll.sourceReportId && (
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-slate-800/80 text-slate-300 border border-slate-700/60 rounded-full flex items-center gap-1">
                        <FileText className="w-3 h-3 text-purple-400" />
                        <span>Source: Report #{poll.sourceReportId}</span>
                      </span>
                    )}

                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-blue-900/30 text-blue-400 border border-blue-800/50 rounded-full flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{poll.locationContext}</span>
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400 font-bold">
                    Ends in {poll.expiresInDays} days
                  </span>
                </div>

                {/* Linked Registered Incident Snippet */}
                {poll.sourceReportTitle && (
                  <div className="mb-2 p-2.5 rounded-2xl bg-[#11192E] border border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Registered Incident:</span>
                      <span className="text-xs font-bold text-white truncate">{poll.sourceReportTitle}</span>
                    </div>
                    {poll.registeredReportsCount && (
                      <span className="text-[10px] font-black text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-800/50 shrink-0">
                        ⚡ {poll.registeredReportsCount}+ Citizen Reports
                      </span>
                    )}
                  </div>
                )}

                {/* Poll Question */}
                <h3 className="font-extrabold text-sm sm:text-base text-white leading-snug group-hover:text-purple-200 transition-colors">
                  {poll.question}
                </h3>

                {/* AI Context Insight Box */}
                {poll.aiInsight && (
                  <div className="mt-2.5 p-3 rounded-2xl bg-purple-950/40 border border-purple-900/60 text-[11px] text-purple-200 leading-relaxed">
                    <strong className="font-black text-purple-300">🤖 AI Insight: </strong>
                    <span>{poll.aiInsight}</span>
                  </div>
                )}

                <p className="text-xs text-slate-400 mt-2 font-medium">
                  {poll.totalVotes.toLocaleString()} citizens have cast their consensus vote
                </p>
              </div>

              {/* Voting Options */}
              <div className="space-y-2.5">
                {poll.options.map((option) => {
                  const percentage = poll.totalVotes > 0 
                    ? Math.round((option.votes / poll.totalVotes) * 100) 
                    : 0;
                  const isSelected = poll.selectedOptionId === option.id;

                  return (
                    <button
                      key={option.id}
                      onClick={() => !poll.hasVoted && onVote(poll.id, option.id)}
                      disabled={poll.hasVoted}
                      className={`relative w-full text-left overflow-hidden rounded-2xl border transition-all cursor-pointer ${
                        poll.hasVoted 
                          ? isSelected 
                            ? 'border-purple-500 bg-purple-900/30 shadow-md'
                            : 'border-slate-800 bg-slate-900/60 opacity-60'
                          : 'border-slate-800 hover:border-purple-500 bg-slate-900/50 hover:bg-slate-800/70 active:scale-[0.99]'
                      }`}
                    >
                      {poll.hasVoted && (
                        <div 
                          className={`absolute top-0 left-0 bottom-0 transition-all duration-700 ${isSelected ? 'bg-purple-600/40' : 'bg-slate-700/30'}`} 
                          style={{ width: `${percentage}%` }}
                        />
                      )}
                      <div className="relative p-3.5 flex items-center justify-between z-10">
                        <span className={`text-xs font-bold ${isSelected ? 'text-purple-200 font-extrabold' : 'text-slate-200'}`}>
                          {option.text}
                        </span>
                        {poll.hasVoted && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black font-mono text-purple-300">
                              {percentage}%
                            </span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {poll.hasVoted && (
                <p className="text-center text-[11px] font-bold text-emerald-400 pt-1">
                  ✓ Consensus vote recorded! +5 Civic Karma Credited
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
