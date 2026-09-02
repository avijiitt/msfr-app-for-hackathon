import React from 'react';
import { PieChart, CheckCircle2 } from 'lucide-react';
import { CommunityPoll } from '../../services/communityReportsService';

interface CommunityPollsProps {
  polls: CommunityPoll[];
  onVote: (pollId: string, optionId: string) => void;
}

export const CommunityPolls: React.FC<CommunityPollsProps> = ({ polls, onVote }) => {
  if (polls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
        <PieChart className="w-10 h-10 mb-2 opacity-50" />
        <p className="text-sm font-semibold">No active polls at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {polls.map(poll => (
        <div key={poll.id} className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                {poll.locationContext}
              </span>
              <span className="text-[10px] text-slate-500 font-bold text-right">
                Ends in {poll.expiresInDays} days
              </span>
            </div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
              {poll.question}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {poll.totalVotes.toLocaleString()} citizens have voted
            </p>
          </div>

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
                  className={`relative w-full text-left overflow-hidden rounded-xl border transition-all ${
                    poll.hasVoted 
                      ? isSelected 
                        ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/20'
                        : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 opacity-70'
                      : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {poll.hasVoted && (
                    <div 
                      className={`absolute top-0 left-0 bottom-0 ${isSelected ? 'bg-purple-200 dark:bg-purple-900/40' : 'bg-slate-200 dark:bg-slate-700/50'}`} 
                      style={{ width: `${percentage}%` }}
                    />
                  )}
                  <div className="relative p-3 flex items-center justify-between z-10">
                    <span className={`text-xs font-bold ${isSelected ? 'text-purple-900 dark:text-purple-100' : 'text-slate-700 dark:text-slate-300'}`}>
                      {option.text}
                    </span>
                    {poll.hasVoted && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-600 dark:text-slate-400">
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
            <p className="text-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 pt-2">
              ✓ Thanks for voting! +5 Civic Karma
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
