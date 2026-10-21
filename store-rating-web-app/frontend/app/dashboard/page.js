'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import StoreCard from '../../components/StoreCard';
import StarRating from '../../components/StarRating';
import { api, getUser, saveSession } from '../../lib/api';
import { SearchIcon, MapPinIcon } from '../../components/Icon';

export default function DashboardPage() {
  const [stores, setStores] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [selectedStore, setSelectedStore] = useState(null);
  const [user, setUser] = useState(null);

  async function ensureSessionAndLoad(query = activeSearch, sort = sortBy) {
    setLoading(true);
    setError('');
    try {
      let current = getUser();
      if (!current) {
        // Automatically sign into the default demo customer session if visiting directly
        const loginData = await api('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: 'aarav.sharma@nexaprime.in',
            password: 'Welcome@123'
          })
        });
        saveSession(loginData);
        current = loginData.user;
      }
      setUser(current);
      const list = await api(
        `/stores?search=${encodeURIComponent(query)}&sort=${encodeURIComponent(sort)}`
      );
      setStores(list);
    } catch (err) {
      setError(err.message || 'Could not load stores.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    ensureSessionAndLoad('', 'name');
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    setActiveSearch(searchInput);
    ensureSessionAndLoad(searchInput, sortBy);
  }

  function handleClearSearch() {
    setSearchInput('');
    setActiveSearch('');
    setStatusFilter('all');
    setSortBy('name');
    ensureSessionAndLoad('', 'name');
  }

  function handleSortChange(newSort) {
    setSortBy(newSort);
    ensureSessionAndLoad(activeSearch, newSort);
  }

  async function handleRateStore(storeId, rating, comment) {
    setSavingId(storeId);
    setError('');
    try {
      await api(`/stores/${storeId}/ratings`, {
        method: 'POST',
        body: JSON.stringify({ rating: Number(rating), comment })
      });
      await ensureSessionAndLoad(activeSearch, sortBy);
      return true;
    } catch (err) {
      setError(err.message || 'Could not save rating.');
      return false;
    } finally {
      setSavingId('');
    }
  }

  const filteredStores = stores.filter(store => {
    if (statusFilter === 'rated') return Boolean(store.myRating);
    if (statusFilter === 'unrated') return !store.myRating;
    if (statusFilter === 'top') return store.averageRating >= 4.5;
    return true;
  });

  const ratedByMeCount = stores.filter(s => Boolean(s.myRating)).length;
  const globalAvg =
    stores.length > 0
      ? (stores.reduce((acc, s) => acc + s.averageRating, 0) / stores.length).toFixed(1)
      : '0.0';

  return (
    <div className="page-shell">
      <Navbar activePage="dashboard" />

      <main className="main-container">
        <section className="hero-banner">
          <div className="hero-content">
            <span className="hero-eyebrow">CUSTOMER STORE DIRECTORY</span>
            <h1 className="hero-title">Explore & Rate Registered Stores</h1>
            <p className="hero-subtitle">
              Search verified businesses by name or location, inspect community ratings,
              and submit or update your 1-to-5 star evaluation.
            </p>
          </div>
          {user && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: '#93c5fd', fontWeight: 700 }}>
                ACTIVE SESSION
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{user.name}</div>
              <div style={{ fontSize: 13, color: '#cbd5e1' }}>{user.email}</div>
            </div>
          )}
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Registered Stores</div>
            <div className="stat-value">{stores.length}</div>
            <div className="stat-subtext">Available in directory</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Directory Average</div>
            <div className="stat-value">{globalAvg} / 5.0</div>
            <div className="stat-subtext">Across all verified ratings</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Rated by You</div>
            <div className="stat-value">
              {ratedByMeCount} of {stores.length}
            </div>
            <div className="stat-subtext">Click any store card to update</div>
          </div>
        </section>

        <section className="toolbar-card">
          <form className="toolbar-row" onSubmit={handleSearchSubmit}>
            <div className="search-box-group">
              <div className="search-input-wrapper">
                <SearchIcon size={17} className="search-input-icon" />
                <input
                  type="text"
                  className="search-input"
                  value={searchInput}
                  onChange={e => {
                    setSearchInput(e.target.value);
                    setActiveSearch(e.target.value);
                    ensureSessionAndLoad(e.target.value, sortBy);
                  }}
                  placeholder="Search stores by name, category, or city address..."
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Search Stores
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleClearSearch}
              >
                Reset
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <label
                htmlFor="sort-select"
                style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}
              >
                Sort by:
              </label>
              <select
                id="sort-select"
                className="form-select"
                style={{ width: 'auto', padding: '8px 12px' }}
                value={sortBy}
                onChange={e => handleSortChange(e.target.value)}
              >
                <option value="name">Name (A to Z)</option>
                <option value="rating_desc">Highest Rated First</option>
                <option value="reviews_desc">Most Reviewed First</option>
              </select>
            </div>
          </form>

          <div className="filter-pills-row">
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#64748b', marginRight: 4 }}>
              Filter View:
            </span>
            {[
              { id: 'all', label: `All Stores (${stores.length})` },
              { id: 'rated', label: `Rated by Me (${ratedByMeCount})` },
              { id: 'unrated', label: `Not Rated Yet (${stores.length - ratedByMeCount})` },
              { id: 'top', label: 'Top Rated (4.5+)' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`filter-pill-btn ${statusFilter === tab.id ? 'active' : ''}`}
                onClick={() => setStatusFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {error && <div className="alert-banner alert-error">{error}</div>}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16
          }}
        >
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>
            Registered Stores Directory
          </h2>
          <span style={{ fontSize: 13.5, color: '#64748b', fontWeight: 600 }}>
            Showing {filteredStores.length} {filteredStores.length === 1 ? 'store' : 'stores'}
          </span>
        </div>

        {loading ? (
          <div className="data-card" style={{ textAlign: 'center', padding: 48 }}>
            Loading registered stores...
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="data-card" style={{ textAlign: 'center', padding: 48 }}>
            <h3 style={{ marginTop: 0 }}>No matching stores found</h3>
            <p style={{ color: '#64748b', marginBottom: 18 }}>
              Try clearing your search query or switching the active filter tab.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleClearSearch}
            >
              Show All Registered Stores
            </button>
          </div>
        ) : (
          <section className="stores-grid">
            {filteredStores.map(store => (
              <StoreCard
                key={store.id}
                store={store}
                isSaving={savingId === store.id}
                onSubmitRating={handleRateStore}
                onOpenDetails={s => setSelectedStore(s)}
              />
            ))}
          </section>
        )}

        {selectedStore && (
          <div
            className="modal-backdrop"
            onClick={() => setSelectedStore(null)}
          >
            <div
              className="modal-card"
              onClick={e => e.stopPropagation()}
            >
              <div className="store-meta-row">
                <span className="category-pill">{selectedStore.category}</span>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setSelectedStore(null)}
                >
                  Close
                </button>
              </div>
              <h2 style={{ margin: '8px 0' }}>{selectedStore.name}</h2>
              <p className="store-address" style={{ marginBottom: 16 }}>
                <MapPinIcon size={16} className="pin-icon" />
                <span>{selectedStore.address}</span>
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 14,
                  background: '#f8fafc',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  marginBottom: 16
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>
                    OVERALL RATING
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800 }}>
                    {selectedStore.averageRating.toFixed(1)} / 5.0
                  </div>
                  <div style={{ fontSize: 12.5, color: '#475569' }}>
                    Based on {selectedStore.ratingCount} verified ratings
                  </div>
                </div>
                <StarRating value={selectedStore.averageRating} readOnly size={22} />
              </div>

              {selectedStore.distribution && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                    Score Distribution Breakdown
                  </div>
                  <div className="distribution-bars">
                    {[5, 4, 3, 2, 1].map(star => {
                      const count = selectedStore.distribution[star] || 0;
                      const pct =
                        selectedStore.ratingCount > 0
                          ? Math.round((count / selectedStore.ratingCount) * 100)
                          : 0;
                      return (
                        <div className="dist-row" key={star}>
                          <span className="dist-label">{star} Stars</span>
                          <div className="dist-track">
                            <div
                              className="dist-fill"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="dist-count">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
