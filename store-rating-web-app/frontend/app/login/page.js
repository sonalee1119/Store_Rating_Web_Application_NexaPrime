'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { api, saveSession } from '../../lib/api';
import { CheckIcon, ShieldCheckIcon } from '../../components/Icon';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function performLogin(credentials) {
    setError('');
    setLoading(true);
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      saveSession(data);
      window.location.href = data.user.role === 'owner' ? '/owner' : '/dashboard';
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    performLogin(form);
  }

  function fillDemoCredentials(role, autoSubmit = false) {
    const creds =
      role === 'owner'
        ? { email: 'vikram.kulkarni@nexaprime.in', password: 'Owner@1234' }
        : { email: 'aarav.sharma@nexaprime.in', password: 'Welcome@123' };
    setForm(creds);
    setError('');
    if (autoSubmit) {
      performLogin(creds);
    }
  }

  return (
    <div className="page-shell">
      <Navbar activePage="login" />

      <main className="main-container">
        <div className="auth-layout">
          <aside className="auth-info-panel">
            <span className="hero-eyebrow">ROLE-BASED ACCESS PORTAL</span>
            <h2>Sign In to RateSpace</h2>
            <p>
              Access the store rating directory as a Normal User or monitor customer
              feedback metrics from the Store Owner console.
            </p>

            <ul className="auth-feature-list">
              <li className="auth-feature-item">
                <span className="auth-feature-icon">
                  <CheckIcon size={13} />
                </span>
                <span>Automatic role-based redirect to Customer or Store Owner dashboard</span>
              </li>
              <li className="auth-feature-item">
                <span className="auth-feature-icon">
                  <CheckIcon size={13} />
                </span>
                <span>Submit 1-to-5 star ratings and update your score anytime</span>
              </li>
              <li className="auth-feature-item">
                <span className="auth-feature-icon">
                  <ShieldCheckIcon size={13} />
                </span>
                <span>JWT session authentication with bcrypt password hashing</span>
              </li>
            </ul>

            <div className="demo-credentials-box">
              <div className="demo-credentials-title">Pre-Configured Test Accounts</div>
              <div className="demo-cred-row">
                <span>Normal User:</span>
                <strong>aarav.sharma@nexaprime.in / Welcome@123</strong>
              </div>
              <div className="demo-cred-row">
                <span>Store Owner:</span>
                <strong>vikram.kulkarni@nexaprime.in / Owner@1234</strong>
              </div>
              <div className="demo-cred-row">
                <span>Demo Owner 2:</span>
                <strong>owner.demo@example.com / Owner@1234</strong>
              </div>
            </div>
          </aside>

          <section className="auth-form-card">
            <div className="auth-form-header">
              <h1>Account Sign In</h1>
              <p>Enter your registered email and password or use a quick demo button below.</p>
            </div>

            <div className="quick-fill-bar">
              <span className="quick-fill-label">One-Click Demo Sign In & Auto-Fill</span>
              <div className="quick-fill-buttons">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={loading}
                  onClick={() => fillDemoCredentials('user', true)}
                >
                  Sign In as Normal User
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={loading}
                  onClick={() => fillDemoCredentials('owner', true)}
                >
                  Sign In as Store Owner
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={loading}
                  onClick={() => fillDemoCredentials('user', false)}
                >
                  Fill User Fields
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={loading}
                  onClick={() => fillDemoCredentials('owner', false)}
                >
                  Fill Owner Fields
                </button>
              </div>
            </div>

            {error && <div className="alert-banner alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <div className="form-label-row">
                  <label className="form-label" htmlFor="login-email">
                    Email Address
                  </label>
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  className="form-input"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="name@domain.com"
                />
              </div>

              <div className="form-field">
                <div className="form-label-row">
                  <label className="form-label" htmlFor="login-password">
                    Password
                  </label>
                </div>
                <div className="password-input-group">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="form-input"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setShowPassword(prev => !prev)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg btn-full"
                disabled={loading}
                style={{ marginTop: 8 }}
              >
                {loading ? 'Signing In to Dashboard...' : 'Sign In to Account'}
              </button>

              <div
                style={{
                  marginTop: 18,
                  paddingTop: 16,
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 13.5
                }}
              >
                <span style={{ color: '#64748b' }}>Need a new account?</span>
                <Link href="/register" className="btn btn-outline btn-sm">
                  Create Account
                </Link>
              </div>
            </form>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
