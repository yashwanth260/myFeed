import { Order } from '../types';

export const mockOrders: Order[] = [
  {
    id: 'FD102938',
    category: 'FOOD',
    store: {
      name: 'Nandi Gourmet Burgers',
      address: '100 Feet Rd, Indiranagar, Bengaluru',
      phone: '+91 98765 43210',
      lat: 12.9784,
      lng: 77.6408,
      preparationStatus: 'Food Ready for Pickup'
    },
    customer: {
      name: 'Rohan Sharma',
      address: 'Flat 402, Sunshine Heights, 12th Main, Indiranagar, Bengaluru',
      phone: '+91 98123 45678',
      lat: 12.9716,
      lng: 77.6475,
      instructions: 'Please ring bell twice. Leave with security if non-responsive.'
    },
    distanceToPickup: 1.2,
    deliveryDistance: 2.6,
    totalDistance: 3.8,
    estimatedEarnings: 40.00,
    earningsBreakdown: {
      deliveryEarning: 20.00,
      basePay: 20.00,
      distancePay: 0.00,
      surgeBonus: 0,
      tip: 20.00
    },
    estimatedTime: 18,
    items: [
      { id: 'i1', name: 'Smokey BBQ Cheese Burger', quantity: 2, price: 349 },
      { id: 'i2', name: 'Peri Peri Seasoned Fries (Large)', quantity: 1, price: 159 },
      { id: 'i3', name: 'Cold Coffee Thickshake', quantity: 2, price: 199 }
    ],
    itemCount: 5,
    zone: 'Indiranagar',
    pickupCode: '4821',
    deliveryOtp: '9102',
    status: 'OFFERED',
    createdAt: 'Today, 1:42 PM'
  },
  {
    id: 'FD102939',
    category: 'GROCERY',
    store: {
      name: 'Fresh Mart Superstore',
      address: '80 Feet Rd, Koramangala 4th Block, Bengaluru',
      phone: '+91 98765 11223',
      lat: 12.9352,
      lng: 77.6245,
      preparationStatus: 'Packed & Sealed'
    },
    customer: {
      name: 'Priya Sundaram',
      address: 'Villa 14, Green Acre Enclave, HSR Layout, Bengaluru',
      phone: '+91 98450 99887',
      lat: 12.9121,
      lng: 77.6446,
      instructions: 'Deliver to back entry porch.'
    },
    distanceToPickup: 0.8,
    deliveryDistance: 4.0,
    totalDistance: 4.8,
    estimatedEarnings: 21.20,
    earningsBreakdown: {
      deliveryEarning: 21.20,
      basePay: 0.00,
      distancePay: 21.20,
      surgeBonus: 0,
      tip: 0.00
    },
    estimatedTime: 22,
    items: [
      { id: 'g1', name: 'Amul Taaza Milk 1L', quantity: 2, price: 140 },
      { id: 'g2', name: 'Fortune Sunlite Oil 5L', quantity: 1, price: 720 },
      { id: 'g3', name: 'Aashirvaad Whole Wheat Atta 10kg', quantity: 1, price: 440 },
      { id: 'g4', name: 'Britannia Good Day Biscuits', quantity: 4, price: 120 }
    ],
    itemCount: 8,
    zone: 'Koramangala',
    pickupCode: '3194',
    deliveryOtp: '7412',
    status: 'COMPLETED',
    createdAt: 'Today, 12:15 PM',
    acceptedAt: '12:16 PM',
    pickedUpAt: '12:28 PM',
    deliveredAt: '12:45 PM'
  },
  {
    id: 'FD102940',
    category: 'ELECTRONICS',
    store: {
      name: 'Croma Digital Store',
      address: 'Phoenix Marketcity, Mahadevapura, Bengaluru',
      phone: '+91 98200 44332',
      lat: 12.9961,
      lng: 77.6961,
      preparationStatus: 'Secured Box Ready'
    },
    customer: {
      name: 'Vikram Mehta',
      address: 'Tower 3, Apt 1102, Prestige Shantiniketan, ITPL Main Rd, Whitefield',
      phone: '+91 99800 12345',
      lat: 12.9866,
      lng: 77.7289,
      instructions: 'Electronic item - Fragile handling required.'
    },
    distanceToPickup: 2.1,
    deliveryDistance: 5.0,
    totalDistance: 7.1,
    estimatedEarnings: 46.50,
    earningsBreakdown: {
      deliveryEarning: 26.50,
      basePay: 0.00,
      distancePay: 26.50,
      surgeBonus: 0,
      tip: 20.00
    },
    estimatedTime: 28,
    items: [
      { id: 'e1', name: 'Boat Airdopes 141 Wireless Earbuds', quantity: 1, price: 1299 },
      { id: 'e2', name: 'Anker PowerBank 10000mAh', quantity: 1, price: 1899 }
    ],
    itemCount: 2,
    zone: 'Whitefield',
    pickupCode: '9012',
    deliveryOtp: '6543',
    status: 'COMPLETED',
    createdAt: 'Today, 11:30 AM',
    acceptedAt: '11:31 AM',
    pickedUpAt: '11:42 AM',
    deliveredAt: '12:08 PM'
  },
  {
    id: 'FD102941',
    category: 'MEAT',
    store: {
      name: 'Licious Fresh Meat Hub',
      address: 'HRBR Layout 2nd Block, Kalyan Nagar, Bengaluru',
      phone: '+91 97411 22334',
      lat: 13.0189,
      lng: 77.6441
    },
    customer: {
      name: 'Ananya Roy',
      address: 'House No. 89, 4th Cross, Kammanahalli Main Rd, Bengaluru',
      phone: '+91 98866 54321',
      lat: 13.0092,
      lng: 77.6389
    },
    distanceToPickup: 1.0,
    deliveryDistance: 10.0,
    totalDistance: 11.0,
    estimatedEarnings: 63.00,
    earningsBreakdown: {
      deliveryEarning: 53.00,
      basePay: 0.00,
      distancePay: 53.00,
      surgeBonus: 0,
      tip: 10.00
    },
    estimatedTime: 30,
    items: [
      { id: 'm1', name: 'Fresh Chicken Curry Cut (Skinless) 500g', quantity: 2, price: 338 },
      { id: 'm2', name: 'Mutton Curry Cut 500g', quantity: 1, price: 540 }
    ],
    itemCount: 3,
    zone: 'Kalyan Nagar',
    pickupCode: '1589',
    deliveryOtp: '8821',
    status: 'COMPLETED',
    createdAt: 'Today, 10:45 AM',
    acceptedAt: '10:46 AM',
    pickedUpAt: '10:55 AM',
    deliveredAt: '11:22 AM'
  },
  {
    id: 'FD102942',
    category: 'VEGETABLES',
    store: {
      name: 'Organic Mandi Direct',
      address: 'Jayanagar 4th Block Market, Bengaluru',
      phone: '+91 98440 11998',
      lat: 12.9250,
      lng: 77.5838
    },
    customer: {
      name: 'Kavitha N',
      address: '15th Main, JP Nagar 2nd Phase, Bengaluru',
      phone: '+91 97312 88440',
      lat: 12.9100,
      lng: 77.5860
    },
    distanceToPickup: 1.4,
    deliveryDistance: 1.0,
    totalDistance: 2.4,
    estimatedEarnings: 20.00,
    earningsBreakdown: {
      deliveryEarning: 20.00,
      basePay: 20.00,
      distancePay: 0.00,
      surgeBonus: 0,
      tip: 0.00
    },
    estimatedTime: 12,
    items: [
      { id: 'v1', name: 'Fresh Organic Spinach (Palak) 250g', quantity: 3, price: 60 },
      { id: 'v2', name: 'Farm Tomatoes 1kg', quantity: 2, price: 70 },
      { id: 'v3', name: 'Robusta Bananas 1kg', quantity: 1, price: 55 }
    ],
    itemCount: 6,
    zone: 'Jayanagar',
    pickupCode: '7721',
    deliveryOtp: '3341',
    status: 'COMPLETED',
    createdAt: 'Today, 09:50 AM',
    acceptedAt: '09:51 AM',
    pickedUpAt: '10:02 AM',
    deliveredAt: '10:14 AM'
  },
  {
    id: 'FD102943',
    category: 'FASHION',
    store: {
      name: 'Trendz Apparel Boutique',
      address: 'Commercial Street, Tasker Town, Shivajinagar, Bengaluru',
      phone: '+91 98800 77665',
      lat: 12.9822,
      lng: 77.6083
    },
    customer: {
      name: 'Deepak Rao',
      address: 'Apt 2B, Benson Cross Rd, Benson Town, Bengaluru',
      phone: '+91 99000 88112',
      lat: 12.9980,
      lng: 77.6020
    },
    distanceToPickup: 1.9,
    deliveryDistance: 2.0,
    totalDistance: 3.9,
    estimatedEarnings: 30.00,
    earningsBreakdown: {
      deliveryEarning: 20.00,
      basePay: 20.00,
      distancePay: 0.00,
      surgeBonus: 0,
      tip: 10.00
    },
    estimatedTime: 18,
    items: [
      { id: 'f1', name: 'Cotton Slim Fit Shirt (Navy Blue L)', quantity: 1, price: 1499 }
    ],
    itemCount: 1,
    zone: 'Shivajinagar',
    pickupCode: '6632',
    deliveryOtp: '2290',
    status: 'COMPLETED',
    createdAt: 'Today, 09:10 AM',
    acceptedAt: '09:11 AM',
    pickedUpAt: '09:20 AM',
    deliveredAt: '09:35 AM'
  },
  {
    id: 'FD102944',
    category: 'HYPERLOCAL',
    store: {
      name: 'PrintX Express Document Hub',
      address: 'Sanjay Nagar Main Rd, Bengaluru',
      phone: '+91 98455 33221',
      lat: 13.0381,
      lng: 77.5750
    },
    customer: {
      name: 'Dr. Suresh Kumar',
      address: 'RMV 2nd Stage, Dollars Colony, Bengaluru',
      phone: '+91 98860 11223',
      lat: 13.0310,
      lng: 77.5680
    },
    distanceToPickup: 0.9,
    deliveryDistance: 3.0,
    totalDistance: 3.9,
    estimatedEarnings: 15.90,
    earningsBreakdown: {
      deliveryEarning: 15.90,
      basePay: 0.00,
      distancePay: 15.90,
      surgeBonus: 0,
      tip: 0.00
    },
    estimatedTime: 15,
    items: [
      { id: 'h1', name: 'Sealed Legal Document Envelope', quantity: 1, price: 150 }
    ],
    itemCount: 1,
    zone: 'Sanjay Nagar',
    pickupCode: '8810',
    deliveryOtp: '1109',
    status: 'COMPLETED',
    createdAt: 'Today, 08:30 AM',
    acceptedAt: '08:31 AM',
    pickedUpAt: '08:40 AM',
    deliveredAt: '08:52 AM'
  }
];

