export function getApiBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return '/api';
  }
  return 'http://localhost:5000/api';
}

const FALLBACK_STORAGE_KEY = 'nexaprime_fallback_datastore_v1';

const INITIAL_FALLBACK_DATA = {
  users: [
    {
      id: '6710a0000000000000000001',
      name: 'Vikramaditya Kulkarni (Store Owner)',
      email: 'vikram.kulkarni@nexaprime.in',
      address: 'Plot 42, Rajarampuri 8th Lane, Kolhapur, Maharashtra 416008',
      password: 'Owner@1234',
      role: 'owner'
    },
    {
      id: '6710a0000000000000000002',
      name: 'Siddharth Deshpande (Demo Owner)',
      email: 'owner.demo@example.com',
      address: '104 Business Bay, Koregaon Park, Pune, Maharashtra 411001',
      password: 'Owner@1234',
      role: 'owner'
    },
    {
      id: '6710a0000000000000000003',
      name: 'Aarav Deshmukh (Customer Account)',
      email: 'aarav.sharma@nexaprime.in',
      address: 'Flat 302, Emerald Residency, Baner Road, Pune, Maharashtra 411045',
      password: 'Welcome@123',
      role: 'user'
    },
    {
      id: '6710a0000000000000000004',
      name: 'Priya Nandakumar Nair (Customer)',
      email: 'priya.nair@nexaprime.in',
      address: '18 Palm Grove Society, Powai, Mumbai, Maharashtra 400076',
      password: 'Welcome@123',
      role: 'user'
    },
    {
      id: '6710a0000000000000000005',
      name: 'Rohan Rajendra Joshi (Customer)',
      email: 'rohan.joshi@nexaprime.in',
      address: '215 Shahu Mill Colony, Tarabai Park, Kolhapur, Maharashtra 416003',
      password: 'Welcome@123',
      role: 'user'
    }
  ],
  stores: [
    {
      id: '6710b0000000000000000101',
      name: 'NexaPrime Flagship Electronics Hub',
      category: 'Electronics & Appliances',
      address: 'Station Road, Near Venus Corner, Kolhapur, Maharashtra 416001',
      ownerId: '6710a0000000000000000001'
    },
    {
      id: '6710b0000000000000000102',
      name: 'Sahyadri Organic Harvest Market',
      category: 'Organic Grocery & Fresh Produce',
      address: 'Rajarampuri 6th Lane, Main Market Road, Kolhapur, Maharashtra 416008',
      ownerId: '6710a0000000000000000001'
    },
    {
      id: '6710b0000000000000000103',
      name: 'Meridian Bookhouse & Study Lounge',
      category: 'Books, Stationery & Cafe',
      address: 'FC Road, Deccan Gymkhana, Pune, Maharashtra 411004',
      ownerId: '6710a0000000000000000002'
    },
    {
      id: '6710b0000000000000000104',
      name: 'Crestline Home & Living Studio',
      category: 'Furniture & Interior Decor',
      address: 'High Street Phoenix Compound, Lower Parel, Mumbai, Maharashtra 400013',
      ownerId: '6710a0000000000000000002'
    },
    {
      id: '6710b0000000000000000105',
      name: 'Deccan Roast Specialty Coffee Roasters',
      category: 'Specialty Coffee & Bakery',
      address: 'Balewadi High Street, Baner, Pune, Maharashtra 411045',
      ownerId: '6710a0000000000000000001'
    },
    {
      id: '6710b0000000000000000106',
      name: 'Apex Urban Athletics & Gear Outfitters',
      category: 'Sports & Fitness Equipment',
      address: 'College Road, Near Big Bazaar, Nashik, Maharashtra 422005',
      ownerId: '6710a0000000000000000002'
    }
  ],
  ratings: [
    { storeId: '6710b0000000000000000101', userId: '6710a0000000000000000003', rating: 5, comment: 'Knowledgeable staff and prompt warranty assistance.', updatedAt: '2026-10-18T10:20:00.000Z' },
    { storeId: '6710b0000000000000000101', userId: '6710a0000000000000000004', rating: 5, comment: 'Clean showroom layout and transparent pricing.', updatedAt: '2026-10-19T13:10:00.000Z' },
    { storeId: '6710b0000000000000000101', userId: '6710a0000000000000000005', rating: 4, comment: 'Great product selection, slightly busy on weekends.', updatedAt: '2026-10-20T09:15:00.000Z' },
    { storeId: '6710b0000000000000000102', userId: '6710a0000000000000000003', rating: 4, comment: 'Fresh farm vegetables every morning.', updatedAt: '2026-10-17T08:30:00.000Z' },
    { storeId: '6710b0000000000000000102', userId: '6710a0000000000000000005', rating: 5, comment: 'Authentic cold-pressed oils and organic grains.', updatedAt: '2026-10-19T11:00:00.000Z' },
    { storeId: '6710b0000000000000000103', userId: '6710a0000000000000000003', rating: 5, comment: 'Quiet reading corners and curated technical books.', updatedAt: '2026-10-18T15:20:00.000Z' },
    { storeId: '6710b0000000000000000103', userId: '6710a0000000000000000004', rating: 4, comment: 'Excellent collection of design and architecture titles.', updatedAt: '2026-10-19T16:10:00.000Z' },
    { storeId: '6710b0000000000000000104', userId: '6710a0000000000000000004', rating: 5, comment: 'High-grade solid wood desks and ergonomic chairs.', updatedAt: '2026-10-20T12:00:00.000Z' },
    { storeId: '6710b0000000000000000105', userId: '6710a0000000000000000004', rating: 5, comment: 'Single-origin pour-over coffee is outstanding.', updatedAt: '2026-10-20T09:40:00.000Z' },
    { storeId: '6710b0000000000000000105', userId: '6710a0000000000000000005', rating: 4, comment: 'Great ambiance and reliable Wi-Fi for remote work.', updatedAt: '2026-10-20T14:00:00.000Z' },
    { storeId: '6710b0000000000000000106', userId: '6710a0000000000000000005', rating: 4, comment: 'Good running shoe fitting analysis and gear range.', updatedAt: '2026-10-20T17:15:00.000Z' }
  ]
};

