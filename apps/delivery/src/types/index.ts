export type CategoryType = 
  | 'FOOD' 
  | 'GROCERY' 
  | 'VEGETABLES' 
  | 'MEAT' 
  | 'FASHION' 
  | 'ELECTRONICS' 
  | 'HYPERLOCAL';

export type DeliveryState = 
  | 'OFFERED'
  | 'ACCEPTED'
  | 'GOING_TO_PICKUP'
  | 'ARRIVED_AT_PICKUP'
  | 'PICKUP_VERIFICATION'
  | 'PICKED_UP'
  | 'GOING_TO_CUSTOMER'
  | 'ARRIVED_AT_CUSTOMER'
  | 'DELIVERY_OTP'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export type GPSState = 'NORMAL' | 'ARRIVING' | 'ARRIVED' | 'OUTSIDE_GEOFENCE';

export type AccountStatus = 
  | 'REGISTERED' 
  | 'DOCUMENTS_PENDING' 
  | 'UNDER_REVIEW' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'SUSPENDED' 
  | 'INACTIVE';

export interface StoreInfo {
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  preparationStatus?: string;
}

export interface CustomerInfo {
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  instructions?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  category: CategoryType;
  store: StoreInfo;
  customer: CustomerInfo;
  distanceToPickup: number;
  deliveryDistance: number;
  totalDistance: number;
  estimatedEarnings: number;
  earningsBreakdown: {
    basePay?: number;
    distancePay?: number;
    deliveryEarning?: number;
    surgeBonus: number;
    tip: number;
  };
  estimatedTime: number;
  items: OrderItem[];
  itemCount: number;
  zone: string;
  pickupCode: string;
  deliveryOtp: string;
  status: DeliveryState;
  createdAt: string;
  acceptedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  cancellationReason?: string;
  isBatched?: boolean;
  batchOrderCount?: number;
  batchOrderId?: string;
}

export interface InsuranceDetails {
  policyNumber: string;
  provider: string;
  status: 'ACTIVE' | 'EXPIRED' | 'RENEWAL_DUE';
  validUntil: string;
  sumInsured: string;
  coverageDetails: string[];
  claimHelpline: string;
  cashlessHospitalsCount: number;
}

export interface PartnerProfile {
  id: string;
  applicationId: string;
  accountStatus: AccountStatus;
  rejectionReason?: string;
  missingDocuments?: string[];
  name: string;
  phone: string;
  email: string;
  photoUrl: string;
  rating: number;
  totalRatings: number;
  partnerSince: string;
  joiningDate?: string;
  orderCategory?: string;
  city: string;
  currentZone: string;
  preferredLanguage?: string;
  appLanguage?: string;
  insurance?: InsuranceDetails;
  vehicle: {
    type: 'Bike' | 'Scooter' | 'Bicycle' | 'Car' | 'Motorcycle' | 'Electric Vehicle';
    model: string;
    number: string;
    fuelType: string;
    insuranceValidUntil: string;
    rcNumber: string;
    pucValidUntil: string;
  };
  bankDetails: {
    accountHolder: string;
    bankName: string;
    accountNumberMasked: string;
    ifscCode: string;
    upiId: string;
    isVerified?: boolean;
  };
}

export interface DailyMetrics {
  earnings: number;
  ordersCompleted: number;
  distanceKm: number;
  onlineTimeMinutes: number;
  acceptanceRate: number;
  completionRate: number;
}

/** Automatic Wednesday Payout Status */
export type PayoutStatus = 'SCHEDULED' | 'PROCESSING' | 'PAID' | 'FAILED';

export interface WeeklyPayoutRecord {
  id: string;
  payoutDate: string; // e.g. "Wednesday, Oct 28, 2026"
  amount: number;
  bankAccountMasked: string;
  transactionRef: string;
  status: PayoutStatus;
}

export interface NextScheduledPayout {
  scheduledDay: string; // "Wednesday"
  scheduledDate: string; // e.g. "Wednesday, Nov 04, 2026"
  expectedPayout: number; // e.g. 2450
  bankName: string;
  bankAccountMasked: string;
  status: PayoutStatus;
  notice: string;
}

export interface NotificationItem {
  id: string;
  category: 'ORDER' | 'EARNINGS' | 'ACCOUNT' | 'SYSTEM';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface InboxMessageItem {
  id: string;
  title: string;
  sender: string;
  summary: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  category: 'OPERATIONS' | 'SAFETY' | 'PAYMENTS' | 'COMMUNITY';
}

export interface LoginHistoryRecord {
  id: string;
  device: string;
  location: string;
  ipAddress: string;
  timestamp: string;
  status: 'SUCCESS' | 'CURRENT';
}

export interface SpecialBenefitItem {
  id: string;
  title: string;
  partner: string;
  description: string;
  discountBadge: string;
  category: 'FUEL' | 'HEALTH' | 'VEHICLE' | 'FOOD';
}

export interface FeedoStoreItem {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl?: string;
  description: string;
  inStock: boolean;
  images?: string[];
  pickupHub?: string;
  isVisible?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FeedoSkillLesson {
  id: string;
  title: string;
  durationMinutes: number;
  completed: boolean;
  category: 'SAFETY' | 'NAVIGATION' | 'SERVICE' | 'VEHICLE';
  description: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  status: 'VERIFIED' | 'UNDER_REVIEW' | 'ACTION_REQUIRED' | 'MISSING';
  documentNumberMasked: string;
  expiryDate?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'partner' | 'support' | 'bot';
  text: string;
  timestamp: string;
  attachmentUrl?: string;
}

export interface ServiceZone {
  id: string;
  name: string;
  city: string;
  demandLevel: 'NORMAL' | 'HIGH' | 'VERY_HIGH';
  estimatedSurgeBonus: number;
  activeOrdersCount: number;
}
