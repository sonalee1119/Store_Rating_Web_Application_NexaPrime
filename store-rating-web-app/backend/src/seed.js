import { connectDB } from './config/db.js';
import { resetAndSeedDatabase, isMongoConnected } from './services/dataStore.js';

async function runSeed() {
  await connectDB();
  const seeded = await resetAndSeedDatabase();
  console.log('Database seeded successfully:');
  console.log(`- Users created: ${seeded.users.length}`);
  console.log(`- Stores created: ${seeded.stores.length}`);
  console.log(`- Ratings created: ${seeded.ratings.length}`);
  console.log('\nDemo Credentials:');
  console.log('  Normal User : aarav.sharma@nexaprime.in / Welcome@123');
  console.log('  Store Owner : vikram.kulkarni@nexaprime.in / Owner@1234');
  console.log('  Demo Owner 2: owner.demo@example.com / Owner@1234');

  if (isMongoConnected()) {
    const mongooseModule = await import('mongoose');
    const mongoose = mongooseModule.default || mongooseModule;
    await mongoose.disconnect();
  }
}

runSeed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