function getFallbackDb() {
  if (typeof window === 'undefined') return INITIAL_FALLBACK_DATA;
  try {
    const raw = localStorage.getItem(FALLBACK_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(INITIAL_FALLBACK_DATA));
      return JSON.parse(JSON.stringify(INITIAL_FALLBACK_DATA));
    }
    return JSON.parse(raw);
  } catch {
    return JSON.parse(JSON.stringify(INITIAL_FALLBACK_DATA));
  }
}

function saveFallbackDb(db) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(db));
  } catch {
    // ignore storage errors
  }
}

function handleLocalFallbackRequest(path, options = {}) {
  const db = getFallbackDb();
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};
  const currentUser = getUser();

  if (path === '/auth/login' && method === 'POST') {
    const email = String(body.email || '').toLowerCase().trim();
    const user = db.users.find(u => u.email.toLowerCase() === email);
    if (!user || user.password !== body.password) {
      throw new Error('Invalid email or password.');
    }
    const { password, ...safeUser } = user;
    return { token: `local-jwt-${user.id}`, user: safeUser };
  }

  if (path === '/auth/register' && method === 'POST') {
    const email = String(body.email || '').toLowerCase().trim();
    if (db.users.some(u => u.email.toLowerCase() === email)) {
      throw new Error('An account with this email address is already registered.');
    }
    const newUser = {
      id: `user_${Date.now()}`,
      name: String(body.name || '').trim(),
      email,
      address: String(body.address || '').trim(),
      password: body.password,
      role: body.role === 'owner' ? 'owner' : 'user'
    };
    db.users.push(newUser);
    if (newUser.role === 'owner') {
      db.stores.push({
        id: `store_${Date.now()}`,
        name: String(body.storeName || `${newUser.name.split(' ')[0]}'s Registered Store`).trim(),
        category: String(body.storeCategory || 'Retail & Essentials').trim(),
        address: String(body.storeAddress || newUser.address).trim(),
        ownerId: newUser.id
      });
    }
    saveFallbackDb(db);
    const { password, ...safeUser } = newUser;
    return { token: `local-jwt-${newUser.id}`, user: safeUser };
  }

  if (path.startsWith('/stores') && method === 'GET') {
    const urlObj = new URL(path, 'http://localhost');
    const search = (urlObj.searchParams.get('search') || '').toLowerCase().trim();
    const category = (urlObj.searchParams.get('category') || '').toLowerCase().trim();
    const sort = urlObj.searchParams.get('sort') || 'name';

    let list = db.stores.filter(s => {
      if (search && !s.name.toLowerCase().includes(search) && !s.address.toLowerCase().includes(search)) {
        return false;
      }
      if (category && category !== 'all' && (s.category || '').toLowerCase() !== category) {
        return false;
      }
      return true;
    });

    const enriched = list.map(s => {
      const sRatings = db.ratings.filter(r => r.storeId === s.id);
      const count = sRatings.length;
      const avg = count ? Number((sRatings.reduce((a, b) => a + b.rating, 0) / count).toFixed(1)) : 0;
      const mine = currentUser ? sRatings.find(r => r.userId === currentUser.id) : null;
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      sRatings.forEach(r => {
        if (distribution[r.rating] !== undefined) distribution[r.rating] += 1;
      });
      const owner = db.users.find(u => u.id === s.ownerId);
      return {
        ...s,
        ownerName: owner ? owner.name : 'Verified Store Partner',
        averageRating: avg,
        ratingCount: count,
        myRating: mine ? mine.rating : null,
        myComment: mine ? mine.comment || '' : '',
        distribution
      };
    });

    if (sort === 'rating_desc') enriched.sort((a, b) => b.averageRating - a.averageRating);
    else if (sort === 'reviews_desc') enriched.sort((a, b) => b.ratingCount - a.ratingCount);
    else enriched.sort((a, b) => a.name.localeCompare(b.name));

    return enriched;
  }

  const ratingMatch = path.match(/^\/stores\/([^/]+)\/ratings$/);
  if (ratingMatch && (method === 'POST' || method === 'PUT')) {
    if (!currentUser) throw new Error('Authentication required. Please log in.');
    const storeId = ratingMatch[1];
    const numRating = Number(body.rating);
    const comment = String(body.comment || '').trim();
    const existingIdx = db.ratings.findIndex(
      r => r.storeId === storeId && r.userId === currentUser.id
    );
    const isUpdate = existingIdx >= 0;
    if (isUpdate) {
      db.ratings[existingIdx].rating = numRating;
      db.ratings[existingIdx].comment = comment;
      db.ratings[existingIdx].updatedAt = new Date().toISOString();
    } else {
      db.ratings.push({
        storeId,
        userId: currentUser.id,
        rating: numRating,
        comment,
        updatedAt: new Date().toISOString()
      });
    }
    saveFallbackDb(db);
    return {
      message: isUpdate ? 'Your store rating has been updated.' : 'Your store rating has been submitted.',
      rating: numRating,
      isUpdate
    };
  }

  if (path === '/owner/dashboard' && method === 'GET') {
    if (!currentUser || currentUser.role !== 'owner') {
      throw new Error('Access denied. Store Owner account required.');
    }
    const myStores = db.stores.filter(s => s.ownerId === currentUser.id);
    const stores = myStores.map(s => {
      const sRatings = db.ratings.filter(r => r.storeId === s.id);
      const count = sRatings.length;
      const avg = count ? Number((sRatings.reduce((a, b) => a + b.rating, 0) / count).toFixed(1)) : 0;
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      sRatings.forEach(r => {
        if (distribution[r.rating] !== undefined) distribution[r.rating] += 1;
      });
      return {
        ...s,
        averageRating: avg,
        ratingCount: count,
        distribution,
        ratings: sRatings.map(r => {
          const u = db.users.find(usr => usr.id === r.userId);
          return {
            rating: r.rating,
            comment: r.comment || '',
            updatedAt: r.updatedAt,
            user: u ? { name: u.name, email: u.email, address: u.address } : { name: 'Customer', email: '' }
          };
        })
      };
    });
    const totalRatings = stores.reduce((a, s) => a + s.ratingCount, 0);
    const weighted = stores.reduce((a, s) => a + s.averageRating * s.ratingCount, 0);
    return {
      summary: {
        totalStores: stores.length,
        totalRatings,
        overallAverage: totalRatings ? Number((weighted / totalRatings).toFixed(1)) : 0
      },
      stores
    };
  }

  if (path === '/owner/stores' && method === 'POST') {
    if (!currentUser || currentUser.role !== 'owner') {
      throw new Error('Access denied. Store Owner account required.');
    }
    const created = {
      id: `store_${Date.now()}`,
      name: String(body.name || '').trim(),
      category: String(body.category || 'Retail & Essentials').trim(),
      address: String(body.address || '').trim(),
      ownerId: currentUser.id
    };
    db.stores.push(created);
    saveFallbackDb(db);
    return { message: 'Store registered successfully.', store: created };
  }

  throw new Error('Requested API endpoint is unavailable.');
}

export async function api(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const baseUrl = getApiBaseUrl();
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers,
      cache: 'no-store'
    });
    if (response.status === 404 && baseUrl === '/api') {
      return handleLocalFallbackRequest(path, options);
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || 'Request could not be completed.');
    }
    return data;
  } catch (error) {
    if (
      error instanceof TypeError ||
      String(error?.message || '').toLowerCase().includes('fetch')
    ) {
      return handleLocalFallbackRequest(path, options);
    }
    throw error;
  }
}

export function saveSession(data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  } catch {
    // ignore storage errors
  }
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

export function logout() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } catch {
    // ignore
  }
  window.location.href = '/login';
}
