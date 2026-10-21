import assert from 'node:assert/strict';
import { connectDB } from '../src/config/db.js';
import { resetAndSeedDatabase } from '../src/services/dataStore.js';
import app from '../src/app.js';

const TEST_PORT = 5599;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}/api`;

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function runTests() {
  console.log('--- Running Store Rating Backend API Test Suite ---');
  await connectDB();
  await resetAndSeedDatabase();

  const server = app.listen(TEST_PORT);
  try {
    // 1. Health Check
    const health = await request('/health');
    assert.equal(health.status, 200);
    assert.equal(health.body.status, 'ok');
    console.log('[PASS] 1. GET /api/health returns 200 OK');

    // 2. Login with Seeded Normal User
    const userLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'aarav.sharma@nexaprime.in',
        password: 'Welcome@123'
      })
    });
    assert.equal(userLogin.status, 200);
    assert.ok(userLogin.body.token);
    assert.equal(userLogin.body.user.role, 'user');
    const userToken = userLogin.body.token;
    console.log('[PASS] 2. POST /api/auth/login succeeds for seeded Normal User');

    // 3. Login with Seeded Store Owner
    const ownerLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'vikram.kulkarni@nexaprime.in',
        password: 'Owner@1234'
      })
    });
    assert.equal(ownerLogin.status, 200);
    assert.ok(ownerLogin.body.token);
    assert.equal(ownerLogin.body.user.role, 'owner');
    const ownerToken = ownerLogin.body.token;
    console.log('[PASS] 3. POST /api/auth/login succeeds for seeded Store Owner');

    // 4. Register a New Normal User
    const newUserReg = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Ananya Vishwanath Deshmukh',
        email: 'ananya.deshmukh@nexaprime.in',
        address: '88 FC Road, Shivaji Nagar, Pune, Maharashtra 411005',
        password: 'Customer@99',
        role: 'user'
      })
    });
    assert.equal(newUserReg.status, 201);
    assert.ok(newUserReg.body.token);
    assert.equal(newUserReg.body.user.role, 'user');
    console.log('[PASS] 4. POST /api/auth/register creates new Normal User account');

    // 5. Register a New Store Owner with Store creation
    const newOwnerReg = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Harshvardhan Shinde (Merchant)',
        email: 'harsh.shinde@nexaprime.in',
        address: '12 MG Road, Camp Area, Pune, Maharashtra 411001',
        password: 'Merchant@99',
        role: 'owner',
        storeName: 'Shinde Heritage Artisanal Spices',
        storeCategory: 'Organic Grocery & Fresh Produce',
        storeAddress: '12 MG Road, Camp Area, Pune, Maharashtra 411001'
      })
    });
    assert.equal(newOwnerReg.status, 201);
    assert.equal(newOwnerReg.body.user.role, 'owner');
    assert.ok(newOwnerReg.body.store);
    assert.equal(newOwnerReg.body.store.name, 'Shinde Heritage Artisanal Spices');
    console.log('[PASS] 5. POST /api/auth/register creates new Store Owner + linked Store');

    // 6. List and Search Stores
    const allStores = await request('/stores', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert.equal(allStores.status, 200);
    assert.ok(Array.isArray(allStores.body));
    assert.ok(allStores.body.length >= 6);

    const searchStores = await request('/stores?search=NexaPrime', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert.equal(searchStores.status, 200);
    assert.equal(searchStores.body.length, 1);
    assert.equal(searchStores.body[0].name, 'NexaPrime Flagship Electronics Hub');
    console.log('[PASS] 6. GET /api/stores & search filter return accurate store listings');

    // 7. Submit and Update Rating
    const targetStoreId = allStores.body[0].id;
    const submitRes = await request(`/stores/${targetStoreId}/ratings`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${newUserReg.body.token}` },
      body: JSON.stringify({ rating: 4, comment: 'Very smooth checkout experience.' })
    });
    assert.equal(submitRes.status, 200);
    assert.equal(submitRes.body.rating, 4);
    assert.equal(submitRes.body.isUpdate, false);

    const updateRes = await request(`/stores/${targetStoreId}/ratings`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${newUserReg.body.token}` },
      body: JSON.stringify({ rating: 5, comment: 'Updated to 5 stars after follow-up support.' })
    });
    assert.equal(updateRes.status, 200);
    assert.equal(updateRes.body.rating, 5);
    assert.equal(updateRes.body.isUpdate, true);
    console.log('[PASS] 7. POST & PUT /api/stores/:id/ratings submit and update rating properly');

    // 8. Role-based Authorization Check on Owner Dashboard
    const forbiddenRes = await request('/owner/dashboard', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert.equal(forbiddenRes.status, 403);

    const ownerDash = await request('/owner/dashboard', {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    assert.equal(ownerDash.status, 200);
    assert.ok(ownerDash.body.stores.length >= 3);
    assert.ok(ownerDash.body.summary.totalRatings > 0);
    console.log('[PASS] 8. GET /api/owner/dashboard enforces RBAC and returns owner metrics');

    // Reset back to clean seeded state after tests
    await resetAndSeedDatabase();
    console.log('--- ALL 8 BACKEND API INTEGRATION TESTS PASSED ---');
  } finally {
    server.close();
  }
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
