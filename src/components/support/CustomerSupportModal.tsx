import React, { useState } from 'react';
import { Headphones, PhoneCall, MessageSquare, AlertCircle, CheckCircle2, Clock, Send, X } from 'lucide-react';
import { SupportTicket } from '../../types/transit';
import { TranslationDictionary } from '../../types/i18n';

interface CustomerSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: TranslationDictionary;
}

export const CustomerSupportModal: React.FC<CustomerSupportModalProps> = ({
  isOpen,
  onClose,
  t,
}) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 'TCK-8812',
      category: 'lost_found',
      subject: 'Blue Backpack left on Bus #402',
      description: 'Contains laptop and college notes. Seat row 4 near driver.',
      status: 'in_progress',
      priority: 'high',
      createdAt: 'Today, 02:15 PM',
      resolutionNotes: 'Depot manager contacted. Item located at Terminal Depot lost room.',
    },
  ]);

  const [category, setCategory] = useState<SupportTicket['category']>('fare_dispute');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;

    const newTicket: SupportTicket = {
      id: 'TCK-' + Math.floor(1000 + Math.random() * 9000),
      category,
      subject,
      description,
      status: 'open',
      priority: 'medium',
      createdAt: 'Just now',
    };

    setTickets([newTicket, ...tickets]);
    setSubject('');
    setDescription('');
    setTicketSubmitted(true);
    setTimeout(() => setTicketSubmitted(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 text-slate-900 dark:text-white space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.customerSupportTitle || '24x7 Customer Support & Lost & Found'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct Help Desk, Fare Disputes & Lost Items Retrieval
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Instant Helplines */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <a
            href="tel:18003451122"
            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2.5 hover:border-blue-400 transition"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-slate-900 dark:text-white block">Toll-Free Helpline</strong>
              <span className="text-[11px] text-slate-500 font-mono">1800-345-1122</span>
            </div>
          </a>

          <a
            href="tel:112"
            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2.5 hover:border-rose-400 transition"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-slate-900 dark:text-white block">Emergency SOS</strong>
              <span className="text-[11px] text-slate-500 font-mono">Dial 112 (24x7)</span>
            </div>
          </a>
        </div>

        {/* Raise a Support Ticket Form */}
        <form onSubmit={handleSubmitTicket} className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 shadow-sm text-xs">
          <h3 className="font-bold text-xs uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" /> Raise a Support Ticket
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">Issue Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SupportTicket['category'])}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="fare_dispute">Fare Dispute / Double Charge</option>
                <option value="lost_found">Lost & Found Retrieval</option>
                <option value="delay">Extreme Bus/Metro Delay</option>
                <option value="staff_behavior">Staff / Driver Feedback</option>
                <option value="accessibility">Wheelchair / Accessibility Support</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">Subject / Bus No.</label>
              <input
                type="text"
                placeholder="e.g. Fare overcharged on Bus #204"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">Description & Details</label>
            <textarea
              rows={2}
              placeholder="Describe your issue or describe lost item (color, seat row, time)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            Submit Ticket
          </button>
        </form>

        {ticketSubmitted && (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Ticket submitted successfully! Transit team will review within 30 mins.</span>
          </div>
        )}

        {/* Existing Tickets (With visible side scrollbar) */}
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Your Tickets</h4>
          {tickets.map((tck) => (
            <div
              key={tck.id}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1 text-xs shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{tck.subject}</span>
                  <p className="text-[10px] text-slate-400 font-mono">{tck.id} • {tck.createdAt}</p>
                </div>
                <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                  {tck.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">{tck.description}</p>
              {tck.resolutionNotes && (
                <div className="text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800 mt-1">
                  <strong>Update:</strong> {tck.resolutionNotes}
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition"
        >
          Close Support
        </button>
      </div>
    </div>
  );
};
