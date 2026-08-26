import React, { useState } from 'react';
import { Headphones, PhoneCall, MessageSquare, AlertCircle, CheckCircle2, Clock, ShieldAlert, Send } from 'lucide-react';
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
      subject: 'Blue Backpack left on Mo Bus #402',
      description: 'Contains laptop and college notes. Seat row 4 near driver.',
      status: 'in_progress',
      priority: 'high',
      createdAt: 'Today, 02:15 PM',
      resolutionNotes: 'Depot manager contacted. Item located at Master Canteen Depot lost room.',
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="max-w-xl w-full glass-panel-glow rounded-3xl p-5 sm:p-6 text-white space-y-5 border border-cyan-500/30 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {t.customerSupportTitle}
              </h2>
              <p className="text-xs text-slate-400">
                24x7 Commuter Helpline & Grievance Redressal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm"
          >
            ✕
          </button>
        </div>

        {/* 24x7 Toll Free Banner */}
        <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div>
            <span className="text-xs text-slate-400 block">24x7 Toll-Free Passenger Helpline:</span>
            <div className="text-base font-black text-white font-mono mt-0.5">1800-425-MSFR (1800-425-6737)</div>
            <span className="text-[10px] text-emerald-400 font-semibold">● Instant Live Agent Available</span>
          </div>
          <a
            href="tel:18004256737"
            className="p-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 flex items-center gap-1.5 transition"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call Now</span>
          </a>
        </div>

        {/* File Grievance Ticket Form */}
        <form onSubmit={handleSubmitTicket} className="bg-slate-900/90 border border-white/10 rounded-2xl p-4 space-y-3 text-xs">
          <span className="font-bold text-xs text-slate-200 block">
            File New Dispute or Lost Item Ticket:
          </span>

          {ticketSubmitted && (
            <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-xl p-2.5 text-[11px] text-emerald-300 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Grievance ticket registered! Tracking reference generated below.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Issue Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SupportTicket['category'])}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-white text-xs focus:outline-none"
              >
                <option value="lost_found">🎒 Lost & Found Item in Bus</option>
                <option value="fare_dispute">💳 Fare / UPI Payment Dispute</option>
                <option value="bus_delay">⏱️ Severe Bus Delay / Skip Stop</option>
                <option value="driver_feedback">👨‍✈️ Driver / Conductor Feedback</option>
                <option value="safety_concern">🛡️ Safety & Harassment Report</option>
                <option value="general">❓ General Inquiry</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Subject / Bus Number</label>
              <input
                type="text"
                placeholder="e.g. UPI ₹20 debited twice on Bus 10"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-white text-xs focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Detailed Description & Date/Time</label>
            <textarea
              rows={2}
              placeholder="Provide trip time, route name, or description of lost property..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-white text-xs focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Ticket to MSFR Grievance Officer</span>
          </button>
        </form>

        {/* Tickets History */}
        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Your Support Tickets ({tickets.length})
          </span>
          {tickets.map((tck) => (
            <div key={tck.id} className="bg-slate-900/80 border border-white/10 p-3 rounded-xl space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-cyan-400">{tck.id}</span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono">
                  {tck.status.toUpperCase()}
                </span>
              </div>
              <div className="font-bold text-white">{tck.subject}</div>
              <p className="text-[11px] text-slate-400">{tck.description}</p>
              {tck.resolutionNotes && (
                <div className="text-[10px] text-emerald-300 bg-emerald-950/40 p-1.5 rounded mt-1">
                  Officer Note: {tck.resolutionNotes}
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
        >
          Close Support
        </button>
      </div>
    </div>
  );
};
