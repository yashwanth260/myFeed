import { WeeklyPayoutRecord, NextScheduledPayout } from '../types';

/**
 * Calculates the next scheduled Wednesday dynamically based on business calendar.
 */
export function getNextWednesdayDate(fromDate: Date = new Date()): string {
  const date = new Date(fromDate);
  const day = date.getDay(); // 0 is Sunday, 3 is Wednesday
  let daysToAdd = (3 - day + 7) % 7;
  if (daysToAdd === 0) {
    daysToAdd = 7; // Next Wednesday cycle
  }
  date.setDate(date.getDate() + daysToAdd);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export interface DailyEarningsHistoryItem {
  id: string;
  date: string;
  formattedDate: string;
  totalEarned: number;
  completedTrips: number;
  details: string;
}

export const totalEarningsSummary = {
  totalAmount: 8450.0,
  periodLabel: 'Current Settlement Period (Oct 1 – Oct 29, 2026)',
  customerTipsTotal: 350.0,
  rainSurgeBonusesTotal: 180.0,
};

export const todayEarningsSummary = {
  total: 640.0,
  weeklyTotal: 8450.0,
  nextPayoutDate: getNextWednesdayDate(),
};

export const nextAutomaticPayout: NextScheduledPayout = {
  scheduledDay: 'Wednesday',
  scheduledDate: getNextWednesdayDate(),
  expectedPayout: 2450.0,
  bankName: 'HDFC Bank',
  bankAccountMasked: '•••• 4821',
  status: 'SCHEDULED',
  notice: 'Your eligible earnings are automatically paid every Wednesday. No withdrawal request is required.',
};

/**
 * Daily settlement history strictly formatted with approved categories
 */
export const earningsHistoryData: DailyEarningsHistoryItem[] = [
  {
    id: 'EH-1029',
    date: '2026-10-29',
    formattedDate: 'Today, Oct 29',
    totalEarned: 640.0,
    completedTrips: 12,
    details: '12 trips completed • Includes customer tips & surge bonuses',
  },
  {
    id: 'EH-1028',
    date: '2026-10-28',
    formattedDate: 'Yesterday, Oct 28',
    totalEarned: 780.0,
    completedTrips: 15,
    details: '15 trips completed • Settled to Wednesday cycle',
  },
  {
    id: 'EH-1027',
    date: '2026-10-27',
    formattedDate: 'Tue, Oct 27',
    totalEarned: 590.0,
    completedTrips: 11,
    details: '11 trips completed • Settled to Wednesday cycle',
  },
  {
    id: 'EH-1026',
    date: '2026-10-26',
    formattedDate: 'Mon, Oct 26',
    totalEarned: 710.0,
    completedTrips: 14,
    details: '14 trips completed • Settled to Wednesday cycle',
  },
  {
    id: 'EH-1025',
    date: '2026-10-25',
    formattedDate: 'Sun, Oct 25',
    totalEarned: 920.0,
    completedTrips: 18,
    details: '18 trips completed • Settled to Wednesday cycle',
  },
  {
    id: 'EH-1024',
    date: '2026-10-24',
    formattedDate: 'Sat, Oct 24',
    totalEarned: 860.0,
    completedTrips: 16,
    details: '16 trips completed • Settled to Wednesday cycle',
  },
];

/**
 * Historical automatic Wednesday bank payouts
 */
export const weeklyPayoutHistoryData: WeeklyPayoutRecord[] = [
  {
    id: 'PO-2026-1028',
    payoutDate: 'Wednesday, Oct 28, 2026',
    amount: 2840.0,
    bankAccountMasked: 'HDFC Bank •••• 4821',
    transactionRef: 'UPI/6642019921/HDFC',
    status: 'PAID',
  },
  {
    id: 'PO-2026-1021',
    payoutDate: 'Wednesday, Oct 21, 2026',
    amount: 3120.0,
    bankAccountMasked: 'HDFC Bank •••• 4821',
    transactionRef: 'UPI/5531024419/HDFC',
    status: 'PAID',
  },
  {
    id: 'PO-2026-1014',
    payoutDate: 'Wednesday, Oct 14, 2026',
    amount: 2650.0,
    bankAccountMasked: 'HDFC Bank •••• 4821',
    transactionRef: 'UPI/4412093310/HDFC',
    status: 'PAID',
  },
  {
    id: 'PO-2026-1007',
    payoutDate: 'Wednesday, Oct 07, 2026',
    amount: 2980.0,
    bankAccountMasked: 'HDFC Bank •••• 4821',
    transactionRef: 'UPI/3301048822/HDFC',
    status: 'PAID',
  },
];
