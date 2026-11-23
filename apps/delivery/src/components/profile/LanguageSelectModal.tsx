import React, { useState } from 'react';
import { X, Globe, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface LanguageSelectModalProps {
  title: string;
  subtitle: string;
  currentLanguage: string;
  onSelectLanguage: (lang: string) => void;
  onClose: () => void;
}

export const LanguageSelectModal: React.FC<LanguageSelectModalProps> = ({
  title,
  subtitle,
  currentLanguage,
  onSelectLanguage,
  onClose,
}) => {
  const { setLanguage } = useLanguage();
  const [selected, setSelected] = useState<string>(currentLanguage || 'English');

  const languages = [
    { id: 'en', code: 'English', label: 'English', native: 'English' },
    { id: 'kn', code: 'Kannada', label: 'Kannada', native: 'ಕನ್ನಡ' },
    { id: 'hi', code: 'Hindi', label: 'Hindi', native: 'हिंदी' },
    { id: 'te', code: 'Telugu', label: 'Telugu', native: 'తెలుగు' },
    { id: 'ta', code: 'Tamil', label: 'Tamil', native: 'தமிழ்' },
  ];

  const handleApply = (langCode: string, id: string) => {
    setSelected(langCode);
    if (id === 'en' || id === 'kn' || id === 'hi') {
      setLanguage(id as any);
    }
    onSelectLanguage(langCode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-sm bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center">
              <Globe size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
              <p className="text-xs text-slate-500">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-2 overflow-y-auto flex-1">
          {languages.map((lang) => {
            const isSelected = selected.toLowerCase() === lang.code.toLowerCase() || selected.toLowerCase() === lang.id;
            return (
              <div
                key={lang.id}
                onClick={() => handleApply(lang.code, lang.id)}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-amber-50 border-amber-300 text-slate-900 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div>
                  <div className="text-sm font-extrabold text-slate-900">{lang.label}</div>
                  <div className="text-xs text-slate-500">{lang.native}</div>
                </div>
                {isSelected && <CheckCircle2 size={18} className="text-amber-800" />}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
