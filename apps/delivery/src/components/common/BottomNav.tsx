import React from 'react';
import { Home, Wallet, Bike, User } from 'lucide-react';

export type NavTab = 'home' | 'earnings' | 'orders' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  activeOrderCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  activeOrderCount = 0,
}) => {
  // Exactly 4 tabs matching reference sketch:
  // 1. Home — House icon.
  // 2. Earnings — Wallet or rupee icon.
  // 3. Online Trips — Delivery or route icon.
  // 4. Profile — User icon.
  const navItems = [
    {
      id: 'home' as NavTab,
      label: 'Home',
      icon: Home,
    },
    {
      id: 'earnings' as NavTab,
      label: 'Earnings',
      icon: Wallet,
    },
    {
      id: 'orders' as NavTab,
      label: 'Online Trips',
      icon: Bike,
      badge: activeOrderCount,
    },
    {
      id: 'profile' as NavTab,
      label: 'Profile',
      icon: User,
    },
  ];

  return (
    <nav className="sticky bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-100 rounded-t-3xl shadow-[0_-6px_30px_rgba(15,23,42,0.07)] px-3 py-2 sm:py-2.5 pb-[calc(0.6rem+env(safe-area-inset-bottom,0px))] font-sans shrink-0">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              type="button"
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 cursor-pointer min-w-[72px] min-h-[48px] select-none ${
                isActive
                  ? 'text-slate-950 font-black'
                  : 'text-slate-400 hover:text-slate-700 font-medium'
              }`}
              aria-label={item.label}
            >
              <div className="relative">
                <Icon
                  size={21}
                  className={`transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.4] text-slate-950' : 'stroke-[1.8]'
                  }`}
                />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 bg-[#FACC15] text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center border border-amber-300 shadow-xs">
                    {item.badge}
                  </span>
                ) : null}
              </div>

              <span className={`text-[11px] mt-1 tracking-tight ${isActive ? 'font-black text-slate-900' : 'font-medium text-slate-400'}`}>
                {item.label}
              </span>

              {/* Active Tab Indicator Underline */}
              {isActive && (
                <span className="absolute -bottom-1 w-6 h-1 bg-[#FACC15] rounded-full shadow-xs" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
