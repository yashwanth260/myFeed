/**
 * CraveCart Transactional Data Store
 * In-memory relational storage layer with full relational integrity,
 * foreign key validation, and seed data covering restaurants, Feedo Meat, Feedo Mart,
 * active coupons, users, drivers, orders, and financial ledger.
 */

const { hashPassword } = require('../security/auth');

class DataStore {
  constructor() {
    this.reset();
  }

  reset() {
    this.users = new Map();
    this.restaurants = new Map();
    this.categories = new Map();
    this.menuItems = new Map();
    this.customizations = new Map();
    this.coupons = new Map();
    this.orders = new Map();
    this.payments = new Map();
    this.deliveryAssignments = new Map();
    this.driverLocations = new Map();
    this.driverEarnings = [];
    this.restaurantSettlements = [];
    this.disputeTickets = new Map();
    this.auditLogs = [];
    this.webhookEvents = new Set(); // For webhook idempotency deduplication

    this.seedDefaultData();
  }

  seedDefaultData() {
    // 1. Seed Users
    const defaultPasswordHash = hashPassword('Pass@123');
    const adminPasswordHash = hashPassword('Admin@123');

    const seedUsers = [
      {
        id: 'usr-customer-01',
        email: 'customer@cravecart.in',
        phone: '+919876543210',
        fullName: 'Alex Johnson',
        passwordHash: defaultPasswordHash,
        role: 'CUSTOMER',
        accountStatus: 'ACTIVE',
        addresses: [
          {
            id: 'addr-01',
            title: 'Home',
            fullAddress: '108, 100ft Road, 4th Block, Koramangala',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560034',
            latitude: 12.9352,
            longitude: 77.6245,
            isDefault: true,
          },
        ],
      },
      {
        id: 'usr-restaurant-01',
        email: 'partner@spicejunction.in',
        phone: '+919876543211',
        fullName: 'Chef Rajesh Sharma',
        passwordHash: defaultPasswordHash,
        role: 'RESTAURANT_OWNER',
        accountStatus: 'ACTIVE',
      },
      {
        id: 'usr-delivery-01',
        email: 'rider@cravecart.in',
        phone: '+919876543212',
        fullName: 'Rahul Kumar',
        passwordHash: defaultPasswordHash,
        role: 'DELIVERY_PARTNER',
        accountStatus: 'ACTIVE',
        isOnline: true,
        currentLat: 12.9716,
        currentLng: 77.5946,
        vehicleType: 'Electric Scooter',
        rating: 4.85,
        totalDeliveries: 142,
      },
      {
        id: 'usr-admin-01',
        email: 'admin@cravecart.in',
        phone: '+919876543299',
        fullName: 'Super Administrator',
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
        accountStatus: 'ACTIVE',
      },
    ];

    seedUsers.forEach((u) => this.users.set(u.id, u));

    // 2. Seed Restaurants
    const seedRestaurants = [
      {
        id: 'res-feedo-central',
        name: 'Feedo Central / Spice Junction',
        slug: 'feedo-central',
        description: 'Authentic Indian delicacies, Biryanis, Fresh Meats & Daily Mart Essentials',
        logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200',
        bannerUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
        address: '42 MG Road, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560038',
        latitude: 12.9784,
        longitude: 77.6408,
        cuisineTypes: ['Biryani', 'Indian', 'Fast Food', 'Fresh Meat', 'Grocery'],
        isApproved: true,
        isActive: true,
        isOpen: true,
        minOrderAmountPaise: 10000,
        baseDeliveryFeePaise: 4000,
        freeDeliveryThresholdPaise: 50000,
        packagingFeePaise: 1500,
        commissionRatePercent: 15.0,
        estimatedPrepTimeMinutes: 25,
        rating: 4.8,
        ratingCount: 435,
      },
      {
        id: 'res-burger-republic',
        name: 'The Burger Republic',
        slug: 'the-burger-republic',
        description: 'Artisanal smash burgers, hand-spun shakes and loaded crispy sides',
        logoUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=200',
        bannerUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800',
        address: '12 80ft Road, Koramangala',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560095',
        latitude: 12.9344,
        longitude: 77.6189,
        cuisineTypes: ['Burgers', 'American', 'Beverages'],
        isApproved: true,
        isActive: true,
        isOpen: true,
        minOrderAmountPaise: 15000,
        baseDeliveryFeePaise: 4000,
        freeDeliveryThresholdPaise: 45000,
        packagingFeePaise: 2000,
        commissionRatePercent: 18.0,
        estimatedPrepTimeMinutes: 20,
        rating: 4.6,
        ratingCount: 310,
      },
      {
        id: 'res-royal-sushi',
        name: 'Royal Sushi Bar (Pending Verification)',
        slug: 'royal-sushi-bar',
        description: 'Authentic Japanese nigiri, sashimi, and maki rolls',
        logoUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200',
        bannerUrl: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=800',
        address: '5th Block, HSR Layout',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560102',
        latitude: 12.9121,
        longitude: 77.6446,
        cuisineTypes: ['Japanese', 'Sushi', 'Asian'],
        isApproved: false, // For admin approval workflow testing
        isActive: true,
        isOpen: false,
        minOrderAmountPaise: 25000,
        baseDeliveryFeePaise: 5000,
        freeDeliveryThresholdPaise: 75000,
        packagingFeePaise: 2500,
        commissionRatePercent: 15.0,
        estimatedPrepTimeMinutes: 35,
        rating: 4.7,
        ratingCount: 88,
      },
    ];

    seedRestaurants.forEach((r) => this.restaurants.set(r.id, r));

    // 3. Seed Menu Categories
    const seedCategories = [
      { id: 'cat-food', restaurantId: 'res-feedo-central', name: 'Food Items', displayOrder: 1 },
      { id: 'cat-meat', restaurantId: 'res-feedo-central', name: 'Feedo Meat', displayOrder: 2 },
      { id: 'cat-mart', restaurantId: 'res-feedo-central', name: 'Feedo Mart', displayOrder: 3 },
    ];

    seedCategories.forEach((c) => this.categories.set(c.id, c));

    // 4. Seed Menu Items (All prices strictly in integer paise: 100 paise = ₹1.00)
    const seedItems = [
      // Section A: Food Items
      {
        id: 'item-biryani-01',
        restaurantId: 'res-feedo-central',
        categoryId: 'cat-food',
        section: 'Food Item',
        name: 'Hyderabadi Dum Biryani',
        description: 'Authentic saffron-infused basmati rice slow-cooked with tender chicken & royal spices',
        pricePaise: 24900, // ₹249.00
        originalPricePaise: 32000,
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500',
        dietaryType: 'NON_VEG',
        isAvailable: true,
        isRecommended: true,
        rating: 4.8,
        prepTimeMins: 25,
      },
      {
        id: 'item-noodles-01',
        restaurantId: 'res-feedo-central',
        categoryId: 'cat-food',
        section: 'Food Item',
        name: 'Chicken Hakka Noodles',
        description: 'Wok-tossed noodles with farm vegetables, chicken slices and savory soy-garlic glaze',
        pricePaise: 18900, // ₹189.00
        originalPricePaise: 24000,
        imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500',
        dietaryType: 'NON_VEG',
        isAvailable: true,
        isRecommended: true,
        rating: 4.5,
        prepTimeMins: 20,
      },
      {
        id: 'item-buddha-01',
        restaurantId: 'res-feedo-central',
        categoryId: 'cat-food',
        section: 'Food Item',
        name: 'Buddha Rice Bowl',
        description: 'Nutritious golden turmeric rice tossed with steamed broccoli, edamame and sesame dressing',
        pricePaise: 22900, // ₹229.00
        originalPricePaise: 28000,
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
        dietaryType: 'VEG',
        isAvailable: true,
        isRecommended: false,
        rating: 4.6,
        prepTimeMins: 15,
      },
      {
        id: 'item-burger-01',
        restaurantId: 'res-feedo-central',
        categoryId: 'cat-food',
        section: 'Food Item',
        name: 'Gourmet Beef / Veg Cheese Burger',
        description: 'Flame-grilled patty layered with melted cheddar, crisp lettuce and secret house sauce',
        pricePaise: 16900, // ₹169.00
        originalPricePaise: 21000,
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
        dietaryType: 'NON_VEG',
        isAvailable: true,
        isRecommended: true,
        rating: 4.4,
        prepTimeMins: 20,
      },
      {
        id: 'item-fries-01',
        restaurantId: 'res-feedo-central',
        categoryId: 'cat-food',
        section: 'Food Item',
        name: 'Crispy Golden French Fries',
        description: 'Double-fried hand-cut salted potato fries served with zesty dip',
        pricePaise: 9900, // ₹99.00
        originalPricePaise: 14000,
        imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500',
        dietaryType: 'VEG',
        isAvailable: true,
        isRecommended: false,
        rating: 4.7,
        prepTimeMins: 10,
      },

      // Section B: Feedo Meat (User requested section)
      {
        id: 'item-meat-chicken',
        restaurantId: 'res-feedo-central',
        categoryId: 'cat-meat',
        section: 'Feedo Meat',
        name: 'Fresh Tender Chicken (Curry Cut, 500g)',
        description: '100% antibiotic-free, hygienically vacuum-packed fresh bone-in chicken curry cut',
        pricePaise: 18000, // ₹180.00
        originalPricePaise: 22000,
        imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500',
        dietaryType: 'NON_VEG',
        isAvailable: true,
        isRecommended: true,
        rating: 4.9,
        prepTimeMins: 15,
      },
      {
        id: 'item-meat-mutton',
        restaurantId: 'res-feedo-central',
        categoryId: 'cat-meat',
        section: 'Feedo Meat',
        name: 'Premium Goat Mutton (Curry Cut, 500g)',
        description: 'Pasture-raised, tender young goat meat cut precisely for rich curries',
        pricePaise: 42000, // ₹420.00
        originalPricePaise: 48000,
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500',
        dietaryType: 'NON_VEG',
        isAvailable: true,
        isRecommended: true,
        rating: 4.8,
        prepTimeMins: 20,
      },
      {
        id: 'item-meat-prawns',
        restaurantId: 'res-feedo-central',
        categoryId: 'cat-meat',
        section: 'Feedo Meat',
        name: 'Cleaned Fresh Sea Prawns (250g)',
        description: 'Fresh coastal catch, deveined and shell-off, ready to pan sear or curry',
        pricePaise: 26000, // ₹260.00
        originalPricePaise: 31000,
        imageUrl: 'https://images.unsplash.com/photo-1559742811-822863c4caaf?w=500',
        dietaryType: 'NON_VEG',
        isAvailable: true,
        isRecommended: false,
        rating: 4.7,
        prepTimeMins: 15,
      },
      {
        id: 'item-meat-salmon',
        restaurantId: 'res-feedo-central',
        categoryId: 'cat-meat',
        section: 'Feedo Meat',
        name: 'Atlantic Salmon Fillet (200g)',
        description: 'Rich in Omega-3, boneless skin-on pink salmon steak',
        pricePaise: 38000, // ₹380.00
        originalPricePaise: 44000,
        imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500',
        dietaryType: 'NON_VEG',
        isAvailable: true,
        isRecommended: true,
        rating: 4.9,
        prepTimeMins: 15,
      },
      {
        id: 'item-meat-eggs',
        restaurantId: 'res-feedo-central',
        categoryId: 'cat-meat',
        section: 'Feedo Meat',
        name: 'Farm Fresh Classic White Eggs (Pack of 12)',
        description: 'Grade-A farm eggs, cleaned and tested for supreme freshness',
        pricePaise: 9500, // ₹95.00
        originalPricePaise: 11000,
        imageUrl: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=500',
        dietaryType: 'EGG',
        isAvailable: true,
        isRecommended: false,
        rating: 4.6,
        prepTimeMins: 5,
      },

      // Section C: Feedo Mart (User requested section)
      {
        id: 'item-mart-avocado',
        restaurantId: 'res-feedo-central',
        categoryId: 'cat-mart',
        section: 'Feedo Mart',
        name: 'Fresh Hass Avocados (Pack of 2)',
        description: 'Creamy, perfectly ripe avocados ideal for salads and guacamole',
        pricePaise: 16000, // ₹160.00
        originalPricePaise: 19000,
        imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500',
        dietaryType: 'VEG',
        isAvailable: true,
        isRecommended: true,
        rating: 4.8,
        prepTimeMins: 5,
      },
      {
        id: 'item-mart-strawberry',
        restaurantId: 'res-feedo-central',
        categoryId: 'cat-mart',
        section: 'Feedo Mart',
        name: 'Sweet Mahabaleshwar Strawberries (200g)',
        description: 'Juicy, fragrant ruby strawberries picked fresh from the hills',
        pricePaise: 12000, // ₹120.00
        originalPricePaise: 15000,
        imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500',
        dietaryType: 'VEG',
        isAvailable: true,
        isRecommended: true,
        rating: 4.7,
        prepTimeMins: 5,
      },
      {
        id: 'item-mart-milk',
        restaurantId: 'res-feedo-central',
        categoryId: 'cat-mart',
        section: 'Feedo Mart',
        name: 'Organic A2 Pasteurized Farm Milk (1L)',
        description: 'Pure, wholesome non-homogenized natural whole milk bottle',
        pricePaise: 7500, // ₹75.00
        originalPricePaise: 8500,
        imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500',
        dietaryType: 'VEG',
        isAvailable: true,
        isRecommended: false,
        rating: 4.9,
        prepTimeMins: 5,
      },
      {
        id: 'item-mart-sourdough',
        restaurantId: 'res-feedo-central',
        categoryId: 'cat-mart',
        section: 'Feedo Mart',
        name: 'Artisanal Sourdough Bread (400g)',
        description: 'Slow-fermented crusty artisan loaf baked fresh every morning',
        pricePaise: 9000, // ₹90.00
        originalPricePaise: 11000,
        imageUrl: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=500',
        dietaryType: 'VEG',
        isAvailable: true,
        isRecommended: false,
        rating: 4.8,
        prepTimeMins: 5,
      },
      {
        id: 'item-mart-paneer',
        restaurantId: 'res-feedo-central',
        categoryId: 'cat-mart',
        section: 'Feedo Mart',
        name: 'Fresh Malai Dairy Paneer (200g)',
        description: 'Melt-in-mouth cottage cheese crafted from pure full-cream milk',
        pricePaise: 8500, // ₹85.00
        originalPricePaise: 10000,
        imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500',
        dietaryType: 'VEG',
        isAvailable: true,
        isRecommended: true,
        rating: 4.8,
        prepTimeMins: 5,
      },
      {
        id: 'item-mart-blueberries',
        restaurantId: 'res-feedo-central',
        categoryId: 'cat-mart',
        section: 'Feedo Mart',
        name: 'Fresh Imported Blueberries (125g)',
        description: 'Plump antioxidant-packed berries for yogurt and smoothie bowls',
        pricePaise: 19000, // ₹190.00
        originalPricePaise: 23000,
        imageUrl: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=500',
        dietaryType: 'VEG',
        isAvailable: true,
        isRecommended: false,
        rating: 4.6,
        prepTimeMins: 5,
      },

      // Feedo Mart Beverages & Juices
      {
        id: 'item-mart-orange',
        restaurantId: 'res-feedo-central',
        categoryId: 'cat-mart',
        section: 'Feedo Mart',
        name: 'Valencia Orange Fresh Cold-Pressed Juice',
        description: 'Cold-pressed 100% natural Valencia oranges without added sugar',
        pricePaise: 7900, // ₹79.00
        originalPricePaise: 11000,
        imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500',
        dietaryType: 'VEG',
        isAvailable: true,
        isRecommended: true,
        rating: 4.8,
        prepTimeMins: 8,
      },
      {
        id: 'item-mart-smoothie',
        restaurantId: 'res-feedo-central',
        categoryId: 'cat-mart',
        section: 'Feedo Mart',
        name: 'Strawberry Greek Yogurt Smoothie',
        description: 'Blended fresh strawberries with greek yogurt and wild honey',
        pricePaise: 9900, // ₹99.00
        originalPricePaise: 13000,
        imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500',
        dietaryType: 'VEG',
        isAvailable: true,
        isRecommended: true,
        rating: 4.5,
        prepTimeMins: 8,
      },
    ];

    seedItems.forEach((i) => this.menuItems.set(i.id, i));

    // 5. Seed Promo Coupons
    const seedCoupons = [
      {
        id: 'cpn-welcome50',
        code: 'WELCOME50',
        description: '50% off on your first orders up to ₹100',
        discountType: 'PERCENTAGE',
        discountValue: 50, // 50%
        maxDiscountPaise: 10000, // Max ₹100 discount
        minOrderAmountPaise: 19900, // Min order ₹199
        isActive: true,
        validUntil: '2028-12-31T23:59:59Z',
      },
      {
        id: 'cpn-crave20',
        code: 'CRAVE20',
        description: '20% flat discount on all food & mart items',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        maxDiscountPaise: 15000, // Max ₹150 discount
        minOrderAmountPaise: 30000, // Min order ₹300
        isActive: true,
        validUntil: '2028-12-31T23:59:59Z',
      },
      {
        id: 'cpn-freedel',
        code: 'FREEDEL',
        description: 'Free delivery on orders above ₹249',
        discountType: 'FLAT',
        discountValue: 4000, // ₹40 off delivery fee
        maxDiscountPaise: 4000,
        minOrderAmountPaise: 24900,
        isActive: true,
        validUntil: '2028-12-31T23:59:59Z',
      },
    ];

    seedCoupons.forEach((c) => this.coupons.set(c.code.toUpperCase(), c));

    // 6. Seed Existing Active Order for Kitchen & Driver Testing
    const seedOrder = {
      id: 'ord-8821',
      orderNumber: 'CC-8821-492',
      userId: 'usr-customer-01',
      restaurantId: 'res-feedo-central',
      orderStatus: 'READY_FOR_PICKUP',
      paymentStatus: 'COMPLETED',
      paymentMethod: 'RAZORPAY',
      addressSnapshot: {
        title: 'Home',
        fullAddress: '108, 100ft Road, 4th Block, Koramangala, Bengaluru',
        city: 'Bengaluru',
        postalCode: '560034',
        latitude: 12.9352,
        longitude: 77.6245,
      },
      items: [
        {
          id: 'oi-01',
          menuItemId: 'item-biryani-01',
          name: 'Hyderabadi Dum Biryani',
          unitPricePaise: 24900,
          quantity: 2,
          lineTotalPaise: 49800,
        },
        {
          id: 'oi-02',
          menuItemId: 'item-drink-orange',
          name: 'Orange Blossom Fresh Juice',
          unitPricePaise: 7900,
          quantity: 2,
          lineTotalPaise: 15800,
        },
      ],
      subtotalPaise: 65600,
      discountPaise: 10000, // WELCOME50 applied
      deliveryFeePaise: 0,   // Free above ₹500
      serviceFeePaise: 1500,
      taxPaise: 2780,
      finalTotalPaise: 59880, // ₹598.80
      couponCode: 'WELCOME50',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.orders.set(seedOrder.id, seedOrder);

    // Seed Driver Assignment for seed order
    const seedAssignment = {
      id: 'asg-01',
      orderId: 'ord-8821',
      driverId: 'usr-delivery-01',
      status: 'ACCEPTED',
      offeredAt: new Date(Date.now() - 15 * 60000).toISOString(),
      acceptedAt: new Date(Date.now() - 10 * 60000).toISOString(),
      estimatedDistanceKm: 3.8,
      payoutAmountPaise: 6500,
    };

    this.deliveryAssignments.set(seedAssignment.orderId, seedAssignment);

    // Seed initial Financial Settlement for restaurant
    this.restaurantSettlements.push({
      id: 'stl-01',
      restaurantId: 'res-feedo-central',
      periodStart: '2026-11-01T00:00:00Z',
      periodEnd: '2026-11-03T23:59:59Z',
      grossSalesPaise: 1850000, // ₹18,500.00
      platformCommissionPaise: 277500, // ₹2,775.00 (15%)
      netPayoutPaise: 1572500, // ₹15,725.00
      settlementStatus: 'SETTLED',
      payoutReference: 'UTR-HDFC-99201481',
      settledAt: new Date().toISOString(),
    });

    // Seed Audit Log
    this.auditLogs.push({
      id: 'aud-01',
      actorId: 'usr-admin-01',
      action: 'APPROVE_RESTAURANT',
      targetType: 'RESTAURANT',
      targetId: 'res-feedo-central',
      details: { name: 'Feedo Central', fssai: '21221190000123' },
      ipAddress: '127.0.0.1',
      createdAt: new Date().toISOString(),
    });
  }
}

// Singleton store instance
const db = new DataStore();
module.exports = db;

