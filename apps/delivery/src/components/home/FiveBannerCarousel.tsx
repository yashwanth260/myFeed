import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Wrench,
  Package,
  HeartPulse,
  Users,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { bannerService, BannerItemData } from '../../services/bannerService';

export interface BannerItem {
  id: string;
  badge: string;
  title: string;
  description: string;
  icon: React.ElementType;
  ctaText: string;
  actionDestination?: 'care' | 'help' | 'store' | 'orders' | 'profile';
  accentColor: string;
  tagColor: string;
  illustrationBg: string;
  imageUrl?: string;
  imageReferenceId?: string;
  isVisible?: boolean;
}

const ICON_MAP: Record<string, React.ElementType> = {
  ShieldCheck,
  Wrench,
  Package,
  HeartPulse,
  Users,
};

export const DEFAULT_FIVE_BANNERS: BannerItem[] = [
  {
    id: 'banner-1',
    badge: 'Partner Safety',
    title: '24/7 On-Road Assistance Active',
    description: 'Ride with peace of mind. Emergency SOS and instant support are just a tap away.',
    icon: ShieldCheck,
    ctaText: 'Safety Guide',
    actionDestination: 'care',
    accentColor: '#D97706',
    tagColor: 'bg-amber-50 text-amber-900 border-amber-300',
    illustrationBg: 'from-amber-50/90 via-amber-100/30 to-white',
    isVisible: true,
  },
  {
    id: 'banner-2',
    badge: 'Vehicle Care',
    title: 'Vehicle & EV Partner Support',
    description: 'Access partner service centers for bike tune-ups, tire checks, and quick battery swaps.',
    icon: Wrench,
    ctaText: 'Find Service Hub',
    actionDestination: 'orders',
    accentColor: '#0284C7',
    tagColor: 'bg-sky-50 text-sky-900 border-sky-300',
    illustrationBg: 'from-sky-50/90 via-sky-100/30 to-white',
    isVisible: true,
  },
  {
    id: 'banner-3',
    badge: 'Official Gear',
    title: 'Feedo Weatherproof Delivery Gear',
    description: 'Keep food fresh and protected with official insulated delivery bags and rainwear.',
    icon: Package,
    ctaText: 'Check Partner Gear',
    actionDestination: 'store',
    accentColor: '#CA8A04',
    tagColor: 'bg-amber-50 text-amber-900 border-amber-300',
    illustrationBg: 'from-yellow-50/90 via-amber-100/30 to-white',
    isVisible: true,
  },
  {
    id: 'banner-4',
    badge: 'Healthcare & Wellness',
    title: 'Partner Care & Coverage Support',
    description: 'On-duty accident protection and complimentary telehealth consultations for active riders.',
    icon: HeartPulse,
    ctaText: 'View Care Policy',
    actionDestination: 'profile',
    accentColor: '#E11D48',
    tagColor: 'bg-rose-50 text-rose-900 border-rose-300',
    illustrationBg: 'from-rose-50/90 via-rose-100/30 to-white',
    isVisible: true,
  },
  {
    id: 'banner-5',
    badge: 'Fleet Community',
    title: 'Hub Meetups & Rider Support',
    description: 'Connect with local area fleet managers and top-rated delivery partners in your cluster.',
    icon: Users,
    ctaText: 'Join Fleet Network',
    actionDestination: 'help',
    accentColor: '#9333EA',
    tagColor: 'bg-purple-50 text-purple-900 border-purple-300',
    illustrationBg: 'from-purple-50/90 via-purple-100/30 to-white',
    isVisible: true,
  },
];

interface FiveBannerCarouselProps {
  banners?: BannerItem[];
  onBannerAction?: (banner: BannerItem) => void;
  autoPlayIntervalMs?: number;
}

