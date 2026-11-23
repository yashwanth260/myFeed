const { MongoClient } = require('mongodb');

async function seedMongoCatalog() {
  console.log('🌱 Starting Feedo MongoDB Dynamic Catalog Seeder...');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/feedo_catalog';
  const dbName = process.env.MONGODB_DB_NAME || 'feedo_catalog';

  const client = new MongoClient(mongoUri, {
    connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000,
  });

  try {
    await client.connect();
    console.log(` Connected to MongoDB: ${dbName}`);
    const db = client.db(dbName);
    const collection = db.collection('restaurant_catalogs');

    const tiffinCatalog = {
      restaurantId: 'res-feedo-tiffin-01',
      restaurantName: 'Bengaluru Tiffin House',
      schemaVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      promotions: [
        {
          bannerText: 'Flat 50% off on all breakfast combos with code FEEDO50',
          validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          applicableItemIds: ['item-dosa-01', 'item-idli-02'],
        },
      ],
      categories: [
        {
          id: 'cat-tiffin-breakfast',
          name: 'Signature Breakfast',
          description: 'Authentic stone-ground batter delicacies prepared fresh.',
          displayOrder: 1,
          items: [
            {
              id: 'item-dosa-01',
              name: 'Ghee Roast Masala Dosa',
              description: 'Crisp golden crepe smeared with pure desi ghee, filled with spiced potato mash.',
              basePricePaise: 12000,
              dietaryTags: ['VEG', 'GLUTEN_FREE'],
              allergens: ['DAIRY'],
              nutritionalInfo: { calories: 340, proteinGrams: 8, carbsGrams: 42, fatGrams: 14 },
              imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&q=80',
              isAvailable: true,
              isBestseller: true,
              updatedAt: new Date(),
              customizationMatrix: [
                {
                  groupId: 'grp-dosa-ghee',
                  groupName: 'Ghee & Roast Style',
                  minSelect: 0,
                  maxSelect: 1,
                  isRequired: false,
                  options: [
                    { optionId: 'opt-extra-ghee', name: 'Extra Desi Ghee Smear', priceModifierPaise: 2500, isDefault: false, isAvailable: true },
                    { optionId: 'opt-butter-roast', name: 'Butter Roast Finish', priceModifierPaise: 3000, isDefault: false, isAvailable: true },
                  ],
                },
                {
                  groupId: 'grp-dosa-spice',
                  groupName: 'Gunpowder Podi Dust',
                  minSelect: 0,
                  maxSelect: 1,
                  isRequired: false,
                  options: [
                    { optionId: 'opt-spicy-podi', name: 'Spicy Chutney Podi', priceModifierPaise: 1500, isDefault: false, isAvailable: true },
                  ],
                },
              ],
            },
            {
              id: 'item-idli-02',
              name: 'Steamed Button Ghee Idli (14 pcs)',
              description: 'Bite-sized melt-in-mouth steamed rice cakes immersed in podi ghee masala.',
              basePricePaise: 9500,
              dietaryTags: ['VEG', 'GLUTEN_FREE'],
              allergens: ['DAIRY'],
              nutritionalInfo: { calories: 240, proteinGrams: 6, carbsGrams: 38, fatGrams: 8 },
              imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&q=80',
              isAvailable: true,
              isBestseller: true,
              updatedAt: new Date(),
              customizationMatrix: [
                {
                  groupId: 'grp-idli-dip',
                  groupName: 'Dipping Preference',
                  minSelect: 1,
                  maxSelect: 1,
                  isRequired: true,
                  options: [
                    { optionId: 'opt-dipped-sambar', name: 'Dipped in Piping Hot Sambar', priceModifierPaise: 0, isDefault: true, isAvailable: true },
                    { optionId: 'opt-sambar-separate', name: 'Sambar & Chutneys on the Side', priceModifierPaise: 0, isDefault: false, isAvailable: true },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const spiceCatalog = {
      restaurantId: 'res-feedo-spice-02',
      restaurantName: 'Spice Route Kitchen',
      schemaVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      promotions: [
        {
          bannerText: 'Complimentary dessert on orders above ₹600',
          validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          applicableItemIds: ['item-biryani-05', 'item-paneer-06'],
        },
      ],
      categories: [
        {
          id: 'cat-spice-biryani',
          name: 'Dum Biryanis',
          description: 'Aged basmati slow-dum cooked with authentic charcoal seal.',
          displayOrder: 1,
          items: [
            {
              id: 'item-biryani-05',
              name: 'Hyderabadi Chicken Dum Biryani',
              description: 'Fragrant saffron basmati layered with tender chicken cuts.',
              basePricePaise: 32000,
              dietaryTags: ['NON_VEG', 'HALAL'],
              allergens: ['DAIRY'],
              nutritionalInfo: { calories: 680, proteinGrams: 36, carbsGrams: 72, fatGrams: 28 },
              imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80',
              isAvailable: true,
              isBestseller: true,
              updatedAt: new Date(),
              customizationMatrix: [
                {
                  groupId: 'grp-portion-size',
                  groupName: 'Portion Size',
                  minSelect: 1,
                  maxSelect: 1,
                  isRequired: true,
                  options: [
                    { optionId: 'opt-biryani-regular', name: 'Regular (Serves 1-2, 2 Bone-in Pcs)', priceModifierPaise: 0, isDefault: true, isAvailable: true },
                    { optionId: 'opt-biryani-large', name: 'Large Jumbo (Serves 3-4, 4 Bone-in Pcs)', priceModifierPaise: 24000, isDefault: false, isAvailable: true },
                  ],
                },
                {
                  groupId: 'grp-spice-level',
                  groupName: 'Spice Level',
                  minSelect: 1,
                  maxSelect: 1,
                  isRequired: true,
                  options: [
                    { optionId: 'opt-spice-mild', name: 'Mild Royal Aroma', priceModifierPaise: 0, isDefault: false, isAvailable: true },
                    { optionId: 'opt-spice-medium', name: 'Traditional Medium Spiced', priceModifierPaise: 0, isDefault: true, isAvailable: true },
                    { optionId: 'opt-spice-andhra', name: 'Fiery Andhra Style Heat', priceModifierPaise: 1000, isDefault: false, isAvailable: true },
                  ],
                },
                {
                  groupId: 'grp-extra-salan',
                  groupName: 'Accompaniments & Add-ons',
                  minSelect: 0,
                  maxSelect: 2,
                  isRequired: false,
                  options: [
                    { optionId: 'opt-extra-mirchi-ka-salan', name: 'Extra Mirchi Ka Salan (150ml)', priceModifierPaise: 4000, isDefault: false, isAvailable: true },
                    { optionId: 'opt-extra-burani-raita', name: 'Garlic Burani Raita (150ml)', priceModifierPaise: 3500, isDefault: false, isAvailable: true },
                    { optionId: 'opt-extra-boiled-egg', name: 'Spiced Boiled Egg (2 pcs)', priceModifierPaise: 3000, isDefault: false, isAvailable: true },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    console.log(' Upserting Bengaluru Tiffin House dynamic catalog...');
    await collection.updateOne(
      { restaurantId: tiffinCatalog.restaurantId },
      { $set: tiffinCatalog },
      { upsert: true },
    );

    console.log(' Upserting Spice Route Kitchen dynamic catalog...');
    await collection.updateOne(
      { restaurantId: spiceCatalog.restaurantId },
      { $set: spiceCatalog },
      { upsert: true },
    );

    console.log('✅ MongoDB Dynamic Catalog Seeding complete! Documents upserted.');
  } catch (err) {
    console.warn(`⚠️ Notice: MongoDB Seeder skipped or offline (${err.message}). Catalog falls back gracefully to PostgreSQL.`);
  } finally {
    await client.close();
  }
}

module.exports = { seedMongoCatalog };

if (require.main === module) {
  seedMongoCatalog()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ MongoDB Seeding failed:', err);
      process.exit(1);
    });
}
