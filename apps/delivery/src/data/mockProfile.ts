import {
  PartnerProfile,
  DocumentItem,
  InsuranceDetails,
  InboxMessageItem,
  LoginHistoryRecord,
  SpecialBenefitItem,
  FeedoStoreItem,
  FeedoSkillLesson,
} from '../types';

export const mockInsuranceDetails: InsuranceDetails = {
  policyNumber: 'FEEDO-GIC-9924810-KA',
  provider: 'ICICI Lombard GIC Ltd.',
  status: 'ACTIVE',
  validUntil: '31 March 2027',
  sumInsured: '₹5,00,000',
  claimHelpline: '1800-2666-419 (24x7 TPA)',
  cashlessHospitalsCount: 840,
  coverageDetails: [
    'On-Duty Accidental Death & Permanent Disability Cover: ₹5,00,000',
    'Emergency Hospitalisation & OPD Reimbursement: Up to ₹1,00,000',
    'Complimentary 24/7 Telehealth Doctor Consultations for Partner & Family',
    'Ambulance & Emergency Medical Evacuation: Up to ₹10,000',
  ],
};

export const mockPartnerProfile: PartnerProfile = {
  id: 'FD10245',
  applicationId: 'FD-APP-102938',
  accountStatus: 'APPROVED',
  name: 'Rahul Kumar',
  phone: '+91 99999 99999',
  email: 'rahul.kumar@feedo.com',
  photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  rating: 4.8,
  totalRatings: 342,
  partnerSince: 'March 2025',
  joiningDate: '15 March 2025',
  orderCategory: 'Food & Hyperlocal',
  city: 'Bengaluru',
  currentZone: 'Indiranagar Zone',
  preferredLanguage: 'English',
  appLanguage: 'English',
  insurance: mockInsuranceDetails,
  vehicle: {
    type: 'Scooter',
    model: 'Honda Activa 6G',
    number: 'KA 01 XX 1234',
    fuelType: 'Petrol',
    insuranceValidUntil: 'Oct 15, 2027',
    rcNumber: 'KA0120240098123',
    pucValidUntil: 'Nov 30, 2026',
  },
  bankDetails: {
    accountHolder: 'Rahul Kumar',
    bankName: 'HDFC Bank Ltd.',
    accountNumberMasked: '•••• •••• 9812',
    ifscCode: 'HDFC0001245',
    upiId: 'rahul99@okhdfcbank',
    isVerified: true,
  },
};

export const mockInboxMessages: InboxMessageItem[] = [
  {
    id: 'msg-1',
    title: 'Monsoon Safety Advisory & Gear Guidelines',
    sender: 'Feedo Operations Team',
    summary: 'Essential monsoon safety checklist, wet-weather riding tips, and raincoat usage.',
    body: 'Dear Partner, with heavy rainfall forecasted across Indiranagar & Koramangala hubs, please prioritize your safety. Maintain safe braking distance, wear official waterproof gear, and utilize live support in case of route waterlogging.',
    timestamp: 'Today, 10:30 AM',
    isRead: false,
    category: 'SAFETY',
  },
  {
    id: 'msg-2',
    title: 'Automatic Wednesday Payout Scheduled',
    sender: 'Feedo Finance Desk',
    summary: 'Your weekly eligible payout is being processed for direct deposit this Wednesday.',
    body: 'Your weekly eligible earnings have been consolidated. Direct ACH transfer to your registered HDFC Bank account will be completed on Wednesday.',
    timestamp: 'Yesterday, 6:00 PM',
    isRead: false,
    category: 'PAYMENTS',
  },
  {
    id: 'msg-3',
    title: 'Partner Health Checkup Camp at Indiranagar Hub',
    sender: 'Feedo Care Team',
    summary: 'Complimentary eye testing and general health checkup for all active delivery partners.',
    body: 'Visit the Feedo Partner Hub at 100ft Road, Indiranagar between 10 AM and 4 PM for free health screening, BP check, and eye examination.',
    timestamp: '2 days ago',
    isRead: true,
    category: 'COMMUNITY',
  },
];

export const mockLoginHistory: LoginHistoryRecord[] = [
  {
    id: 'lh-1',
    device: 'Samsung Galaxy A54 (Android 14) • Feedo Partner App v2.4.1',
    location: 'Bengaluru, Karnataka (Indiranagar)',
    ipAddress: '103.112.44.18',
    timestamp: 'Active Now (Current Session)',
    status: 'CURRENT',
  },
  {
    id: 'lh-2',
    device: 'Samsung Galaxy A54 (Android 14)',
    location: 'Bengaluru, Karnataka',
    ipAddress: '103.112.44.18',
    timestamp: '29 Oct 2026, 08:15 AM',
    status: 'SUCCESS',
  },
  {
    id: 'lh-3',
    device: 'Samsung Galaxy A54 (Android 14)',
    location: 'Bengaluru, Karnataka',
    ipAddress: '49.207.210.94',
    timestamp: '28 Oct 2026, 07:45 AM',
    status: 'SUCCESS',
  },
  {
    id: 'lh-4',
    device: 'Samsung Galaxy A54 (Android 14)',
    location: 'Bengaluru, Karnataka',
    ipAddress: '49.207.210.94',
    timestamp: '27 Oct 2026, 08:00 AM',
    status: 'SUCCESS',
  },
];