export const FiveBannerCarousel: React.FC<FiveBannerCarouselProps> = ({
  banners: propBanners,
  onBannerAction,
  autoPlayIntervalMs = 6000,
}) => {
  const [liveBanners, setLiveBanners] = useState<BannerItemData[]>(() => {
    return bannerService.getBannersSync();
  });

  useEffect(() => {
    bannerService.getBanners().then(setLiveBanners);
    const unsub = bannerService.subscribe(setLiveBanners);
    return () => unsub();
  }, []);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const activeBanners: BannerItem[] = (propBanners ? propBanners : liveBanners)
    .filter((b) => b.isVisible !== false)
    .map((b) => {
      const iconComp =
        ('icon' in b && b.icon) ||
        ('iconName' in b && ICON_MAP[b.iconName as string]) ||
        ShieldCheck;
      return {
        ...b,
        icon: iconComp,
      } as BannerItem;
    });

  const displayBanners = activeBanners.length > 0 ? activeBanners : DEFAULT_FIVE_BANNERS;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayBanners.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + displayBanners.length) % displayBanners.length);
  };

  // Touch Swipe Handlers for mobile smartphones
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 40;

    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  // Auto-play timer
  useEffect(() => {
    if (autoPlayIntervalMs <= 0 || displayBanners.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, autoPlayIntervalMs);

    return () => clearInterval(timer);
  }, [currentIndex, autoPlayIntervalMs, displayBanners.length]);

  return (
    <div className="relative w-full space-y-3">
      {/* Carousel Track Container */}
      <div
        className="relative overflow-hidden rounded-3xl border border-slate-100 shadow-sm bg-white touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {displayBanners.map((banner, index) => {
            const Icon = banner.icon;
            return (
              <div
                key={banner.id}
                className={`w-full flex-shrink-0 bg-gradient-to-br ${banner.illustrationBg} p-5 sm:p-6 min-h-[170px] sm:min-h-[180px] flex flex-col justify-between select-none`}
              >
                {/* Top Badge & Number Indicator */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shadow-xs ${banner.tagColor}`}
                  >
                    <Sparkles size={11} />
                    <span>{banner.badge}</span>
                  </span>

                  <span className="text-[11px] font-mono font-bold text-slate-400">
                    {index + 1} / {displayBanners.length}
                  </span>
                </div>

                {/* Banner Content Body */}
                <div className="flex items-center justify-between gap-4 my-2">
                  <div className="space-y-1 max-w-sm sm:max-w-md">
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-snug">
                      {banner.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                      {banner.description}
                    </p>
                  </div>

                  {banner.imageUrl ? (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm border-2 border-white bg-white">
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs border border-white/90 bg-white"
                      style={{ color: banner.accentColor }}
                    >
                      <Icon size={24} />
                    </div>
                  )}
                </div>

                {/* Action button */}
                <div className="pt-1 flex items-center justify-between">
                  <button
                    onClick={() => onBannerAction && onBannerAction(banner)}
                    type="button"
                    className="inline-flex items-center gap-1 text-xs font-black text-slate-900 hover:text-amber-800 transition-colors cursor-pointer group"
                  >
                    <span className="underline underline-offset-4 decoration-slate-300 group-hover:decoration-amber-500">
                      {banner.ctaText}
                    </span>
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Arrow Controls */}
        <button
          onClick={handlePrev}
          type="button"
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-slate-950 border border-slate-200/90 flex items-center justify-center transition-all cursor-pointer hidden sm:flex shadow-xs"
          aria-label="Previous Banner"
        >
          <ChevronLeft size={16} />
        </button>

        <button
          onClick={handleNext}
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-slate-950 border border-slate-200/90 flex items-center justify-center transition-all cursor-pointer hidden sm:flex shadow-xs"
          aria-label="Next Banner"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="flex items-center justify-center gap-1.5 py-1">
        {displayBanners.map((banner, index) => {
          const isActive = index === currentIndex;
          return (
            <button
              key={banner.id}
              onClick={() => setCurrentIndex(index)}
              type="button"
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'w-6 bg-[#FACC15] shadow-xs'
                  : 'w-1.5 bg-slate-200 hover:bg-slate-300'
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
};
