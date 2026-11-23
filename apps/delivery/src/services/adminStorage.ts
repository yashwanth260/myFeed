import { PartnerProfile, AccountStatus } from '../types';
import { mockPartnerProfile } from '../data/mockProfile';
import { storeService } from './storeService';
import { bannerService } from './bannerService';

export interface PartnerUsageRecord {
  id: string;
  partnerId: string;
  partnerName: string;
  action:
    | 'LOGIN'
    | 'DUTY_ONLINE'
    | 'DUTY_OFFLINE'
    | 'ORDER_ACCEPTED'
    | 'PICKUP_VERIFIED'
    | 'DELIVERY_COMPLETED'
    | 'PROFILE_UPDATED'
    | 'BANK_UPDATED'
    | 'REGISTRATION_SUBMITTED'
    | 'STATUS_CHANGED';
  details: string;
  timestamp: string;
  zone: string;
}

export interface AdminFleetSummary {
  totalPartners: number;
  approvedPartners: number;
  underReviewPartners: number;
  pendingDocsPartners: number;
  suspendedPartners: number;
  rejectedPartners: number;
  onlinePartners: number;
  totalTripsCompleted: number;
  totalEarningsDisbursed: number;
}

const STORAGE_KEY_PARTNERS = 'feedo_fleet_partners_v2';
const STORAGE_KEY_LOGS = 'feedo_fleet_logs_v2';

export const defaultFleetPartners: PartnerProfile[] = [
  {
    ...mockPartnerProfile,
    id: 'FD10245',
    applicationId: 'FD-APP-102938',
    name: 'Rahul Kumar',
    phone: '+91 99999 99999',
    accountStatus: 'APPROVED',
    city: 'Bengaluru',
    currentZone: 'Indiranagar Zone',
    rating: 4.85,
    totalRatings: 342,
  },
  {
    id: 'FD-P-10290',
    applicationId: 'FD-APP-102938',
    accountStatus: 'UNDER_REVIEW',
    name: 'Ramesh Reddy',
    phone: '+91 88888 88888',
    email: 'ramesh.reddy@gmail.com',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    rating: 5.0,
    totalRatings: 0,
    partnerSince: 'Sep 2026',
    city: 'Bengaluru',
    currentZone: 'HSR Layout Zone',
    vehicle: {
      type: 'Scooter',
      model: 'TVS Ntorq 125',
      number: 'KA 05 AB 5678',
      fuelType: 'Petrol',
      insuranceValidUntil: '2027-08-31',
      rcNumber: 'KA0520230012998',
      pucValidUntil: '2026-12-31',
    },
    bankDetails: {
      accountHolder: 'Ramesh Reddy',
      bankName: 'Axis Bank Ltd.',
      accountNumberMasked: '•••• •••• 4521',
      ifscCode: 'UTIB0000845',
      upiId: 'ramesh96@okaxis',
      isVerified: true,
    },
  },
  {
    id: 'FD-P-10291',
    applicationId: 'FD-APP-709123',
    accountStatus: 'DOCUMENTS_PENDING',
    missingDocuments: ['Driving Licence (Front & Back)', 'Vehicle RC Copy'],
    name: 'Kavita Sharma',
    phone: '+91 77777 77777',
    email: 'kavita.sharma@yahoo.com',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    rating: 5.0,
    totalRatings: 0,
    partnerSince: 'Sep 2026',
    city: 'Bengaluru',
    currentZone: 'Koramangala Zone',
    vehicle: {
      type: 'Motorcycle',
      model: 'Hero Splendor Plus',
      number: 'KA 01 EV 9921',
      fuelType: 'Petrol',
      insuranceValidUntil: '2027-05-20',
      rcNumber: 'KA0120220055123',
      pucValidUntil: '2026-11-15',
    },
    bankDetails: {
      accountHolder: 'Kavita Sharma',
      bankName: 'ICICI Bank',
      accountNumberMasked: '•••• •••• 8812',
      ifscCode: 'ICIC0000102',
      upiId: 'kavita@okicici',
      isVerified: false,
    },
  },
  {
    id: 'FD-P-10292',
    applicationId: 'FD-APP-601244',
    accountStatus: 'REJECTED',
    rejectionReason: 'Driving licence photo match failed due to image blurriness.',
    name: 'Suresh Nair',
    phone: '+91 66666 66666',
    email: 'suresh.nair@hotmail.com',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    rating: 4.2,
    totalRatings: 12,
    partnerSince: 'Aug 2026',
    city: 'Bengaluru',
    currentZone: 'Whitefield Zone',
    vehicle: {
      type: 'Scooter',
      model: 'Ather 450X',
      number: 'KA 03 EV 4410',
      fuelType: 'Electric Vehicle',
      insuranceValidUntil: '2027-09-10',
      rcNumber: 'KA0320230099412',
      pucValidUntil: '2027-01-20',
    },
    bankDetails: {
      accountHolder: 'Suresh Nair',
      bankName: 'State Bank of India',
      accountNumberMasked: '•••• •••• 1109',
      ifscCode: 'SBIN0001420',
      upiId: 'suresh@oksbi',
      isVerified: false,
    },
  },
  {
    id: 'FD-P-10293',
    applicationId: 'FD-APP-501199',
    accountStatus: 'SUSPENDED',
    rejectionReason: 'Cancellation threshold exceeded (3 consecutive rejected assignments).',
    name: 'Vikas Verma',
    phone: '+91 55555 55555',
    email: 'vikas.verma@outlook.com',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    rating: 3.8,
    totalRatings: 84,
    partnerSince: 'Jan 2026',
    city: 'Bengaluru',
    currentZone: 'Jayanagar Zone',
    vehicle: {
      type: 'Motorcycle',
      model: 'Bajaj Pulsar 150',
      number: 'KA 02 MH 7788',
      fuelType: 'Petrol',
      insuranceValidUntil: '2026-11-30',
      rcNumber: 'KA0220210044123',
      pucValidUntil: '2026-10-10',
    },
    bankDetails: {
      accountHolder: 'Vikas Verma',
      bankName: 'Kotak Mahindra Bank',
      accountNumberMasked: '•••• •••• 3341',
      ifscCode: 'KKBK0000451',
      upiId: 'vikas@okkotak',
      isVerified: true,
    },
  },
  {
    id: 'FD-P-10294',
    applicationId: 'FD-APP-401882',
    accountStatus: 'APPROVED',
    name: 'Ananya Deshmukh',
    phone: '+91 91234 56789',
    email: 'ananya.deshmukh@gmail.com',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    rating: 4.95,
    totalRatings: 218,
    partnerSince: 'Feb 2026',
    city: 'Bengaluru',
    currentZone: 'Bellandur Hub',
    vehicle: {
      type: 'Electric Vehicle',
      model: 'Ola S1 Pro',
      number: 'KA 51 EK 8812',
      fuelType: 'Electric Vehicle',
      insuranceValidUntil: '2027-11-15',
      rcNumber: 'KA5120230088912',
      pucValidUntil: '2027-04-10',
    },
    bankDetails: {
      accountHolder: 'Ananya Deshmukh',
      bankName: 'Federal Bank',
      accountNumberMasked: '•••• •••• 5590',
      ifscCode: 'FDRL0001340',
      upiId: 'ananya@fednet',
      isVerified: true,
    },
  },
];

