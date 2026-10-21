import { env } from './env.js';
import { setMongoMode, resetAndSeedDatabase } from '../services/dataStore.js';

export async function connectDB() {
  try {
    const mongooseModule = await import('mongoose');
    const mongoose = mongooseModule.default || mongooseModule;
    const User = (await import('../models/User.js')).default;
    const Store = (await import('../models/Store.js')).default;
    const Rating = (await import('../models/Rating.js')).default;

    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2500
    });

    setMongoMode(true, { User, Store, Rating });
    console.log('MongoDB connected successfully.');

    const storeCount = await Store.countDocuments();
    if (storeCount === 0) {
      await resetAndSeedDatabase();
      console.log('Initial demo users, stores, and ratings seeded into MongoDB.');
    }
    return { mode: 'mongodb' };
  } catch (err) {
    setMongoMode(false, null);
    console.log(
      'MongoDB service not detected on local port — using persistent local JSON datastore (backend/data/local_db.json).'
    );
    return { mode: 'local_json', reason: err?.message };
  }
}
