'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import StarRating from '../../components/StarRating';
import { api, getUser, saveSession } from '../../lib/api';
import { MapPinIcon, StarIcon, CheckIcon } from '../../components/Icon';

export default function OwnerDashboardPage() {
  const [data, setData] = useState({
    summary: { totalStores: 0, totalRatings: 0, overallAverage: 0 },
    stores: []
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [starFilter, setStarFilter] = useState('all');
  const [showAddStore, setShowAddStore] = useState(false);
  const [newStore, setNewStore] = useState({
    name: '',
    category: 'Electronics & Appliances',
    address: ''
  });
  const [creatingStore, setCreatingStore] = useState(false);
  const [statusBanner, setStatusBanner] = useState('');

  async function loadOwnerData() {
    setLoading(true);
    setError('');
    try {
      let current = getUser();
      if (!current || current.role !== 'owner') {
        // Automatically sign in with the demo Store Owner account if opened directly
        const ownerLogin = await api('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: 'vikram.kulkarni@nexaprime.in',
            password: 'Owner@1234'
          })
        });
        saveSession(ownerLogin);
        current = ownerLogin.user;
      }
      setUser(current);
      const dashboard = await api('/owner/dashboard');
      setData(dashboard);
    } catch (err) {
      setError(err.message || 'Could not load store owner dashboard.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOwnerData();
  }, []);

  async function handleCreateStore(e) {
    e.preventDefault();
    setCreatingStore(true);
    setError('');
    try {
      await api('/owner/stores', {
        method: 'POST',
        body: JSON.stringify(newStore)
      });
      setNewStore({ name: '', category: 'Electronics & Appliances', address: '' });
      setShowAddStore(false);
      setStatusBanner('New store registered and added to your owner console.');
      await loadOwnerData();
      setTimeout(() => setStatusBanner(''), 4000);
    } catch (err) {
      setError(err.message || 'Could not register store.');
    } finally {
      setCreatingStore(false);
    }
  }

  function handleExportCsv(store) {
    const headers = ['Customer Name', 'Email', 'Rating', 'Comment', 'Submitted Date'];
    const rows = store.ratings.map(r => [
      `"${(r.user?.name || '').replace(/"/g, '""')}"`,
      `"${(r.user?.email || '').replace(/"/g, '""')}"`,
      r.rating,
      `"${(r.comment || '').replace(/"/g, '""')}"`,
      new Date(r.updatedAt).toISOString().split('T')[0]
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${store.name.toLowerCase().replace(/\s+/g, '_')}_ratings.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="page-shell">
      <Navbar activePage="owner" />

      <main className="main-container">
        <section className="hero-banner">
          <div className="hero-content">
            <span className="hero-eyebrow">MERCHANT ANALYTICS CONSOLE</span>
            <h1 className="hero-title">Store Owner Performance Dashboard</h1>
            <p className="hero-subtitle">
              Monitor your registered store ratings, inspect 1-to-5 star customer
              distributions, and review individual customer submissions.
            </p>
            <div className="hero-actions">
              <button
                type="button"
                className="btn btn-hero-white"
                onClick={() => setShowAddStore(prev => !prev)}
              >
                {showAddStore ? 'Cancel Store Form' : 'Register New Store'}
              </button>
              <button
                type="button"
                className="btn btn-hero-outline"
                onClick={loadOwnerData}
              >
                Refresh Analytics
              </button>
              <Link href="/dashboard" className="btn btn-hero-outline">
                View Public Store Directory
              </Link>
            </div>
          </div>
          {user && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: '#fde68a', fontWeight: 700 }}>
                MERCHANT ACCOUNT
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{user.name}</div>
              <div style={{ fontSize: 13, color: '#cbd5e1' }}>{user.email}</div>
            </div>
          )}
        </section>

        {statusBanner && (
          <div className="alert-banner alert-success">
            <CheckIcon size={15} /> {statusBanner}
          </div>
        )}
        {error && <div className="alert-banner alert-error">{error}</div>}

        {showAddStore && (
          <section className="data-card" style={{ borderColor: '#93c5fd' }}>
            <h3 style={{ marginTop: 0, marginBottom: 14 }}>Register Additional Store</h3>
            <form onSubmit={handleCreateStore}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 14
                }}
              >
                <div className="form-field">
                  <label className="form-label">Store Name</label>
                  <input
                    type="text"
                    required
                    minLength={3}
                    maxLength={100}
                    className="form-input"
                    value={newStore.name}
                    onChange={e => setNewStore({ ...newStore, name: e.target.value })}
                    placeholder="e.g., Kolhapur Tech Experience Zone"
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Store Category</label>
                  <select
                    className="form-select"
                    value={newStore.category}
                    onChange={e => setNewStore({ ...newStore, category: e.target.value })}
                  >
                    <option value="Electronics & Appliances">Electronics & Appliances</option>
                    <option value="Organic Grocery & Fresh Produce">Organic Grocery & Fresh Produce</option>
                    <option value="Books, Stationery & Cafe">Books, Stationery & Cafe</option>
                    <option value="Furniture & Interior Decor">Furniture & Interior Decor</option>
                    <option value="Specialty Coffee & Bakery">Specialty Coffee & Bakery</option>
                    <option value="Sports & Fitness Equipment">Sports & Fitness Equipment</option>
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Store Address</label>
                  <input
                    type="text"
                    required
                    maxLength={400}
                    className="form-input"
                    value={newStore.address}
                    onChange={e => setNewStore({ ...newStore, address: e.target.value })}
                    placeholder="Full street address and city"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creatingStore}
                >
                  {creatingStore ? 'Registering Store...' : 'Save & Publish Store'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowAddStore(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Managed Stores</div>
            <div className="stat-value">{data.summary?.totalStores || data.stores.length}</div>
            <div className="stat-subtext">Linked to your owner account</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Portfolio Average Rating</div>
            <div className="stat-value">
              {(data.summary?.overallAverage || 0).toFixed(1)} / 5.0
            </div>
            <div className="stat-subtext">Weighted across all submissions</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Customer Reviews</div>
            <div className="stat-value">{data.summary?.totalRatings || 0}</div>
            <div className="stat-subtext">Verified 1-to-5 star ratings</div>
          </div>
        </section>

        <div className="toolbar-card">
          <div className="toolbar-row">
            <span style={{ fontSize: 13.5, fontWeight: 700, color: '#334155' }}>
              Filter Customer Ratings Table:
            </span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'All Ratings' },
                { id: '5', label: '5 Stars Only' },
                { id: '4', label: '4 Stars Only' },
                { id: 'low', label: '3 Stars & Below' }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  className={`filter-pill-btn ${starFilter === f.id ? 'active' : ''}`}
                  onClick={() => setStarFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="data-card" style={{ textAlign: 'center', padding: 48 }}>
            Loading store owner dashboard...
          </div>
        ) : data.stores.length === 0 ? (
          <div className="data-card" style={{ textAlign: 'center', padding: 48 }}>
            <h3 style={{ marginTop: 0 }}>No stores linked to this account yet</h3>
            <p style={{ color: '#64748b', marginBottom: 18 }}>
              Click the button below to register your first store and start receiving customer ratings.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowAddStore(true)}
            >
              Register Your First Store
            </button>
          </div>
        ) : (
          data.stores.map(store => {
            const visibleRatings = store.ratings.filter(r => {
              if (starFilter === '5') return r.rating === 5;
              if (starFilter === '4') return r.rating === 4;
              if (starFilter === 'low') return r.rating <= 3;
              return true;
            });

            return (
              <section className="data-card" key={store.id}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 20,
                    flexWrap: 'wrap',
                    paddingBottom: 18,
                    borderBottom: '1px solid #e2e8f0'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span className="category-pill">{store.category || 'Managed Store'}</span>
                      <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                        Store ID: {String(store.id).slice(-6)}
                      </span>
                    </div>
                    <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800 }}>
                      {store.name}
                    </h2>
                    <p className="store-address">
                      <MapPinIcon size={15} className="pin-icon" />
                      <span>{store.address}</span>
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      background: '#f8fafc',
                      padding: '12px 18px',
                      borderRadius: 12,
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>
                        AVERAGE SCORE
                      </div>
                      <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>
                        {store.averageRating.toFixed(1)}{' '}
                        <span style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>
                          / 5.0
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#475569' }}>
                        {store.ratingCount} submitted {store.ratingCount === 1 ? 'rating' : 'ratings'}
                      </div>
                    </div>
                    <StarRating value={store.averageRating} readOnly size={20} />
                  </div>
                </div>

                {store.distribution && (
                  <div style={{ marginTop: 18, marginBottom: 22 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 8
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
                        Rating Distribution
                      </span>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleExportCsv(store)}
                      >
                        Export Ratings CSV
                      </button>
                    </div>
                    <div className="distribution-bars">
                      {[5, 4, 3, 2, 1].map(star => {
                        const count = store.distribution[star] || 0;
                        const pct =
                          store.ratingCount > 0
                            ? Math.round((count / store.ratingCount) * 100)
                            : 0;
                        return (
                          <div className="dist-row" key={star}>
                            <span className="dist-label">{star} Stars</span>
                            <div className="dist-track">
                              <div className="dist-fill" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="dist-count">
                              {count} ({pct}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
                  Users Who Rated This Store ({visibleRatings.length})
                </h3>

                {visibleRatings.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: 14 }}>
                    No ratings match the selected filter criteria.
                  </p>
                ) : (
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Customer Name</th>
                          <th>Email Address</th>
                          <th>Submitted Rating</th>
                          <th>Feedback Note</th>
                          <th>Last Updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleRatings.map((item, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 600 }}>{item.user.name}</td>
                            <td style={{ color: '#475569' }}>{item.user.email}</td>
                            <td>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                <StarRating value={item.rating} readOnly size={15} />
                                <span
                                  style={{
                                    fontWeight: 700,
                                    color: '#92400e',
                                    background: '#fffbeb',
                                    padding: '2px 8px',
                                    borderRadius: 999,
                                    fontSize: 12
                                  }}
                                >
                                  {item.rating} / 5
                                </span>
                              </div>
                            </td>
                            <td style={{ color: '#475569' }}>
                              {item.comment || 'Verified store rating submission'}
                            </td>
                            <td style={{ color: '#64748b', fontSize: 13 }}>
                              {new Date(item.updatedAt).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            );
          })
        )}
      </main>

      <Footer />
    </div>
  );
}
