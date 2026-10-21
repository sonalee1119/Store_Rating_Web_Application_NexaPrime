import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { buildInitialSeedData } from '../../data/seedData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localDbPath = path.resolve(__dirname, '../../data/local_db.json');

let mongoModels = null;
let useMongo = false;

export function setMongoMode(enabled, models = null) {
  useMongo = Boolean(enabled);
  mongoModels = models;
}

export function isMongoConnected() {
  return useMongo && mongoModels !== null;
}

function generateObjectId() {
  return crypto.randomBytes(12).toString('hex');
}

async function ensureLocalDb() {
  if (!fs.existsSync(localDbPath)) {
    const initial = await buildInitialSeedData();
    fs.mkdirSync(path.dirname(localDbPath), { recursive: true });
    fs.writeFileSync(localDbPath, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  try {
    return JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
  } catch {
    const initial = await buildInitialSeedData();
    fs.writeFileSync(localDbPath, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
}

function saveLocalDb(db) {
  fs.writeFileSync(localDbPath, JSON.stringify(db, null, 2), 'utf8');
}

export async function resetAndSeedDatabase() {
  const seed = await buildInitialSeedData();
  if (isMongoConnected()) {
    const { User, Store, Rating } = mongoModels;
    await Promise.all([User.deleteMany({}), Store.deleteMany({}), Rating.deleteMany({})]);
    await User.insertMany(seed.users);
    await Store.insertMany(seed.stores);
    await Rating.insertMany(seed.ratings);
  }
  saveLocalDb(seed);
  return seed;
}

export async function findUserByEmail(email) {
  const cleanEmail = String(email || '').toLowerCase().trim();
  if (isMongoConnected()) {
    return mongoModels.User.findOne({ email: cleanEmail }).lean();
  }
  const db = await ensureLocalDb();
  return db.users.find(u => u.email.toLowerCase() === cleanEmail) || null;
}

export async function findUserById(id) {
  const strId = String(id || '');
  if (isMongoConnected()) {
    try {
      return await mongoModels.User.findById(strId).select('-passwordHash').lean();
    } catch {
      return null;
    }
  }
  const db = await ensureLocalDb();
  const user = db.users.find(u => String(u._id) === strId);
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export async function createUser({ name, email, address, passwordHash, role = 'user' }) {
  const now = new Date().toISOString();
  if (isMongoConnected()) {
    const created = await mongoModels.User.create({
      name,
      email: email.toLowerCase().trim(),
      address,
      passwordHash,
      role
    });
    return created.toObject();
  }
  const db = await ensureLocalDb();
  const newUser = {
    _id: generateObjectId(),
    name,
    email: email.toLowerCase().trim(),
    address,
    passwordHash,
    role,
    createdAt: now,
    updatedAt: now
  };
  db.users.push(newUser);
  saveLocalDb(db);
  return newUser;
}

export async function createStore({ name, category = 'Retail & Essentials', address, ownerId }) {
  const now = new Date().toISOString();
  if (isMongoConnected()) {
    const created = await mongoModels.Store.create({
      name: name.trim(),
      category: category.trim() || 'Retail & Essentials',
      address: address.trim(),
      ownerId
    });
    return created.toObject();
  }
  const db = await ensureLocalDb();
  const newStore = {
    _id: generateObjectId(),
    name: name.trim(),
    category: category.trim() || 'Retail & Essentials',
    address: address.trim(),
    ownerId: String(ownerId),
    createdAt: now,
    updatedAt: now
  };
  db.stores.push(newStore);
  saveLocalDb(db);
  return newStore;
}

export async function listStoresWithRatings({ search = '', category = '', sort = 'name', userId = null }) {
  const cleanSearch = String(search || '').trim().toLowerCase();
  const cleanCategory = String(category || '').trim().toLowerCase();

  let stores = [];
  let allRatings = [];
  let users = [];

  if (isMongoConnected()) {
    const query = {};
    if (cleanSearch) {
      const escaped = cleanSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { address: { $regex: escaped, $options: 'i' } },
        { category: { $regex: escaped, $options: 'i' } }
      ];
    }
    stores = await mongoModels.Store.find(query).lean();
    const storeIds = stores.map(s => s._id);
    allRatings = await mongoModels.Rating.find({ storeId: { $in: storeIds } }).lean();
    users = await mongoModels.User.find({}).select('name email').lean();
  } else {
    const db = await ensureLocalDb();
    stores = db.stores.filter(s => {
      if (!cleanSearch) return true;
      return (
        s.name.toLowerCase().includes(cleanSearch) ||
        s.address.toLowerCase().includes(cleanSearch) ||
        (s.category || '').toLowerCase().includes(cleanSearch)
      );
    });
    allRatings = db.ratings;
    users = db.users;
  }

  if (cleanCategory && cleanCategory !== 'all') {
    stores = stores.filter(s => (s.category || '').toLowerCase() === cleanCategory);
  }

  const userMap = new Map(users.map(u => [String(u._id), u]));

  const enriched = stores.map(store => {
    const sid = String(store._id);
    const storeRatings = allRatings.filter(r => String(r.storeId) === sid);
    const count = storeRatings.length;
    const sum = storeRatings.reduce((acc, r) => acc + Number(r.rating), 0);
    const avg = count > 0 ? Number((sum / count).toFixed(1)) : 0;
    const myEntry = userId
      ? storeRatings.find(r => String(r.userId) === String(userId))
      : null;

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const r of storeRatings) {
      if (distribution[r.rating] !== undefined) distribution[r.rating] += 1;
    }

    const owner = userMap.get(String(store.ownerId));

    return {
      id: sid,
      name: store.name,
      category: store.category || 'Retail & Essentials',
      address: store.address,
      ownerName: owner ? owner.name : 'Verified Store Partner',
      averageRating: avg,
      ratingCount: count,
      myRating: myEntry ? myEntry.rating : null,
      myComment: myEntry ? myEntry.comment || '' : '',
      myRatingUpdatedAt: myEntry ? myEntry.updatedAt : null,
      distribution,
      createdAt: store.createdAt
    };
  });

  if (sort === 'rating_desc') {
    enriched.sort((a, b) => b.averageRating - a.averageRating || b.ratingCount - a.ratingCount);
  } else if (sort === 'reviews_desc') {
    enriched.sort((a, b) => b.ratingCount - a.ratingCount || b.averageRating - a.averageRating);
  } else {
    enriched.sort((a, b) => a.name.localeCompare(b.name));
  }

  return enriched;
}

export async function getStoreDetailsById(storeId, userId = null) {
  const all = await listStoresWithRatings({ userId });
  return all.find(s => String(s.id) === String(storeId)) || null;
}

export async function upsertStoreRating({ storeId, userId, rating, comment = '' }) {
  const numRating = Number(rating);
  const cleanComment = String(comment || '').trim().slice(0, 300);
  const now = new Date().toISOString();

  if (isMongoConnected()) {
    let store = null;
    try {
      store = await mongoModels.Store.findById(storeId).lean();
    } catch {
      store = null;
    }
    if (!store) return { notFound: true };

    const existing = await mongoModels.Rating.findOne({ storeId: store._id, userId }).lean();
    const saved = await mongoModels.Rating.findOneAndUpdate(
      { storeId: store._id, userId },
      { $set: { rating: numRating, comment: cleanComment } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
    const updatedStore = await getStoreDetailsById(store._id, userId);
    return {
      isUpdate: Boolean(existing),
      rating: saved.rating,
      comment: saved.comment || '',
      store: updatedStore
    };
  }

  const db = await ensureLocalDb();
  const store = db.stores.find(s => String(s._id) === String(storeId));
  if (!store) return { notFound: true };

  const existingIdx = db.ratings.findIndex(
    r => String(r.storeId) === String(storeId) && String(r.userId) === String(userId)
  );

  let isUpdate = false;
  if (existingIdx >= 0) {
    isUpdate = true;
    db.ratings[existingIdx].rating = numRating;
    if (cleanComment || reqCommentProvided(comment)) {
      db.ratings[existingIdx].comment = cleanComment;
    }
    db.ratings[existingIdx].updatedAt = now;
  } else {
    db.ratings.push({
      _id: generateObjectId(),
      storeId: String(storeId),
      userId: String(userId),
      rating: numRating,
      comment: cleanComment,
      createdAt: now,
      updatedAt: now
    });
  }

  saveLocalDb(db);
  const updatedStore = await getStoreDetailsById(storeId, userId);
  return {
    isUpdate,
    rating: numRating,
    comment: cleanComment,
    store: updatedStore
  };
}

function reqCommentProvided(comment) {
  return comment !== undefined && comment !== null;
}

export async function getOwnerDashboardData(ownerId) {
  let stores = [];
  let allRatings = [];
  let users = [];

  if (isMongoConnected()) {
    stores = await mongoModels.Store.find({ ownerId }).lean();
    const storeIds = stores.map(s => s._id);
    allRatings = await mongoModels.Rating.find({ storeId: { $in: storeIds } })
      .sort({ updatedAt: -1 })
      .lean();
    users = await mongoModels.User.find({
      _id: { $in: allRatings.map(r => r.userId) }
    })
      .select('name email address')
      .lean();
  } else {
    const db = await ensureLocalDb();
    stores = db.stores.filter(s => String(s.ownerId) === String(ownerId));
    const storeIds = new Set(stores.map(s => String(s._id)));
    allRatings = db.ratings
      .filter(r => storeIds.has(String(r.storeId)))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    users = db.users;
  }

  const userMap = new Map(users.map(u => [String(u._id), u]));

  const formattedStores = stores.map(store => {
    const sid = String(store._id);
    const storeRatings = allRatings.filter(r => String(r.storeId) === sid);
    const count = storeRatings.length;
    const sum = storeRatings.reduce((acc, r) => acc + Number(r.rating), 0);
    const average = count > 0 ? Number((sum / count).toFixed(1)) : 0;

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const r of storeRatings) {
      if (distribution[r.rating] !== undefined) distribution[r.rating] += 1;
    }

    return {
      id: sid,
      name: store.name,
      category: store.category || 'Retail & Essentials',
      address: store.address,
      averageRating: average,
      ratingCount: count,
      distribution,
      ratings: storeRatings.map(r => {
        const u = userMap.get(String(r.userId));
        return {
          id: String(r._id),
          rating: r.rating,
          comment: r.comment || '',
          updatedAt: r.updatedAt,
          user: u
            ? { name: u.name, email: u.email, address: u.address || '' }
            : { name: 'Registered Customer', email: 'customer@nexaprime.in', address: '' }
        };
      })
    };
  });

  const totalRatings = formattedStores.reduce((acc, s) => acc + s.ratingCount, 0);
  const weightedSum = formattedStores.reduce(
    (acc, s) => acc + s.averageRating * s.ratingCount,
    0
  );
  const overallAverage =
    totalRatings > 0 ? Number((weightedSum / totalRatings).toFixed(1)) : 0;

  return {
    summary: {
      totalStores: formattedStores.length,
      totalRatings,
      overallAverage
    },
    stores: formattedStores
  };
}