export const mockBatchedOffer: Order = {
  id: 'FD102999',
  category: 'FOOD',
  store: {
    name: 'Domino Express Pizza',
    address: '100 Feet Rd, Indiranagar, Bengaluru',
    phone: '+91 98765 00000',
    lat: 12.9780,
    lng: 77.6410,
    preparationStatus: '2 Orders Ready'
  },
  customer: {
    name: 'Customer A & Customer B (Route Batch)',
    address: 'Indiranagar 12th Main & 6th Cross (Combined 2 Drops)',
    phone: '+91 99999 00000',
    lat: 12.9720,
    lng: 77.6480,
    instructions: 'Batched express order'
  },
  distanceToPickup: 1.1,
  deliveryDistance: 6.0,
  totalDistance: 7.1,
  estimatedEarnings: 31.80,
  earningsBreakdown: {
    deliveryEarning: 31.80,
    basePay: 0.00,
    distancePay: 31.80,
    surgeBonus: 0,
    tip: 0.00
  },
  estimatedTime: 25,
  items: [
    { id: 'b1', name: 'Customer A: Pepperoni Feast Pizza', quantity: 1, price: 549 },
    { id: 'b2', name: 'Customer B: Farmhouse Pizza + Garlic Bread', quantity: 2, price: 689 }
  ],
  itemCount: 3,
  zone: 'Indiranagar',
  pickupCode: '5544',
  deliveryOtp: '7788',
  status: 'OFFERED',
  createdAt: 'Just now',
  isBatched: true,
  batchOrderCount: 2
};