const defaultUsageLogs: PartnerUsageRecord[] = [
  {
    id: 'LOG-1001',
    partnerId: 'FD10245',
    partnerName: 'Rahul Kumar',
    action: 'DUTY_ONLINE',
    details: 'Partner switched availability to ONLINE in Indiranagar Zone.',
    timestamp: 'Today, 11:30 AM',
    zone: 'Indiranagar Zone',
  },
  {
    id: 'LOG-1002',
    partnerId: 'FD10245',
    partnerName: 'Rahul Kumar',
    action: 'ORDER_ACCEPTED',
    details: 'Accepted Order #FD-8921 from Meghana Foods (₹65 earning).',
    timestamp: 'Today, 11:42 AM',
    zone: 'Indiranagar Zone',
  },
  {
    id: 'LOG-1003',
    partnerId: 'FD10245',
    partnerName: 'Rahul Kumar',
    action: 'PICKUP_VERIFIED',
    details: 'Store pickup code verified (Code: 4821) at Meghana Foods.',
    timestamp: 'Today, 11:58 AM',
    zone: 'Indiranagar Zone',
  },
  {
    id: 'LOG-1004',
    partnerId: 'FD10245',
    partnerName: 'Rahul Kumar',
    action: 'DELIVERY_COMPLETED',
    details: 'Completed delivery to Priya Sharma via customer OTP (9102). Credited ₹65.',
    timestamp: 'Today, 12:15 PM',
    zone: 'Indiranagar Zone',
  },
  {
    id: 'LOG-1005',
    partnerId: 'FD-P-10294',
    partnerName: 'Ananya Deshmukh',
    action: 'LOGIN',
    details: 'Partner logged in from mobile device (Android 14, Bellandur).',
    timestamp: 'Today, 01:05 PM',
    zone: 'Bellandur Hub',
  },
  {
    id: 'LOG-1006',
    partnerId: 'FD-P-10290',
    partnerName: 'Ramesh Reddy',
    action: 'REGISTRATION_SUBMITTED',
    details: 'Submitted onboarding documents (DL, RC, Bank Details). Status: Under Review.',
    timestamp: 'Yesterday, 04:30 PM',
    zone: 'HSR Layout Zone',
  },
];

