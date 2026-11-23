import React from 'react';
import { NavTab } from '../common/BottomNav';
import { OnlineStatusCard } from '../home/OnlineStatusCard';
import { ReferFriendCard } from '../home/ReferFriendCard';
import { FiveBannerCarousel, BannerItem } from '../home/FiveBannerCarousel';
import { TodayProgressThreeCards } from '../home/TodayProgressThreeCards';
import { HomeBrandFooter } from '../home/HomeBrandFooter';
import { useDelivery } from '../../context/DeliveryContext';
import { Navigation, ArrowRight } from 'lucide-react';

interface DashboardViewProps {
  onNavigateTab: (tab: NavTab) => void;
  onOpenHelp: () => void;
  onOpenCare: () => void;
  onOpenReferralModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenHelp,
  onOpenCare,
  onOpenReferralModal,
}) => {
  const { activeOrder } = useDelivery();

  const handleBannerAction = (banner: BannerItem) => {
    if (banner.actionDestination === 'care' || banner.id === 'banner-1') {
      onOpenCare();
    } else if (banner.actionDestination === 'help' || banner.id === 'banner-5') {
      onOpenHelp();
    } else if (banner.actionDestination === 'profile') {
      onNavigateTab('profile');
    } else {
      onNavigateTab('orders');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-4.5 pb-28 md:pb-12 max-w-xl mx-auto w-full font-sans">
      {/* On-Duty Active Trip Notification Banner (if a live delivery is active) */}
      {activeOrder && (
        <div
          onClick={() => onNavigateTab('orders')}
          className="rounded-3xl bg-white border-2 border-amber-400 p-3.5 sm:p-4 shadow-sm flex items-center justify-between gap-3 cursor-pointer group hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 animate-pulse border border-amber-300/80">
              <Navigation size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider">
                  Active Delivery In Progress
                </span>
              </div>
              <div className="text-xs sm:text-sm font-black text-slate-900 mt-0.5">
                {activeOrder.store.name} ➔ {activeOrder.customer.name}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-black text-amber-700 group-hover:translate-x-1 transition-transform">
            <span>View Trip</span>
            <ArrowRight size={14} />
          </div>
        </div>
      )}

      {/* 2 & 3. "Let's serve the food!" & Online / Offline Toggle unified in ONE box */}
      <OnlineStatusCard />

      {/* 4. Refer a Friend Section: "Refer the friend" */}
      <ReferFriendCard onOpenReferralModal={onOpenReferralModal} />

      {/* 5. Swipeable Banner Carousel (Exactly 5 banners) */}
      <FiveBannerCarousel onBannerAction={handleBannerAction} />

      {/* 6. Today's Progress (Earnings, Online Time, Trips) — Directly after carousel, NO incentives */}
      <TodayProgressThreeCards
        onCardClick={(type) => {
          if (type === 'earnings') onNavigateTab('earnings');
          if (type === 'trips') onNavigateTab('orders');
          if (type === 'time') onNavigateTab('profile');
        }}
      />

      {/* 7. Brand Footer: "Eat happy. Live hearty!" */}
      <HomeBrandFooter />
    </div>
  );
};
