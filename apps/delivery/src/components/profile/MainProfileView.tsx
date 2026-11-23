import React, { useState } from 'react';
import {
  Headset,
  User,
  Inbox,
  Users,
  ShoppingBag,
  Bell,
  Wallet,
  History,
  GraduationCap,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockInboxMessages } from '../../data/mockProfile';
import { InboxModal } from './InboxModal';
import { FeedoStoreModal } from './FeedoStoreModal';
import { WaysToEarnModal } from './WaysToEarnModal';
import { LoginHistoryModal } from './LoginHistoryModal';
import { FeedoSkillsModal } from './FeedoSkillsModal';
import { SettingsModal } from './SettingsModal';
import { ReferralModal } from '../referral/ReferralModal';
import { NotificationsModal } from '../common/NotificationsModal';

interface MainProfileViewProps {
  onOpenMyProfile: () => void;
  onOpenHelpSupport: () => void;
}

export const MainProfileView: React.FC<MainProfileViewProps> = ({
  onOpenMyProfile,
  onOpenHelpSupport,
}) => {
  const { partner } = useAuth();
  const [showInboxModal, setShowInboxModal] = useState<boolean>(false);
  const [showReferralModal, setShowReferralModal] = useState<boolean>(false);
  const [showStoreModal, setShowStoreModal] = useState<boolean>(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState<boolean>(false);
  const [showWaysToEarnModal, setShowWaysToEarnModal] = useState<boolean>(false);
  const [showLoginHistoryModal, setShowLoginHistoryModal] = useState<boolean>(false);
  const [showSkillsModal, setShowSkillsModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  const fallbackAvatar =
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';

  const unreadInboxCount = mockInboxMessages.filter((m) => !m.isRead).length;

  return (
    <div className="space-y-4 pb-28 md:pb-12 max-w-xl mx-auto w-full animate-fade-in font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Profile
        </h1>

        {/* Help button on the top-right corner with a headset icon */}
        <button
          onClick={onOpenHelpSupport}
          type="button"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-700 hover:text-slate-950 transition-all cursor-pointer shadow-xs group"
          title="Help & Support"
          aria-label="Help & Support"
        >
          <Headset size={16} className="text-amber-600 group-hover:scale-110 transition-transform" />
          <span>Help</span>
        </button>
      </div>

      {/* Delivery Partner Information Card */}
      <div className="rounded-3xl bg-white border border-slate-100 p-5 sm:p-6 shadow-sm flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {partner.name || 'Rahul Kumar'}
          </h2>
          <div className="text-xs text-slate-500 font-medium">
            Partner ID: <span className="font-mono font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">{partner.id || 'FD10245'}</span>
          </div>
          <div className="text-[11px] text-slate-400 pt-0.5">
            {partner.city || 'Bengaluru'} • {partner.currentZone || 'Indiranagar Hub'}
          </div>
        </div>

        {/* Circular Profile Photo in Gold Frame */}
        <div className="relative flex-shrink-0">
          <img
            src={partner.photoUrl || fallbackAvatar}
            alt={partner.name || 'Delivery Partner'}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-full object-cover border-2 border-amber-400 shadow-sm"
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallbackAvatar;
            }}
          />
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
        </div>
      </div>

      {/* My Profile (Clickable Card) */}
      <button
        onClick={onOpenMyProfile}
        type="button"
        className="w-full rounded-3xl bg-white hover:bg-slate-50/70 border border-slate-100 hover:border-amber-300 p-4 shadow-sm transition-all flex items-center justify-between cursor-pointer group text-left select-none"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform border border-amber-200/80 shadow-xs">
            <User size={20} />
          </div>
          <div>
            <div className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-amber-800 transition-colors">
              My Profile
            </div>
            <div className="text-[11px] text-slate-500">
              Personal details, bank & language
            </div>
          </div>
        </div>

        <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
      </button>

      {/* Inbox (Clickable Card with Unread Badge) */}
      <button
        onClick={() => setShowInboxModal(true)}
        type="button"
        className="w-full rounded-3xl bg-white hover:bg-slate-50/70 border border-slate-100 hover:border-blue-300 p-4 shadow-sm transition-all flex items-center justify-between cursor-pointer group text-left select-none"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform border border-blue-200/80 shadow-xs">
            <Inbox size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
                Inbox
              </span>
              {unreadInboxCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FACC15] text-slate-950 border border-amber-300">
                  {unreadInboxCount} New
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500">
              Important communications & operational updates
            </div>
          </div>
        </div>

        <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
      </button>

      {/* Partner Services */}
      <div className="rounded-3xl bg-white border border-slate-100 p-2 sm:p-3 shadow-sm space-y-1">
        <div className="px-3 pt-2 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Partner Services
        </div>

        {/* 1. Refer & Earn */}
        <button
          onClick={() => setShowReferralModal(true)}
          type="button"
          className="w-full p-3 rounded-2xl hover:bg-slate-50/90 transition-all flex items-center justify-between cursor-pointer group text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Users size={18} />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                Refer & Earn
              </div>
              <div className="text-[11px] text-slate-500">Share your invite code with friends</div>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* 2. Feedo Store */}
        <button
          onClick={() => setShowStoreModal(true)}
          type="button"
          className="w-full p-3 rounded-2xl hover:bg-slate-50/90 transition-all flex items-center justify-between cursor-pointer group text-left border-t border-slate-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200/80 flex items-center justify-center flex-shrink-0 shadow-xs">
              <ShoppingBag size={18} />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                Feedo Store
              </div>
              <div className="text-[11px] text-slate-500">Delivery bags, rainwear & rider gear</div>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>

      {/* Additional Profile Options */}
      <div className="rounded-3xl bg-white border border-slate-100 p-2 sm:p-3 shadow-sm space-y-1">
        <div className="px-3 pt-2 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          More Options
        </div>

        {/* 1. Notifications */}
        <button
          onClick={() => setShowNotificationsModal(true)}
          type="button"
          className="w-full p-3 rounded-2xl hover:bg-slate-50/90 transition-all flex items-center justify-between cursor-pointer group text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200/80 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Bell size={18} />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                Notifications
              </div>
              <div className="text-[11px] text-slate-500">Alerts, payment & trip history updates</div>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* 3. Ways to Earn */}
        <button
          onClick={() => setShowWaysToEarnModal(true)}
          type="button"
          className="w-full p-3 rounded-2xl hover:bg-slate-50/90 transition-all flex items-center justify-between cursor-pointer group text-left border-t border-slate-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Wallet size={18} />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                Ways to Earn
              </div>
              <div className="text-[11px] text-slate-500">Trip pay, tips, rain bonuses & Wednesday ACH</div>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* 4. Help & Support */}
        <button
          onClick={onOpenHelpSupport}
          type="button"
          className="w-full p-3 rounded-2xl hover:bg-slate-50/90 transition-all flex items-center justify-between cursor-pointer group text-left border-t border-slate-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/80 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Headset size={18} />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                Help & Support
              </div>
              <div className="text-[11px] text-slate-500">FAQs & 24/7 dedicated partner assistance</div>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* 5. Login History */}
        <button
          onClick={() => setShowLoginHistoryModal(true)}
          type="button"
          className="w-full p-3 rounded-2xl hover:bg-slate-50/90 transition-all flex items-center justify-between cursor-pointer group text-left border-t border-slate-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/80 flex items-center justify-center flex-shrink-0 shadow-xs">
              <History size={18} />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                Login History
              </div>
              <div className="text-[11px] text-slate-500">Recent sign-in devices & sessions</div>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* 6. Feedo Skills */}
        <button
          onClick={() => setShowSkillsModal(true)}
          type="button"
          className="w-full p-3 rounded-2xl hover:bg-slate-50/90 transition-all flex items-center justify-between cursor-pointer group text-left border-t border-slate-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200/80 flex items-center justify-center flex-shrink-0 shadow-xs">
              <GraduationCap size={18} />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                Feedo Skills
              </div>
              <div className="text-[11px] text-slate-500">Rider safety & delivery excellence training</div>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* 7. Settings */}
        <button
          onClick={() => setShowSettingsModal(true)}
          type="button"
          className="w-full p-3 rounded-2xl hover:bg-slate-50/90 transition-all flex items-center justify-between cursor-pointer group text-left border-t border-slate-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-slate-100 text-slate-600 border border-slate-200/80 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Settings size={18} />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-slate-950 transition-colors">
                Settings
              </div>
              <div className="text-[11px] text-slate-500">Alert chimes, navigation voice & storage</div>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>

      {/* Modals */}
      {showInboxModal && <InboxModal onClose={() => setShowInboxModal(false)} />}
      {showReferralModal && <ReferralModal onClose={() => setShowReferralModal(false)} />}
      {showStoreModal && <FeedoStoreModal onClose={() => setShowStoreModal(false)} />}
      {showNotificationsModal && (
        <NotificationsModal onClose={() => setShowNotificationsModal(false)} />
      )}
      {showWaysToEarnModal && <WaysToEarnModal onClose={() => setShowWaysToEarnModal(false)} />}
      {showLoginHistoryModal && (
        <LoginHistoryModal onClose={() => setShowLoginHistoryModal(false)} />
      )}
      {showSkillsModal && <FeedoSkillsModal onClose={() => setShowSkillsModal(false)} />}
      {showSettingsModal && <SettingsModal onClose={() => setShowSettingsModal(false)} />}
    </div>
  );
};
