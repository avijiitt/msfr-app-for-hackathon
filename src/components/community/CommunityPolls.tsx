import React, { useState } from 'react';
import { PieChart, CheckCircle2, Sparkles, Loader2, Bot, TrendingUp } from 'lucide-react';
import { CommunityPoll } from '../../services/communityReportsService';

interface CommunityPollsProps {
  polls: CommunityPoll[];
  onVote: (pollId: string, optionId: string) => void;
  onGenerateAiPoll?: () => void;
}

export const CommunityPolls: React.FC<CommunityPollsProps> = ({ polls, onVote, onGenerateAiPoll }) => {
  const [filter, setFilter] = useState<'all' | 'ai' | 'official'>('all');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!onGenerateAiPoll) return;
    setIsGenerating(true);
    setTimeout(() => {
      onGenerateAiPoll();
      setIsGenerating(false);
    }, 1200);
  };

  const filteredPolls = polls.filter(p => {
    if (filter === 'ai') return p.isAiGenerated;
    if (filter === 'official') return !p.isAiGenerated;
    return true;
  });

  const aiCount = polls.filter(p => p.isAiGenerated).length;
  const officialCount = polls.filter(p => !p.isAiGenerated).length;

  return (
    <div className="space-y-4">
      {/* AI Polls Header Card */}
      <div className="bg-gradient-to-r from-[#1E113E] via-[#24144B] to-[#161238] border border-purple-800/50 rounded-3xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-600/30 border border-purple-500/40 text-[10px] font-black uppercase tracking-wider text-purple-300">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>AI Civic Consensus Engine</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white">
              AI-Generated Community Polls
            </h3>
            <p className="text-xs text-purple-200/80 max-w-xl">
              Polls automatically synthesized by AI analyzing real-time citizen pothole, waterlogging, overcrowding, and streetlight complaints.
            </p>
          </div>

          {onGenerateAiPoll && (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-4 py-3 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] text-white font-black text-xs shadow-lg shadow-purple-900/50 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 flex-shrink-0 disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Poll...</span>
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4 text-purple-200" />
                  <span>Generate New AI Poll (+10 Karma)</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-purple-900/40 overflow-x-auto hide-scrollbar">
          {[
            { id: 'all', label: `All Polls (${polls.length})` },
            { id: 'ai', label: `🤖 AI Generated (${aiCount})` },
            { id: 'official', label: `🏛️ Municipal Polls (${officialCount})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-white text-purple-950 shadow-md'
                  : 'bg-purple-950/40 text-purple-300 border border-purple-800/40 hover:bg-purple-900/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filteredPolls.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 bg-[#0D1527] rounded-3xl border border-slate-800">
          <PieChart className="w-10 h-10 mb-2 opacity-50 text-purple-400" />
          <p className="text-sm font-semibold text-slate-300">No active polls in this filter.</p>
          {onGenerateAiPoll && (
            <button
              onClick={handleGenerate}
              className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold"
            >
              Generate AI Poll Now
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPolls.map(poll => (
            <div 
              key={poll.id} 
              className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border transition-all space-y-4 shadow-sm ${
                poll.isAiGenerated 
                  ? 'border-purple-500/40 dark:border-purple-800/60 hover:border-purple-500 shadow-purple-950/20' 
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {poll.isAiGenerated && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-0.5 bg-gradient-to-r from-purple-900/60 to-indigo-900/60 text-purple-300 border border-purple-500/40 rounded-full">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        <span>AI Generated Poll</span>
                      </span>
                    )}
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                      {poll.locationContext}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-500 font-bold">
                    Ends in {poll.expiresInDays} days
                  </span>
                </div>

                {poll.trendingTag && (
                  <div className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-500/30 mb-2">
                    <TrendingUp className="w-3 h-3" />
                    <span>{poll.trendingTag}</span>
                  </div>
                )}

                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                  {poll.question}
                </h3>

                {poll.aiInsight && (
                  <div className="mt-2 p-2.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 text-[11px] text-purple-900 dark:text-purple-300">
                    <strong className="font-black text-purple-700 dark:text-purple-400">🤖 AI Insight: </strong>
                    <span>{poll.aiInsight}</span>
                  </div>
                )}

                <p className="text-xs text-slate-500 mt-2 font-medium">
                  {poll.totalVotes.toLocaleString()} citizens have voted
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {poll.options.map(option => {
                  const percentage = poll.totalVotes > 0 
                    ? Math.round((option.votes / poll.totalVotes) * 100) 
                    : 0;
                  const isSelected = poll.selectedOptionId === option.id;

                  return (
                    <button
                      key={option.id}
                      onClick={() => !poll.hasVoted && onVote(poll.id, option.id)}
                      disabled={poll.hasVoted}
                      className={`relative w-full text-left overflow-hidden rounded-xl border transition-all cursor-pointer ${
                        poll.hasVoted 
                          ? isSelected 
                            ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/20'
                            : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 opacity-70'
                          : 'border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.99]'
                      }`}
                    >
                      {poll.hasVoted && (
                        <div 
                          className={`absolute top-0 left-0 bottom-0 transition-all duration-700 ${isSelected ? 'bg-purple-200 dark:bg-purple-900/40' : 'bg-slate-200 dark:bg-slate-700/50'}`} 
                          style={{ width: `${percentage}%` }}
                        />
                      )}
                      <div className="relative p-3 flex items-center justify-between z-10">
                        <span className={`text-xs font-bold ${isSelected ? 'text-purple-900 dark:text-purple-100 font-extrabold' : 'text-slate-700 dark:text-slate-300'}`}>
                          {option.text}
                        </span>
                        {poll.hasVoted && (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black font-mono text-slate-700 dark:text-slate-300">
                              {percentage}%
                            </span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {poll.hasVoted && (
                <p className="text-center text-[11px] font-bold text-emerald-600 dark:text-emerald-400 pt-1">
                  ✓ Thanks for voting! +5 Civic Karma Credited
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
