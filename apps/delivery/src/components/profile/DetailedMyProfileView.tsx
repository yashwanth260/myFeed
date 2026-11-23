import React, { useState } from 'react';
import {
  ChevronLeft,
  Star,
  Building,
  Globe,
  Languages,
  LogOut,
  ChevronRight,
  Phone,
  Calendar,
  Layers,
  MapPin,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { PartnerProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { BankDetailsModal } from './BankDetailsModal';
import { LanguageSelectModal } from './LanguageSelectModal';

interface DetailedMyProfileViewProps {
  onBack: () => void;
}

export const DetailedMyProfileView: React.FC<DetailedMyProfileViewProps> = ({ onBack }) => {
  const { partner, logout, updatePartnerProfile } = useAuth();
  const [showBankModal, setShowBankModal] = useState<boolean>(false);
  const [languageModalType, setLanguageModalType] = useState<'app' | 'preferred' | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);

  const fallbackAvatar =
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';

  return (
    <div className="space-y-4 pb-28 md:pb-12 max-w-xl mx-auto w-full animate-fade-in font-sans">
      {/* Top Header with Back Navigation */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={onBack}
          type="button"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors cursor-pointer px-3 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs"
          aria-label="Back to Profile"
        >
          <ChevronLeft size={17} className="text-amber-600" />
          <span>Profile</span>
        </button>

        <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">My Profile</h1>

        <div className="w-8" />
      </div>

      {/* Section A — Partner Identity Card */}
      <div className="rounded-3xl bg-white border border-slate-100 p-5 sm:p-6 shadow-sm flex items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {partner.name || 'Rahul Kumar'}
            </h2>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Partner ID: <span className="font-mono font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">{partner.id || 'FD10245'}</span>
          </div>

          {partner.rating && (
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-black shadow-xs">
              <span>{partner.rating.toFixed(1)}</span>
              <Star size={12} fill="currentColor" />
            </div>
          )}
        </div>

        {/* Circular Profile Picture on Right */}
        <div className="relative flex-shrink-0">
          <img
            src={partner.photoUrl || fallbackAvatar}
            alt={partner.name || 'Delivery Partner'}
            className="w-18 h-18 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-amber-400 shadow-sm"
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallbackAvatar;
            }}
          />
          <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
        </div>
      </div>

      {/* Section B — Personal & Work Details */}
      <div className="rounded-3xl bg-white border border-slate-100 p-5 shadow-sm space-y-3.5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Personal & Work Details
        </h3>

        <div className="space-y-2 text-xs">
          {/* Mobile Number */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5 text-slate-600">
              <Phone size={15} className="text-amber-600" />
              <span>Mobile Number</span>
            </div>
            <span className="font-mono font-bold text-slate-900">{partner.phone || '+91 99999 99999'}</span>
          </div>

          {/* Joining Date */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5 text-slate-600">
              <Calendar size={15} className="text-blue-500" />
              <span>Joining Date</span>
            </div>
            <span className="font-bold text-slate-900">{partner.joiningDate || partner.partnerSince || '15 March 2025'}</span>
          </div>

          {/* Order Category */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5 text-slate-600">
              <Layers size={15} className="text-amber-600" />
              <span>Order Category</span>
            </div>
            <span className="font-bold text-slate-900">{partner.orderCategory || 'Food & Hyperlocal'}</span>
          </div>

          {/* City */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5 text-slate-600">
              <MapPin size={15} className="text-rose-500" />
              <span>City</span>
            </div>
            <span className="font-bold text-slate-900">{partner.city || 'Bengaluru'}</span>
          </div>

          {/* Zone */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5 text-slate-600">
              <MapPin size={15} className="text-emerald-600" />
              <span>Zone</span>
            </div>
            <span className="font-bold text-slate-900">{partner.currentZone || 'Indiranagar Zone'}</span>
          </div>
        </div>
      </div>

      {/* Section C — Account & Preferences */}
      <div className="rounded-3xl bg-white border border-slate-100 p-5 shadow-sm space-y-3.5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Account & Preferences
        </h3>

        <div className="space-y-2 text-xs">
          {/* 1. Bank Details */}
          <button
            onClick={() => setShowBankModal(true)}
            type="button"
            className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 hover:border-amber-300 transition-all flex items-center justify-between cursor-pointer group shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center justify-center flex-shrink-0 shadow-xs">
                <Building size={18} />
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-900 text-xs sm:text-sm">Bank Details</div>
                <div className="text-[11px] text-slate-500">
                  {partner.bankDetails?.bankName || 'HDFC Bank'} ({partner.bankDetails?.accountNumberMasked || '•••• 9812'})
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-900">
              <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                Wed Payout
              </span>
              <ChevronRight size={16} />
            </div>
          </button>

          {/* 3. App Language */}
          <button
            onClick={() => setLanguageModalType('app')}
            type="button"
            className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 hover:border-purple-300 transition-all flex items-center justify-between cursor-pointer group shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200/80 flex items-center justify-center flex-shrink-0 shadow-xs">
                <Globe size={18} />
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-900 text-xs sm:text-sm">App Language</div>
                <div className="text-[11px] text-slate-500">Interface language selection</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-900">
              <span className="font-bold text-slate-900 text-xs">{partner.appLanguage || 'English'}</span>
              <ChevronRight size={16} />
            </div>
          </button>

          {/* 4. Preferred Language */}
          <button
            onClick={() => setLanguageModalType('preferred')}
            type="button"
            className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 hover:border-amber-300 transition-all flex items-center justify-between cursor-pointer group shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center justify-center flex-shrink-0 shadow-xs">
                <Languages size={18} />
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-900 text-xs sm:text-sm">Preferred Language</div>
                <div className="text-[11px] text-slate-500">Communication & notifications</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-900">
              <span className="font-bold text-slate-900 text-xs">{partner.preferredLanguage || 'English'}</span>
              <ChevronRight size={16} />
            </div>
          </button>

          {/* 5. Logout */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            type="button"
            className="w-full p-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100/70 border border-rose-200/80 transition-all flex items-center justify-between cursor-pointer group mt-2 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 shadow-xs">
                <LogOut size={18} />
              </div>
              <div className="text-left">
                <div className="font-bold text-rose-700 text-xs sm:text-sm">Logout</div>
                <div className="text-[11px] text-rose-500">End active session on this device</div>
              </div>
            </div>
            <ChevronRight size={16} className="text-rose-500 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Sub-Modals */}
      {showBankModal && (
        <BankDetailsModal
          partner={partner}
          onClose={() => setShowBankModal(false)}
        />
      )}

      {languageModalType && (
        <LanguageSelectModal
          title={languageModalType === 'app' ? 'Select App Language' : 'Preferred Communication Language'}
          subtitle="Choose your preferred language for Feedo Partner"
          currentLanguage={
            languageModalType === 'app'
              ? partner.appLanguage || 'English'
              : partner.preferredLanguage || 'English'
          }
          onSelectLanguage={(lang) => {
            if (languageModalType === 'app') {
              updatePartnerProfile({ appLanguage: lang });
            } else {
              updatePartnerProfile({ preferredLanguage: lang });
            }
          }}
          onClose={() => setLanguageModalType(null)}
        />
      )}

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="w-full max-w-sm bg-white border border-slate-100 rounded-3xl p-5 shadow-2xl space-y-4 text-center text-slate-900">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/80 flex items-center justify-center mx-auto shadow-xs">
              <LogOut size={22} />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900">Log Out Session?</h3>
              <p className="text-xs text-slate-500 mt-1">
                You will be switched offline and delivery requests will be paused.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                type="button"
                className="py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer border border-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={logout}
                type="button"
                className="py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs cursor-pointer shadow-xs"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
