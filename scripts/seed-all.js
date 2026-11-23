/**
 * Master Database Seeder for Feedo Platform
 * Runs PostgreSQL Seeding followed by MongoDB Dynamic Catalog Seeding.
 */
const { seedPostgres } = require('../prisma/seed.js');
const { seedMongoCatalog } = require('../apps/api/src/modules/mongodb/seed-catalog.js');

async function runAllSeeds() {
  console.log('========================================================');
  console.log('🚀 Running Feedo Master Seeder (PostgreSQL + MongoDB)');
  console.log('========================================================');

  try {
    console.log('\n--- Step 1: PostgreSQL Relational Seeding ---');
    await seedPostgres();
  } catch (err) {
    console.warn('⚠️ PostgreSQL seed failed or database connection unavailable:', err.message);
  }

  try {
    console.log('\n--- Step 2: MongoDB Dynamic Catalog Seeding ---');
    await seedMongoCatalog();
  } catch (err) {
    console.warn('⚠️ MongoDB seed failed or database connection unavailable:', err.message);
  }

  console.log('\n========================================================');
  console.log('✨ Feedo Database Seeding Sequence Finished!');
  console.log('========================================================');
}

if (require.main === module) {
  runAllSeeds().then(() => process.exit(0)).catch((err) => {
    console.error('Fatal seeder error:', err);
    process.exit(1);
  });
}

module.exports = { runAllSeeds };