class AdminStorageService {
  getPartners(): PartnerProfile[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PARTNERS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load fleet partners from storage', e);
    }
    this.savePartners(defaultFleetPartners);
    return defaultFleetPartners;
  }

  savePartners(partners: PartnerProfile[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_PARTNERS, JSON.stringify(partners));
    } catch (e) {
      console.error('Failed to save fleet partners to storage', e);
    }
  }

  getUsageLogs(): PartnerUsageRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LOGS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load usage logs from storage', e);
    }
    this.saveUsageLogs(defaultUsageLogs);
    return defaultUsageLogs;
  }

  saveUsageLogs(logs: PartnerUsageRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save usage logs to storage', e);
    }
  }

  addUsageLog(log: Omit<PartnerUsageRecord, 'id' | 'timestamp'> & { timestamp?: string }): PartnerUsageRecord {
    const logs = this.getUsageLogs();
    const newRecord: PartnerUsageRecord = {
      id: `LOG-${Date.now().toString().slice(-5)}`,
      timestamp: log.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...log,
    };
    const updated = [newRecord, ...logs].slice(0, 100); // keep last 100
    this.saveUsageLogs(updated);
    return newRecord;
  }

  exportAllDataAsJSON(): string {
    const data = {
      exportedAt: new Date().toISOString(),
      appName: 'Feedo Delivery Partner Fleet',
      company: 'Feedo Logistics',
      fleetSummary: this.getFleetSummary(),
      partners: this.getPartners(),
      usageLogs: this.getUsageLogs(),
      storeProducts: storeService.getProductsSync(),
      homeBanners: bannerService.getBannersSync(),
    };
    return JSON.stringify(data, null, 2);
  }

  importDataFromJSON(jsonStr: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.partners && Array.isArray(parsed.partners)) {
        this.savePartners(parsed.partners);
        if (parsed.usageLogs && Array.isArray(parsed.usageLogs)) {
          this.saveUsageLogs(parsed.usageLogs);
        }
        if (parsed.storeProducts && Array.isArray(parsed.storeProducts)) {
          parsed.storeProducts.forEach((prod: any) => storeService.saveProduct(prod));
        }
        if (parsed.homeBanners && Array.isArray(parsed.homeBanners)) {
          parsed.homeBanners.forEach((b: any) => bannerService.saveBanner(b));
        }
        return { success: true, message: `Successfully imported ${parsed.partners.length} partners, ${parsed.usageLogs?.length || 0} usage records, ${parsed.storeProducts?.length || 0} store items, and ${parsed.homeBanners?.length || 0} home banners.` };
      }
      return { success: false, message: 'Invalid JSON format: missing partners array.' };
    } catch (err: any) {
      return { success: false, message: `JSON parsing error: ${err.message}` };
    }
  }

  resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEY_PARTNERS);
    localStorage.removeItem(STORAGE_KEY_LOGS);
    this.savePartners(defaultFleetPartners);
    this.saveUsageLogs(defaultUsageLogs);
  }

  getFleetSummary(): AdminFleetSummary {
    const partners = this.getPartners();
    return {
      totalPartners: partners.length,
      approvedPartners: partners.filter((p) => p.accountStatus === 'APPROVED').length,
      underReviewPartners: partners.filter((p) => p.accountStatus === 'UNDER_REVIEW').length,
      pendingDocsPartners: partners.filter((p) => p.accountStatus === 'DOCUMENTS_PENDING').length,
      suspendedPartners: partners.filter((p) => p.accountStatus === 'SUSPENDED').length,
      rejectedPartners: partners.filter((p) => p.accountStatus === 'REJECTED').length,
      onlinePartners: partners.filter((p) => p.accountStatus === 'APPROVED').length > 0 ? 1 : 0, // live duty
      totalTripsCompleted: 840,
      totalEarningsDisbursed: 45890,
    };
  }
}

export const adminStorage = new AdminStorageService();

