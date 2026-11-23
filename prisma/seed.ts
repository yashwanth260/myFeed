import { PrismaClient, Role, DietaryType, DiscountType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedPostgres() {
  console.log('🌱 Starting Feedo PostgreSQL Seeder...');

  // Standard password hash matching AuthModule
  const passwordHash = await bcrypt.hash('Password@123', 10);

  // 1. Seed Customer User
  console.log('👤 Seeding 1. Customer: customer@feedo.dev');
  const customer = await prisma.user.upsert({
    where: { email: 'customer@feedo.dev' },
    update: {
      passwordHash,
      fullName: 'Alex Johnson',
      phone: '+919876543210',
      role: Role.CUSTOMER,
      accountStatus: 'ACTIVE',
    },
    create: {
      id: 'usr-customer-feedo-01',
      email: 'customer@feedo.dev',
      phone: '+919876543210',
      fullName: 'Alex Johnson',
      passwordHash,
      role: Role.CUSTOMER,
      accountStatus: 'ACTIVE',
    },
  });

  // 2. Seed Restaurant Staff User
  console.log('👤 Seeding 2. Restaurant Staff: kitchen@feedo.dev');
  const staff = await prisma.user.upsert({
    where: { email: 'kitchen@feedo.dev' },
    update: {
      passwordHash,
      fullName: 'Vikram Sharma',
      phone: '+919876543211',
      role: Role.RESTAURANT_STAFF,
      accountStatus: 'ACTIVE',
    },
    create: {
      id: 'usr-staff-feedo-01',
      email: 'kitchen@feedo.dev',
      phone: '+919876543211',
      fullName: 'Vikram Sharma',
      passwordHash,
      role: Role.RESTAURANT_STAFF,
      accountStatus: 'ACTIVE',
    },
  });

  // 3. Seed Delivery Partner User
  console.log('👤 Seeding 3. Delivery Partner: rider@feedo.dev');
  const driver = await prisma.user.upsert({
    where: { email: 'rider@feedo.dev' },
    update: {
      passwordHash,
      fullName: 'Rohan Verma',
      phone: '+919876543212',
      role: Role.DELIVERY_PARTNER,
      accountStatus: 'ACTIVE',
    },
    create: {
      id: 'usr-driver-feedo-01',
      email: 'rider@feedo.dev',
      phone: '+919876543212',
      fullName: 'Rohan Verma',
      passwordHash,
      role: Role.DELIVERY_PARTNER,
      accountStatus: 'ACTIVE',
    },
  });

  // 4. Seed Platform Admin User
  console.log('👤 Seeding 4. Admin: admin@feedo.dev');
  await prisma.user.upsert({
    where: { email: 'admin@feedo.dev' },
    update: {
      passwordHash,
      fullName: 'Feedo Superadmin',
      phone: '+919876543213',
      role: Role.ADMIN,
      accountStatus: 'ACTIVE',
    },
    create: {
      id: 'usr-admin-feedo-01',
      email: 'admin@feedo.dev',
      phone: '+919876543213',
      fullName: 'Feedo Superadmin',
      passwordHash,
      role: Role.ADMIN,
      accountStatus: 'ACTIVE',
    },
  });

  // Seed Customer Address
  console.log('📍 Seeding Customer Address...');
  await prisma.address.upsert({
    where: { id: 'addr-customer-feedo-home' },
    update: {
      userId: customer.id,
      title: 'Home',
      fullAddress: '100 Feet Rd, Indiranagar, Bengaluru, Karnataka 560038',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      latitude: 12.9784,
      longitude: 77.6408,
      isDefault: true,
    },
    create: {
      id: 'addr-customer-feedo-home',
      userId: customer.id,
      title: 'Home',
      fullAddress: '100 Feet Rd, Indiranagar, Bengaluru, Karnataka 560038',
      landmark: 'Near 12th Main Junction',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      latitude: 12.9784,
      longitude: 77.6408,
      deliveryInstructions: 'Leave with security or ring bell',
      isDefault: true,
    },
  });

  // 4. Seed 2 Restaurants (Bengaluru coordinates)
  console.log('🍽️ Seeding 2 Restaurants: Bengaluru Tiffin House & Spice Route Kitchen...');
  const tiffinHouse = await prisma.restaurant.upsert({
    where: { slug: 'bengaluru-tiffin-house' },
    update: {
      name: 'Bengaluru Tiffin House',
      description: 'Iconic South Indian breakfast, crisp dosas, and authentic filter kaapi.',
      address: '24 Church Street, MG Road, Bengaluru',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560001',
      latitude: 12.9716,
      longitude: 77.5946,
      cuisineTypes: ['South Indian', 'Breakfast', 'Filter Coffee'],
      isApproved: true,
      isActive: true,
      isOpen: true,
      minOrderAmountPaise: 9900,
      baseDeliveryFeePaise: 3500,
      freeDeliveryThresholdPaise: 49900,
      rating: 4.8,
      ratingCount: 1420,
    },
    create: {
      id: 'res-feedo-tiffin-01',
      name: 'Bengaluru Tiffin House',
      slug: 'bengaluru-tiffin-house',
      description: 'Iconic South Indian breakfast, crisp dosas, and authentic filter kaapi.',
      address: '24 Church Street, MG Road, Bengaluru',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560001',
      latitude: 12.9716,
      longitude: 77.5946,
      cuisineTypes: ['South Indian', 'Breakfast', 'Filter Coffee'],
      openingTime: '07:00',
      closingTime: '22:30',
      isApproved: true,
      isActive: true,
      isOpen: true,
      minOrderAmountPaise: 9900,
      baseDeliveryFeePaise: 3500,
      freeDeliveryThresholdPaise: 49900,
      packagingFeePaise: 1500,
      commissionRatePercent: 12.0,
      estimatedPrepTimeMinutes: 18,
      rating: 4.8,
      ratingCount: 1420,
    },
  });

  const spiceRoute = await prisma.restaurant.upsert({
    where: { slug: 'spice-route-kitchen' },
    update: {
      name: 'Spice Route Kitchen',
      description: 'Slow-cooked royal biryanis, charcoal kebabs, and rich North Indian curries.',
      address: '77 80 Feet Road, 4th Block, Koramangala, Bengaluru',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560034',
      latitude: 12.9352,
      longitude: 77.6245,
      cuisineTypes: ['North Indian', 'Biryani', 'Mughlai'],
      isApproved: true,
      isActive: true,
      isOpen: true,
      minOrderAmountPaise: 14900,
      baseDeliveryFeePaise: 4000,
      freeDeliveryThresholdPaise: 59900,
      rating: 4.7,
      ratingCount: 980,
    },
    create: {
      id: 'res-feedo-spice-02',
      name: 'Spice Route Kitchen',
      slug: 'spice-route-kitchen',
      description: 'Slow-cooked royal biryanis, charcoal kebabs, and rich North Indian curries.',
      address: '77 80 Feet Road, 4th Block, Koramangala, Bengaluru',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560034',
      latitude: 12.9352,
      longitude: 77.6245,
      cuisineTypes: ['North Indian', 'Biryani', 'Mughlai'],
      openingTime: '11:30',
      closingTime: '23:30',
      isApproved: true,
      isActive: true,
      isOpen: true,
      minOrderAmountPaise: 14900,
      baseDeliveryFeePaise: 4000,
      freeDeliveryThresholdPaise: 59900,
      packagingFeePaise: 2000,
      commissionRatePercent: 15.0,
      estimatedPrepTimeMinutes: 25,
      rating: 4.7,
      ratingCount: 980,
    },
  });

  // 5. Associate Restaurant Staff to Bengaluru Tiffin House
  console.log('🤝 Linking Restaurant Staff to Bengaluru Tiffin House...');
  await prisma.restaurantMember.upsert({
    where: {
      restaurantId_userId: {
        restaurantId: tiffinHouse.id,
        userId: staff.id,
      },
    },
    update: {
      role: 'staff',
      isActive: true,
    },
    create: {
      id: 'mem-staff-tiffin-01',
      restaurantId: tiffinHouse.id,
      userId: staff.id,
      role: 'staff',
      isActive: true,
    },
  });

  // 6. Seed Categories for Tiffin House & Spice Route
  console.log('📂 Seeding Menu Categories...');
  const catBreakfast = await prisma.menuCategory.upsert({
    where: { id: 'cat-tiffin-breakfast' },
    update: { name: 'Signature Breakfast', displayOrder: 1 },
    create: {
      id: 'cat-tiffin-breakfast',
      restaurantId: tiffinHouse.id,
      name: 'Signature Breakfast',
      displayOrder: 1,
    },
  });

  const catBeverages = await prisma.menuCategory.upsert({
    where: { id: 'cat-tiffin-beverages' },
    update: { name: 'Artisan Beverages', displayOrder: 2 },
    create: {
      id: 'cat-tiffin-beverages',
      restaurantId: tiffinHouse.id,
      name: 'Artisan Beverages',
      displayOrder: 2,
    },
  });

  const catBiryanis = await prisma.menuCategory.upsert({
    where: { id: 'cat-spice-biryani' },
    update: { name: 'Dum Biryanis', displayOrder: 1 },
    create: {
      id: 'cat-spice-biryani',
      restaurantId: spiceRoute.id,
      name: 'Dum Biryanis',
      displayOrder: 1,
    },
  });

  const catCurries = await prisma.menuCategory.upsert({
    where: { id: 'cat-spice-curries' },
    update: { name: 'Royal Curries & Breads', displayOrder: 2 },
    create: {
      id: 'cat-spice-curries',
      restaurantId: spiceRoute.id,
      name: 'Royal Curries & Breads',
      displayOrder: 2,
    },
  });

  // 7. Seed 8 Menu Items across categories (Prices in integer Paise)
  console.log('🍛 Seeding 8 Menu Items with Integer Paise Pricing...');
  const menuItems = [
    // Tiffin House Items
    {
      id: 'item-dosa-01',
      restaurantId: tiffinHouse.id,
      categoryId: catBreakfast.id,
      name: 'Ghee Roast Masala Dosa',
      description: 'Crisp golden crepe smeared with pure desi ghee, filled with spiced potato mash, served with trio chutneys and piping hot sambar.',
      pricePaise: 12000, // ₹120.00
      dietaryType: DietaryType.VEG,
      isAvailable: true,
      isRecommended: true,
      displayOrder: 1,
    },
    {
      id: 'item-idli-02',
      restaurantId: tiffinHouse.id,
      categoryId: catBreakfast.id,
      name: 'Steamed Button Ghee Idli (14 pcs)',
      description: 'Bite-sized melt-in-mouth steamed rice cakes immersed in podi ghee masala and aromatic drumstick sambar.',
      pricePaise: 9500, // ₹95.00
      dietaryType: DietaryType.VEG,
      isAvailable: true,
      isRecommended: true,
      displayOrder: 2,
    },
    {
      id: 'item-vada-03',
      restaurantId: tiffinHouse.id,
      categoryId: catBreakfast.id,
      name: 'Medu Vada Crunch (2 pcs)',
      description: 'Traditional crisp fried lentil doughnuts seasoned with peppercorns, ginger, and curry leaves.',
      pricePaise: 7000, // ₹70.00
      dietaryType: DietaryType.VEG,
      isAvailable: true,
      isRecommended: false,
      displayOrder: 3,
    },
    {
      id: 'item-coffee-04',
      restaurantId: tiffinHouse.id,
      categoryId: catBeverages.id,
      name: 'South Indian Filter Kaapi',
      description: 'Authentic chicory-infused decoction frothed with boiled full-cream milk in a traditional brass dabarah.',
      pricePaise: 4500, // ₹45.00
      dietaryType: DietaryType.VEG,
      isAvailable: true,
      isRecommended: true,
      displayOrder: 4,
    },
    // Spice Route Items
    {
      id: 'item-biryani-05',
      restaurantId: spiceRoute.id,
      categoryId: catBiryanis.id,
      name: 'Hyderabadi Chicken Dum Biryani',
      description: 'Long-grain aged basmati rice layered with marinated tender chicken cuts, saffron milk, and fragrant spices, slow dum cooked.',
      pricePaise: 32000, // ₹320.00
      dietaryType: DietaryType.NON_VEG,
      isAvailable: true,
      isRecommended: true,
      displayOrder: 1,
    },
    {
      id: 'item-paneer-06',
      restaurantId: spiceRoute.id,
      categoryId: catCurries.id,
      name: 'Paneer Tikka Butter Masala',
      description: 'Char-grilled cottage cheese cubes simmered in a luscious velvet tomato cashew gravy with kasuri methi.',
      pricePaise: 26000, // ₹260.00
      dietaryType: DietaryType.VEG,
      isAvailable: true,
      isRecommended: true,
      displayOrder: 2,
    },
    {
      id: 'item-naan-07',
      restaurantId: spiceRoute.id,
      categoryId: catCurries.id,
      name: 'Butter Garlic Naan (2 pcs)',
      description: 'Leavened clay-oven baked bread brushed with generous garlic butter and fresh coriander.',
      pricePaise: 11000, // ₹110.00
      dietaryType: DietaryType.VEG,
      isAvailable: true,
      isRecommended: false,
      displayOrder: 3,
    },
    {
      id: 'item-sweet-08',
      restaurantId: spiceRoute.id,
      categoryId: catCurries.id,
      name: 'Shahi Gulab Jamun (2 pcs)',
      description: 'Warm golden milk dumplings soaked in cardamom and rose water sugar syrup, garnished with toasted pistachios.',
      pricePaise: 8000, // ₹80.00
      dietaryType: DietaryType.VEG,
      isAvailable: true,
      isRecommended: false,
      displayOrder: 4,
    },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        description: item.description,
        pricePaise: item.pricePaise,
        dietaryType: item.dietaryType,
        isAvailable: item.isAvailable,
        isRecommended: item.isRecommended,
      },
      create: item,
    });
  }

  // 8. Seed Active Coupon: FEEDO50
  console.log('🏷️ Seeding Active Coupon: FEEDO50...');
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  await prisma.coupon.upsert({
    where: { code: 'FEEDO50' },
    update: {
      description: 'Get 50% OFF up to ₹150 on your order above ₹199',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 50,
      maxDiscountPaise: 15000, // ₹150.00
      minOrderAmountPaise: 19900, // ₹199.00
      validUntil: nextYear,
      isActive: true,
    },
    create: {
      id: 'cpn-feedo-50',
      code: 'FEEDO50',
      description: 'Get 50% OFF up to ₹150 on your order above ₹199',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 50,
      maxDiscountPaise: 15000, // ₹150.00
      minOrderAmountPaise: 19900, // ₹199.00
      validUntil: nextYear,
      usageLimitPerUser: 5,
      totalUsageLimit: 100000,
      isActive: true,
    },
  });

  console.log('✅ PostgreSQL Seeding complete! All records upserted safely.');
}

if (require.main === module) {
  seedPostgres()
    .catch((err) => {
      console.error('❌ Error during PostgreSQL seeding:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
