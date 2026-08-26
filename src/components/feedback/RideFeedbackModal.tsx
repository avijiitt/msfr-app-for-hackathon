import React, { useState } from 'react';
import { Star, MessageSquare, CheckCircle2, ThumbsUp, X } from 'lucide-react';
import { rewardsService } from '../../services/rewardsService';

interface RideFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCoinsAwarded?: () => void;
}

export const RideFeedbackModal: React.FC<RideFeedbackModalProps> = ({
  isOpen,
  onClose,
  onCoinsAwarded,
}) => {
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['On Time', 'Clean Bus']);
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const availableTags = [
    'On Time ⏱️',
    'Clean Vehicle 🧼',
    'Safe Driving 🛡️',
    'Chilled AC ❄️',
    'Digital QR Worked 📱',
    'Crowded 👥',
    'Slight Delay ⌛',
  ];

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    rewardsService.earnCoins(25, 'Ride Feedback Bonus');
    setSubmitted(true);
    if (onCoinsAwarded) onCoinsAwarded();
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                How was your journey?
              </h3>
              <p className="text-[11px] text-slate-400">Earn +25 Musafir Coins for rating your trip</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-6 text-center space-y-2 animate-in fade-in">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-slate-900 dark:text-white">Thank You for Your Feedback!</h4>
            <p className="text-xs text-emerald-600 font-semibold">+25 Musafir Coins added to your account</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star Rating */}
            <div className="flex justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Feedback Tags */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Highlights:</span>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => {
                  const isSel = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
                        isSel
                          ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border-blue-300'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment Textarea */}
            <div>
              <textarea
                placeholder="Any additional feedback on vehicle condition or safety?"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={2}
                className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
            >
              Submit Rating (+25 Coins)
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
