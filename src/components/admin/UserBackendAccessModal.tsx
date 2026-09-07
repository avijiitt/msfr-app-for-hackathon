import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  ShieldCheck, 
  Search, 
  RefreshCw, 
  Download, 
  Key, 
  Phone, 
  Mail, 
  Wallet, 
  Database, 
  Terminal, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus,
  Trash2,
  Edit3,
  Copy,
  ExternalLink
} from 'lucide-react';

interface UserRecord {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  blood_group?: string;
  home_address?: string;
  emergency_contact?: string | null;
  is_student?: boolean;
  student_college_name?: string | null;
  student_roll_no?: string | null;
  is_senior_verified?: boolean;
  is_women_passenger?: boolean;
  wallet_balance?: number;
  karma_points?: number;
  created_at?: string;
  updated_at?: string;
}

interface OtpLogRecord {
  id: string;
  phone: string;
  otp: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  verifiedAt?: string;
}

interface UserBackendAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserBackendAccessModal: React.FC<UserBackendAccessModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'otp' | 'api_dev'>('users');
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [otpLogs, setOtpLogs] = useState<OtpLogRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'student' | 'senior' | 'women'>('all');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // New User Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCategory, setNewCategory] = useState<'regular' | 'student' | 'senior' | 'women'>('regular');
  const [newWallet, setNewWallet] = useState('500');

  // Load users and logs from backend
  const fetchBackendData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch users from Express backend
      const resUsers = await fetch('/api/admin/users').catch(() => null);
      if (resUsers && resUsers.ok) {
        const data = await resUsers.json();
        if (data.users && data.users.length > 0) {
          setUsers(data.users);
        }
      } else {
        // Fallback to /api/users
        const resFallback = await fetch('/api/users').catch(() => null);
        if (resFallback && resFallback.ok) {
          const data = await resFallback.json();
          if (data.profiles && data.profiles.length > 0) {
            setUsers(data.profiles);
          }
        } else {
          // Default seeded profile
          setUsers([
            {
              id: 'usr-default-commuter',
              email: 'commuter.bbsr@musafir.in',
              full_name: 'Bhubaneswar Commuter',
              phone: '+91 98765 43210',
              blood_group: 'B+',
              home_address: 'Jayadev Vihar, Bhubaneswar',
              wallet_balance: 650.0,
              is_student: false,
              is_senior_verified: false,
              is_women_passenger: false,
              created_at: new Date().toISOString()
            }
          ]);
        }
      }

      // 2. Fetch OTP logs
      const resOtp = await fetch('/api/admin/otp-logs').catch(() => null);
      if (resOtp && resOtp.ok) {
        const data = await resOtp.json();
        if (data.logs) {
          setOtpLogs(data.logs);
        }
      }
    } catch (err) {
      console.warn('Backend access load warning:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBackendData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filtered users list
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone || '').includes(searchQuery) ||
      (u.id || '').includes(searchQuery);

    if (!matchesSearch) return false;
    if (categoryFilter === 'student') return u.is_student;
    if (categoryFilter === 'senior') return u.is_senior_verified;
    if (categoryFilter === 'women') return u.is_women_passenger;
    return true;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newFullName) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newFullName,
          email: newEmail,
          phone: newPhone,
          walletBalance: parseFloat(newWallet) || 500,
          isStudent: newCategory === 'student',
          isSenior: newCategory === 'senior',
          isWomen: newCategory === 'women',
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUsers([data.user, ...users]);
          setShowAddForm(false);
          setNewFullName('');
          setNewEmail('');
          setNewPhone('');
        }
      }
    } catch (err) {
      console.error('Error creating user:', err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm(`Delete user ${id}?`)) return;
    try {
      await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(users, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `musafir_all_users_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Wallet', 'Student', 'Senior', 'Women', 'Created At'];
    const rows = users.map(u => [
      u.id,
      `"${(u.full_name || '').replace(/"/g, '""')}"`,
      u.email,
      u.phone || '',
      u.wallet_balance || 0,
      u.is_student ? 'YES' : 'NO',
      u.is_senior_verified ? 'YES' : 'NO',
      u.is_women_passenger ? 'YES' : 'NO',
      u.created_at || ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `musafir_users_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-6xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900/40 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight">Admin & Backend User Master Access</h1>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-bold">
                  Root Admin Mode
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Direct read/write access to PostgreSQL Supabase, JSON persistence vaults, and user identities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchBackendData}
              disabled={isLoading}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition text-xs font-semibold flex items-center gap-1.5"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-100 dark:bg-slate-950 px-6 py-2.5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              All User Profiles ({users.length})
            </button>

            <button
              onClick={() => setActiveTab('otp')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'otp'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Key className="w-4 h-4" />
              OTP Auth Logs ({otpLogs.length})
            </button>

            <button
              onClick={() => setActiveTab('api_dev')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'api_dev'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Terminal className="w-4 h-4" />
              API Endpoints & Database Keys
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              JSON
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-900/60">
          
          {/* TAB 1: USERS LIST */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              
              {/* Controls & Search */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, phone, ID..."
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                  {(['all', 'student', 'senior', 'women'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                        categoryFilter === cat
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}

                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition ml-auto"
                  >
                    <Plus className="w-4 h-4" />
                    New User
                  </button>
                </div>
              </div>

              {/* Add User Form Drawer */}
              {showAddForm && (
                <form onSubmit={handleCreateUser} className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold text-emerald-900 dark:text-emerald-300">
                      Create / Provision New User Profile in Backend
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={newFullName}
                        onChange={(e) => setNewFullName(e.target.value)}
                        placeholder="e.g. Priyabrata Mohanty"
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="commuter@musafir.in"
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Phone</label>
                      <input
                        type="text"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="+91 90000 00000"
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Initial Wallet (₹)</label>
                      <input
                        type="number"
                        value={newWallet}
                        onChange={(e) => setNewWallet(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition"
                    >
                      Save to Supabase & Memory Store
                    </button>
                  </div>
                </form>
              )}

              {/* Users Table */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                        <th className="p-3">User</th>
                        <th className="p-3">Contact</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Wallet</th>
                        <th className="p-3">Created</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-slate-400">
                            No user records found matching criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                            <td className="p-3">
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                {user.full_name || 'Anonymous User'}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                                <span>ID: {user.id.slice(0, 8)}...</span>
                                <button
                                  onClick={() => handleCopy(user.id, `user-${user.id}`)}
                                  className="text-slate-400 hover:text-indigo-500"
                                  title="Copy Full ID"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                                {copiedText === `user-${user.id}` && (
                                  <span className="text-[10px] text-emerald-500 font-sans">Copied!</span>
                                )}
                              </div>
                            </td>

                            <td className="p-3">
                              <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span>{user.email}</span>
                              </div>
                              {user.phone && (
                                <div className="flex items-center gap-1 text-slate-500 mt-0.5">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{user.phone}</span>
                                </div>
                              )}
                            </td>

                            <td className="p-3">
                              <div className="flex flex-wrap gap-1">
                                {user.is_student && (
                                  <span className="px-2 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 rounded font-bold text-[10px]">
                                    Student
                                  </span>
                                )}
                                {user.is_senior_verified && (
                                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded font-bold text-[10px]">
                                    Senior
                                  </span>
                                )}
                                {user.is_women_passenger && (
                                  <span className="px-2 py-0.5 bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300 rounded font-bold text-[10px]">
                                    Women Safe
                                  </span>
                                )}
                                {!user.is_student && !user.is_senior_verified && !user.is_women_passenger && (
                                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded font-semibold text-[10px]">
                                    Standard Commuter
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">
                              ₹{user.wallet_balance || 0}
                            </td>

                            <td className="p-3 text-[11px] text-slate-400">
                              {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active'}
                            </td>

                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OTP LOGS */}
          {activeTab === 'otp' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Live SMS & OTP Authentication Vault
                  </h2>
                  <p className="text-xs text-slate-500">
                    Real-time verification codes generated by backend for phone login security.
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-bold rounded-lg">
                  {otpLogs.length} Records
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                        <th className="p-3">Phone Number</th>
                        <th className="p-3">Generated OTP</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Created At</th>
                        <th className="p-3">Expires At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {otpLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-slate-400">
                            No OTP logs recorded in current session.
                          </td>
                        </tr>
                      ) : (
                        otpLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                            <td className="p-3 font-semibold text-slate-900 dark:text-white">
                              {log.phone}
                            </td>
                            <td className="p-3">
                              <span className="font-mono px-2 py-1 bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-extrabold rounded">
                                {log.otp}
                              </span>
                            </td>
                            <td className="p-3">
                              {log.status === 'verified' ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                                  <Clock className="w-3.5 h-3.5" /> Pending
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-[11px] text-slate-400">
                              {new Date(log.createdAt).toLocaleTimeString()}
                            </td>
                            <td className="p-3 text-[11px] text-slate-400">
                              {new Date(log.expiresAt).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DEVELOPER KEYS & BACKEND ENDPOINTS */}
          {activeTab === 'api_dev' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Developer & Terminal Backend Access
                </h2>
                <p className="text-xs text-slate-500">
                  Direct curl commands, database files, and cloud credentials for unrestricted access.
                </p>
              </div>

              {/* Local File Storage Paths */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <Database className="w-4 h-4 text-indigo-500" />
                  Local File System JSON Databases
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl font-mono text-[11px]">
                    <span className="text-slate-600 dark:text-slate-300">server/data/profiles.json</span>
                    <button
                      onClick={() => handleCopy('server/data/profiles.json', 'file-profiles')}
                      className="text-indigo-600 hover:text-indigo-800 text-[11px] font-sans font-bold"
                    >
                      {copiedText === 'file-profiles' ? 'Copied' : 'Copy Path'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl font-mono text-[11px]">
                    <span className="text-slate-600 dark:text-slate-300">server/data/otp_logs.json</span>
                    <button
                      onClick={() => handleCopy('server/data/otp_logs.json', 'file-otp')}
                      className="text-indigo-600 hover:text-indigo-800 text-[11px] font-sans font-bold"
                    >
                      {copiedText === 'file-otp' ? 'Copied' : 'Copy Path'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl font-mono text-[11px]">
                    <span className="text-slate-600 dark:text-slate-300">server/data/payments.json</span>
                    <button
                      onClick={() => handleCopy('server/data/payments.json', 'file-payments')}
                      className="text-indigo-600 hover:text-indigo-800 text-[11px] font-sans font-bold"
                    >
                      {copiedText === 'file-payments' ? 'Copied' : 'Copy Path'}
                    </button>
                  </div>
                </div>
              </div>

              {/* REST API Endpoints with Curl */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <Terminal className="w-4 h-4 text-indigo-500" />
                  REST API Endpoints & Curl Access
                </div>

                <div className="space-y-2">
                  {[
                    { label: 'Get All User Profiles', cmd: 'curl http://localhost:5000/api/users', id: 'cmd-users' },
                    { label: 'Get Admin Complete User Directory', cmd: 'curl http://localhost:5000/api/admin/users', id: 'cmd-admin-users' },
                    { label: 'Get All Live OTP Logs', cmd: 'curl http://localhost:5000/api/admin/otp-logs', id: 'cmd-admin-otp' },
                    { label: 'Get System Overview & Stats', cmd: 'curl http://localhost:5000/api/admin/overview', id: 'cmd-admin-overview' },
                    { label: 'Export All Users as JSON', cmd: 'curl http://localhost:5000/api/admin/export/users -o users.json', id: 'cmd-admin-export' }
                  ].map((item) => (
                    <div key={item.id} className="p-2.5 bg-slate-950 text-slate-200 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{item.label}</span>
                        <button
                          onClick={() => handleCopy(item.cmd, item.id)}
                          className="text-indigo-400 hover:text-indigo-300 font-sans font-bold"
                        >
                          {copiedText === item.id ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <div className="font-mono text-xs text-emerald-400 overflow-x-auto">
                        {item.cmd}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cloud Database (Supabase PostgreSQL) */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <Database className="w-4 h-4 text-emerald-500" />
                  Cloud Database (Supabase PostgreSQL)
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 font-mono text-[11px]">
                  <div>Project URL: https://chxhqifhtqlntslvrqyv.supabase.co</div>
                  <div>Primary Tables: <span className="text-indigo-500 font-bold">profiles, trips, payments, emergency_logs</span></div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Authenticated Administrator Session</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-xs transition"
          >
            Close Console
          </button>
        </div>

      </div>
    </div>
  );
};
