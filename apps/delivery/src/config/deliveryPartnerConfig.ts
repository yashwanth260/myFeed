/**
 * Feedo Delivery Partner Application Configuration
 * 
 * Central configuration architecture prepared for Firebase Authentication,
 * Cloud Firestore, Firebase Cloud Messaging, and delivery management.
 */

export interface BannerConfig {
  id: string;
  badge: string;
  title: string;
  description: string;
  ctaText: string;
  accentColor: string;
}

export interface ReferralConfig {
  defaultShareText: string;
  shareUrlBase: string;
  referralRewardNotice: string;
}

export interface DailyProgressConfig {
  defaultEarnings: number;
  defaultOnlineMinutes: number;
  defaultTrips: number;
}

export const FEEDO_APP_CONFIG = {
  appName: 'Feedo Delivery Partner',
  brandColors: {
    primary: '#00C853',
    primaryLight: '#00E676',
    primaryDark: '#059669',
    backgroundDark: '#0b0f19',
    cardDark: '#121826',
    cardElevated: '#172033',
    cardSubtle: '#0f1523',
    borderSubtle: 'rgba(255, 255, 255, 0.08)',
  },
  welcome: {
    heading: "Let's serve the food!",
    subtitle: 'Ready to deliver happiness today?',
    defaultZone: 'Indiranagar Hub',
  },
  referral: {
    defaultShareText: 'Join Feedo as a Delivery Partner! Earn daily payouts with flexible working hours.',
    shareUrlBase: 'https://feedodelivery.com/partner/join',
    referralRewardNotice: 'Referral stats sync upon verification.',
  } as ReferralConfig,
  dailyProgress: {
    defaultEarnings: 640,
    defaultOnlineMinutes: 320, // 5h 20m
    defaultTrips: 12,
  } as DailyProgressConfig,
  banners: [
    {
      id: 'banner-1',
      badge: 'Partner Safety',
      title: '24/7 On-Road Assistance Active',
      description: 'Ride with peace of mind. Emergency SOS and instant support are just a tap away.',
      ctaText: 'Safety Guide',
      accentColor: '#00E676',
    },
    {
      id: 'banner-2',
      badge: 'Vehicle Care',
      title: 'Vehicle & EV Partner Support',
      description: 'Access partner service centers for bike tune-ups, tire checks, and quick battery swaps.',
      ctaText: 'Find Service Hub',
      accentColor: '#38bdf8',
    },
    {
      id: 'banner-3',
      badge: 'Official Gear',
      title: 'Feedo Weatherproof Delivery Gear',
      description: 'Keep food fresh and protected with official insulated delivery bags and rainwear.',
      ctaText: 'Check Partner Gear',
      accentColor: '#fbbf24',
    },
    {
      id: 'banner-4',
      badge: 'Healthcare & Wellness',
      title: 'Partner Insurance & Care Coverage',
      description: 'On-duty accident protection and complimentary telehealth consultations for active riders.',
      ctaText: 'View Care Policy',
      accentColor: '#f43f5e',
    },
    {
      id: 'banner-5',
      badge: 'Rider Community',
      title: 'Feedo Partner Community Hub',
      description: 'Join local partner meetups, share city routing tips, and connect with fellow delivery partners.',
      ctaText: 'Explore Community',
      accentColor: '#a855f7',
    },
  ] as BannerConfig[],
};
