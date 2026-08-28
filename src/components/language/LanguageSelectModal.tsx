import React, { useState } from 'react';
import { SUPPORTED_LANGUAGES } from '../../data/translations';
import { LanguageCode } from '../../types/i18n';
import { Globe, Check, Search, Sparkles, X } from 'lucide-react';

interface LanguageSelectModalProps {
  isOpen: boolean;
  currentLang: LanguageCode;
  onSelectLanguage: (code: LanguageCode) => void;
  onClose?: () => void;
  isMandatory?: boolean;
}

export const LanguageSelectModal: React.FC<LanguageSelectModalProps> = ({
  isOpen,
  currentLang,
  onSelectLanguage,
  onClose,
  isMandatory = false,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = SUPPORTED_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(search.toLowerCase()) ||
      l.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (code: LanguageCode) => {
    onSelectLanguage(code);
    localStorage.setItem('musafir_lang', code);
    localStorage.setItem('musafir_lang_selected', 'true');
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col transition-all">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-2xl shadow-inner">
                🇮🇳
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight">Choose Your Language</h2>
                <p className="text-xs text-blue-100 font-medium">
                  ଆପଣଙ୍କ ପସନ୍ଦର ଭାଷା ବାଛନ୍ତୁ • अपनी भाषा चुनें
                </p>
              </div>
            </div>

            {!isMandatory && onClose && (
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search language / ଭାଷା ଖୋଜନ୍ତୁ / भाषा खोजें..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            />
          </div>
        </div>

        {/* Language Grid */}
        <div className="p-4 sm:p-5 max-h-[380px] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filtered.map((lang) => {
            const isSelected = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang.code)}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 group active:scale-98 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-900/30 ring-2 ring-blue-500 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl flex-shrink-0">{lang.flag}</span>
                  <div className="min-w-0">
                    <strong className="text-sm font-black text-slate-900 dark:text-white block group-hover:text-blue-600 transition">
                      {lang.nativeName}
                    </strong>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {lang.name}
                    </span>
                  </div>
                </div>

                {isSelected ? (
                  <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-xl border border-slate-200 dark:border-slate-700 group-hover:border-blue-400 flex items-center justify-center text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                    Select
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-between px-6 text-xs text-slate-500">
          <span className="flex items-center gap-1 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>You can change language anytime in Profile</span>
          </span>
          {!isMandatory && onClose && (
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-300"
            >
              Done
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
export default LanguageSelectModal;
