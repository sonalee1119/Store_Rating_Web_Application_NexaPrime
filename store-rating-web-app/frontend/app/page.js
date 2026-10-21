'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api, saveSession, getUser } from '../lib/api';
import {
  StoreIcon,
  StarIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ArrowRightIcon
} from '../components/Icon';

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [demoLoading, setDemoLoading] = useState('');

  useEffect(() => {
    setUser(getUser());
  }, []);

  async function handleQuickDemo(role) {
    setDemoLoading(role);
    try {
      const credentials =
        role === 'owner'
          ? { email: 'vikram.kulkarni@nexaprime.in', password: 'Owner@1234' }
          : { email: 'aarav.sharma@nexaprime.in', password: 'Welcome@123' };
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      saveSession(data);
      window.location.href = data.user.role === 'owner' ? '/owner' : '/dashboard';
    } catch {
      window.location.href = '/login';
    } finally {
      setDemoLoading('');
    }
  }

  return (
    <div className="page-shell">
      <Navbar activePage="home" />

      <main className="main-container">
        <section className="hero-banner">
          <div className="hero-content">
            <span className="hero-eyebrow">VERIFIED STORE RATING DIRECTORY</span>
            <h1 className="hero-title">
              Evaluate Local Businesses with Transparent Community Ratings
            </h1>
            <p className="hero-subtitle">
              Browse registered stores, compare verified 1-to-5 star customer scores,
              submit or update your own ratings, and manage merchant performance analytics
              through role-based dashboards.
            </p>

            <div className="hero-actions">
              {user ? (
                <>
                  <Link
                    href={user.role === 'owner' ? '/owner' : '/dashboard'}
                    className="btn btn-hero-white btn-lg"
                  >
                    <span>Open Your Dashboard</span>
                    <ArrowRightIcon size={16} />
                  </Link>
                  <Link href="/dashboard" className="btn btn-hero-outline btn-lg">
                    Browse Store Directory
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/register" className="btn btn-hero-white btn-lg">
                    <span>Create Account</span>
                    <ArrowRightIcon size={16} />
                  </Link>
                  <Link href="/login" className="btn btn-hero-outline btn-lg">
                    Sign In to Account
                  </Link>
                  <button
                    type="button"
                    className="btn btn-hero-outline btn-lg"
                    disabled={Boolean(demoLoading)}
                    onClick={() => handleQuickDemo('user')}
                  >
                    {demoLoading === 'user' ? 'Signing In...' : 'Instant Customer Demo'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-hero-outline btn-lg"
                    disabled={Boolean(demoLoading)}
                    onClick={() => handleQuickDemo('owner')}
                  >
                    {demoLoading === 'owner' ? 'Signing In...' : 'Instant Owner Demo'}
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Registered Stores</div>
            <div className="stat-value">6 Verified</div>
            <div className="stat-subtext">Across Kolhapur, Pune, Mumbai, and Nashik</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Rating Scale</div>
            <div className="stat-value">1 to 5 Stars</div>
            <div className="stat-subtext">Whole-number scoring with instant updates</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Access Control</div>
            <div className="stat-value">2 Distinct Roles</div>
            <div className="stat-subtext">Normal User directory & Store Owner console</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Security Standard</div>
            <div className="stat-value">JWT + Bcrypt</div>
            <div className="stat-subtext">Hashed credentials & protected API routes</div>
          </div>
        </section>

        <section className="stores-grid">
          <div className="data-card">
            <div className="brand-logo-box" style={{ marginBottom: 14 }}>
              <StoreIcon size={18} />
            </div>
            <h3 className="store-title">01. Discover Registered Stores</h3>
            <p className="store-address">
              Search stores by name, category, or city address. View aggregated
              community ratings and total review counts in real time.
            </p>
            <div style={{ marginTop: 18 }}>
              <Link href="/dashboard" className="btn btn-secondary btn-sm">
                Explore Directory
              </Link>
            </div>
          </div>

          <div className="data-card">
            <div className="brand-logo-box" style={{ marginBottom: 14 }}>
              <StarIcon filled size={18} />
            </div>
            <h3 className="store-title">02. Submit & Update Ratings</h3>
            <p className="store-address">
              Normal users can submit a whole-number rating from 1 to 5 for any
              registered store and modify their submitted score at any time.
            </p>
            <div style={{ marginTop: 18 }}>
              <Link href="/register" className="btn btn-secondary btn-sm">
                Register as Customer
              </Link>
            </div>
          </div>

          <div className="data-card">
            <div className="brand-logo-box" style={{ marginBottom: 14 }}>
              <ChartBarIcon size={18} />
            </div>
            <h3 className="store-title">03. Store Owner Analytics</h3>
            <p className="store-address">
              Store owners access a dedicated dashboard displaying their store
              average rating, score distribution, and customer review logs.
            </p>
            <div style={{ marginTop: 18 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleQuickDemo('owner')}
              >
                Open Owner Demo
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
