import React from 'react';
import { Home, Bike, Wallet, User, ShieldAlert, HelpCircle, LogOut, SlidersHorizontal } from 'lucide-react';
import { NavTab } from './BottomNav';
import { useAuth } from '../../context/AuthContext';
import { useDelivery } from '../../context/DeliveryContext';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenHelp: () => void;
  onOpenSos: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenHelp,
  onOpenSos,
}) => {
  const { logout, setIsAdminPortalOpen } = useAuth();
  const { isOnline, toggleOnline, activeOrder, activeOrders } = useDelivery();

  const activeCount = activeOrders && activeOrders.length > 0 ? activeOrders.length : (activeOrder ? 1 : 0);
  const mainItems = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'earnings' as NavTab, label: 'Earnings', icon: Wallet },
    { id: 'orders' as NavTab, label: 'Online Trips', icon: Bike, badge: activeCount },
    { id: 'profile' as NavTab, label: 'Profile', icon: User },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 min-h-[calc(100vh-61px)] p-4 flex-shrink-0 font-sans shadow-xs">
      {/* Duty Status Card */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-4 mb-6 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duty Status</div>
            <div className={`text-sm font-black ${isOnline ? 'text-emerald-600' : 'text-slate-400'}`}>
              {isOnline ? 'ONLINE & ACTIVE' : 'OFFLINE'}
            </div>
          </div>
          <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
        </div>
        <button
          onClick={toggleOnline}
          type="button"
          className={`w-full py-2.5 px-4 rounded-2xl font-black text-xs transition-all shadow-xs cursor-pointer ${
            isOnline
              ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              : 'bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 shadow-amber-200/60'
          }`}
        >
          {isOnline ? 'GO OFFLINE' : 'GO ONLINE'}
        </button>
      </div>

      {/* Main Navigation Links */}
      <div className="space-y-1 mb-8 flex-1">
        <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Main Menu
        </div>
        {mainItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              type="button"
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-50 text-slate-950 border border-amber-300 shadow-xs font-black'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={isActive ? 'text-amber-600' : 'text-slate-400'} />
                <span>{item.label}</span>
              </div>
              {item.badge && item.badge > 0 ? (
                <span className="w-5 h-5 bg-[#FACC15] text-slate-950 font-black text-xs rounded-full flex items-center justify-center border border-amber-300">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Secondary Bottom Actions */}
      <div className="space-y-1.5 pt-4 border-t border-slate-100">
        <button
          onClick={() => setIsAdminPortalOpen(true)}
          type="button"
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100/70 border border-amber-300/80 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal size={15} className="text-amber-600 group-hover:rotate-45 transition-transform" />
            <span>Admin Dashboard</span>
          </div>
          <span className="text-[9px] font-black bg-[#FACC15] text-slate-950 px-1.5 py-0.5 rounded-full border border-amber-300">
            ALL DATA
          </span>
        </button>

        <button
          onClick={onOpenHelp}
          type="button"
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <HelpCircle size={16} className="text-slate-400" />
          <span>Help & Support</span>
        </button>

        <button
          onClick={onOpenSos}
          type="button"
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <ShieldAlert size={16} />
          <span>Emergency SOS</span>
        </button>

        <button
          onClick={logout}
          type="button"
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