export const mockSpecialBenefits: SpecialBenefitItem[] = [
  {
    id: 'ben-1',
    title: 'Fuel Savings & Cash Back',
    partner: 'IndianOil & BPCL Hubs',
    description: 'Instant ₹2.50/L flat cashback when fueling at authorized partner fuel outlets.',
    discountBadge: 'Flat ₹2.50/L off',
    category: 'FUEL',
  },
  {
    id: 'ben-2',
    title: 'Two-Wheeler Service & Maintenance',
    partner: 'GoMechanic Partner Network',
    description: 'Discounted engine oil change, tyre pressure check, and brake servicing for scooters & bikes.',
    discountBadge: '25% Off Labour',
    category: 'VEHICLE',
  },
  {
    id: 'ben-3',
    title: '24/7 Family Telehealth Consultations',
    partner: 'Apollo 24|7 & Practo',
    description: 'Free unlimited online consultations with verified general physicians for partners and their families.',
    discountBadge: '100% Free',
    category: 'HEALTH',
  },
  {
    id: 'ben-4',
    title: 'Rider Refreshment & Meal Deals',
    partner: 'Feedo Merchant Cafes',
    description: 'Subsidized tea, snacks, and water refills across designated partner merchant partner spots.',
    discountBadge: 'Up to 30% Off',
    category: 'FOOD',
  },
];

export const mockFeedoStoreItems: FeedoStoreItem[] = [
  {
    id: 'store-1',
    name: 'Feedo Insulated Delivery Backpack (Thermal 45L)',
    category: 'Official Gear',
    price: 699,
    description: 'Heavy-duty water-repellent bag with thermal foil lining to keep hot food piping hot and cold orders chilled.',
    inStock: true,
  },
  {
    id: 'store-2',
    name: 'Feedo Quick-Dry Partner Dry-Fit T-Shirt (Pack of 2)',
    category: 'Apparel',
    price: 349,
    description: 'Breathable, sweat-wicking fabric with reflective safety strips for day and night visibility.',
    inStock: true,
  },
  {
    id: 'store-3',
    name: 'Heavy Monsoon Raincoat & Pant Set',
    category: 'Weather Protection',
    price: 549,
    description: '100% waterproof seam-sealed rain suit with hood and high-visibility neon reflective piping.',
    inStock: true,
  },
  {
    id: 'store-4',
    name: 'Waterproof Handlebar Phone Mount & Charger',
    category: 'Accessories',
    price: 299,
    description: 'Shock-absorbing silicone mount with 360-degree rotation and fast USB charging pass-through.',
    inStock: true,
  },
];

export const mockSkillLessons: FeedoSkillLesson[] = [
  {
    id: 'skill-1',
    title: 'Defensive City Riding & Wet Weather Safety',
    durationMinutes: 6,
    completed: true,
    category: 'SAFETY',
    description: 'Master road hazard identification, safe following distances, and emergency braking techniques.',
  },
  {
    id: 'skill-2',
    title: 'Spill-Proof Packaging & Multi-Course Food Handling',
    durationMinutes: 4,
    completed: true,
    category: 'SERVICE',
    description: 'Learn how to handle soups, curries, and ice creams safely to maintain 5-star customer ratings.',
  },
  {
    id: 'skill-3',
    title: 'Navigating Busy Apartment Complexes & OTP Dropoffs',
    durationMinutes: 5,
    completed: false,
    category: 'NAVIGATION',
    description: 'Quick gate pass protocols, intercom best practices, and contactless OTP verification etiquette.',
  },
  {
    id: 'skill-4',
    title: 'Daily Two-Wheeler Pre-Ride Maintenance Checklist',
    durationMinutes: 4,
    completed: false,
    category: 'VEHICLE',
    description: '2-minute tyre pressure, headlight, brake fluid, and chain tension checks before starting duty.',
  },
];

export const mockDocuments: DocumentItem[] = [
  { id: 'doc-1', name: 'Aadhaar Card (Front & Back)', type: 'Identity Proof', status: 'VERIFIED', documentNumberMasked: '•••• •••• 4512' },
  { id: 'doc-2', name: 'PAN Card', type: 'Tax ID', status: 'VERIFIED', documentNumberMasked: 'ABCDE••••F' },
  { id: 'doc-3', name: 'Driving Licence (DL)', type: 'License', status: 'VERIFIED', documentNumberMasked: 'KA01 2022•••••••', expiryDate: '2035-12-31' },
  { id: 'doc-4', name: 'Vehicle RC (Registration Certificate)', type: 'Vehicle', status: 'VERIFIED', documentNumberMasked: 'KA01XX1234' },
  { id: 'doc-5', name: 'Vehicle Insurance Certificate', type: 'Vehicle', status: 'VERIFIED', documentNumberMasked: 'POL-99214012', expiryDate: '2027-10-15' },
  { id: 'doc-6', name: 'Pollution Under Control (PUC)', type: 'Vehicle', status: 'UNDER_REVIEW', documentNumberMasked: 'PUC-8812341' },
  { id: 'doc-7', name: 'Bank Passbook / Cancelled Cheque', type: 'Payout', status: 'VERIFIED', documentNumberMasked: 'HDFC0001245' }
];
