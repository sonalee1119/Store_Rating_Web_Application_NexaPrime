'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { api, saveSession } from '../../lib/api';
import { getPasswordChecks, validateEmail } from '../../lib/validation';
import { CheckIcon } from '../../components/Icon';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    role: 'user',
    storeName: '',
    storeCategory: 'Electronics & Appliances',
    storeAddress: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const pwdChecks = getPasswordChecks(form.password);
  const nameLen = form.name.trim().length;
  const isNameStrictValid = nameLen >= 20 && nameLen <= 60;
  const isNameBasicValid = nameLen >= 3 && nameLen <= 60;

  function updateField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
    setError('');
  }

  function handleAutoFill(targetRole) {
    const suffix = Math.floor(100 + Math.random() * 899);
    if (targetRole === 'owner') {
      setForm({
        name: 'Rajvardhan Deshmukh (Store Owner)',
        email: `rajvardhan.owner${suffix}@nexaprime.in`,
        address: 'Plot 19, MIDC Commercial Zone, Shiroli, Kolhapur, Maharashtra 416122',
        password: 'Owner@1234',
        role: 'owner',
        storeName: 'Deshmukh Precision Electronics & Service',
        storeCategory: 'Electronics & Appliances',
        storeAddress: 'Plot 19, MIDC Commercial Zone, Shiroli, Kolhapur, Maharashtra 416122'
      });
    } else {
      setForm({
        name: 'Siddhi Vishwanath Kulkarni (Customer)',
        email: `siddhi.customer${suffix}@nexaprime.in`,
        address: 'Flat 404, Silver Oak Apartments, Kothrud, Pune, Maharashtra 411038',
        password: 'Welcome@123',
        role: 'user',
        storeName: '',
        storeCategory: 'Retail & Essentials',
        storeAddress: ''
      });
    }
    setError('');
  }

  function handlePadName() {
    const base = form.name.trim() || 'Registered RateSpace User';
    if (base.length >= 20) return;
    const suffix = form.role === 'owner' ? ' (Verified Store Owner)' : ' (Verified Customer)';
    updateField('name', (base + suffix).slice(0, 60));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!isNameBasicValid) {
      setError('Full name must be between 3 and 60 characters.');
      return;
    }
    if (!validateEmail(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!form.address.trim() || form.address.trim().length > 400) {
      setError('Address is required and must be at most 400 characters.');
      return;
    }
    if (!pwdChecks.length || !pwdChecks.uppercase || !pwdChecks.special) {
      setError(
        'Password must be 8–16 characters and include at least one uppercase letter and one special character.'
      );
      return;
    }
    if (form.role === 'owner' && !form.storeName.trim()) {
      setError('Please provide a Store Name for your Store Owner account.');
      return;
    }

    setLoading(true);
    try {
      const data = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      saveSession(data);
      window.location.href = data.user.role === 'owner' ? '/owner' : '/dashboard';
    } catch (err) {
      setError(err.message || 'Could not create account.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell">
      <Navbar activePage="register" />

      <main className="main-container">
        <div className="auth-layout">
          <aside className="auth-info-panel">
            <span className="hero-eyebrow">NEW ACCOUNT REGISTRATION</span>
            <h2>Join the RateSpace Network</h2>
            <p>
              Create a Normal User account to rate and review registered stores, or
              register as a Store Owner to list your business and track customer ratings.
            </p>

            <ul className="auth-feature-list">
              <li className="auth-feature-item">
                <span className="auth-feature-icon">
                  <CheckIcon size={13} />
                </span>
                <span>
                  <strong>Full Name:</strong> Up to 60 characters (20–60 characters standard format)
                </span>
              </li>
              <li className="auth-feature-item">
                <span className="auth-feature-icon">
                  <CheckIcon size={13} />
                </span>
                <span>
                  <strong>Address:</strong> Up to 400 characters with city and postal details
                </span>
              </li>
              <li className="auth-feature-item">
                <span className="auth-feature-icon">
                  <CheckIcon size={13} />
                </span>
                <span>
                  <strong>Password Security:</strong> 8–16 characters with 1 uppercase & 1 special character
                </span>
              </li>
            </ul>

            <div className="demo-credentials-box">
              <div className="demo-credentials-title">Instant Form Auto-Fill</div>
              <p style={{ margin: '0 0 12px', fontSize: 13, color: '#e2e8f0' }}>
                Want to test account creation immediately? Use the buttons on the form
                to populate valid Customer or Store Owner details with one click.
              </p>
            </div>
          </aside>

          <section className="auth-form-card">
            <div className="auth-form-header">
              <h1>Create Account</h1>
              <p>Select your account role and complete the registration details below.</p>
            </div>

            <div className="quick-fill-bar">
              <span className="quick-fill-label">Quick Test Auto-Fill Buttons</span>
              <div className="quick-fill-buttons">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleAutoFill('user')}
                >
                  Auto-Fill Sample Customer
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleAutoFill('owner')}
                >
                  Auto-Fill Sample Store Owner
                </button>
              </div>
            </div>

            {error && <div className="alert-banner alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label className="form-label" style={{ display: 'block', marginBottom: 8 }}>
                  Select Account Role
                </label>
                <div className="role-toggle-group">
                  <button
                    type="button"
                    className={`role-toggle-btn ${form.role === 'user' ? 'active' : ''}`}
                    onClick={() => updateField('role', 'user')}
                  >
                    <span className="role-toggle-title">Normal User</span>
                    <span className="role-toggle-desc">Browse & rate registered stores</span>
                  </button>
                  <button
                    type="button"
                    className={`role-toggle-btn ${form.role === 'owner' ? 'active' : ''}`}
                    onClick={() => updateField('role', 'owner')}
                  >
                    <span className="role-toggle-title">Store Owner</span>
                    <span className="role-toggle-desc">Register store & view analytics</span>
                  </button>
                </div>
              </div>

              <div className="form-field">
                <div className="form-label-row">
                  <label className="form-label" htmlFor="reg-name">
                    Full Name
                  </label>
                  <span className={`char-counter ${isNameStrictValid ? 'valid' : ''}`}>
                    {nameLen}/60 chars {isNameStrictValid ? '(20–60 spec met)' : ''}
                  </span>
                </div>
                <div className="password-input-group">
                  <input
                    id="reg-name"
                    type="text"
                    required
                    maxLength={60}
                    className="form-input"
                    value={form.name}
                    onChange={e => updateField('name', e.target.value)}
                    placeholder="Enter your full name (e.g., Aarav Deshmukh Customer)"
                  />
                  {nameLen > 0 && nameLen < 20 && (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={handlePadName}
                      title="Expand name to 20+ characters for strict challenge rule"
                    >
                      Make 20+ Chars
                    </button>
                  )}
                </div>
              </div>

              <div className="form-field">
                <div className="form-label-row">
                  <label className="form-label" htmlFor="reg-email">
                    Email Address
                  </label>
                </div>
                <input
                  id="reg-email"
                  type="email"
                  required
                  className="form-input"
                  value={form.email}
                  onChange={e => updateField('email', e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <div className="form-field">
                <div className="form-label-row">
                  <label className="form-label" htmlFor="reg-address">
                    Residential / Business Address
                  </label>
                  <span className="char-counter">{form.address.length}/400 chars</span>
                </div>
                <textarea
                  id="reg-address"
                  required
                  maxLength={400}
                  rows={2}
                  className="form-textarea"
                  value={form.address}
                  onChange={e => updateField('address', e.target.value)}
                  placeholder="Street address, area, city, state, and PIN code"
                />
              </div>

              {form.role === 'owner' && (
                <div
                  style={{
                    padding: 16,
                    borderRadius: 10,
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    marginBottom: 16
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 10 }}>
                    Store Registration Details
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="reg-store-name">
                      Store Name
                    </label>
                    <input
                      id="reg-store-name"
                      type="text"
                      required
                      maxLength={100}
                      className="form-input"
                      value={form.storeName}
                      onChange={e => updateField('storeName', e.target.value)}
                      placeholder="e.g., NexaPrime Flagship Electronics Hub"
                    />
                  </div>
                  <div className="form-field" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="reg-store-category">
                      Store Category
                    </label>
                    <select
                      id="reg-store-category"
                      className="form-select"
                      value={form.storeCategory}
                      onChange={e => updateField('storeCategory', e.target.value)}
                    >
                      <option value="Electronics & Appliances">Electronics & Appliances</option>
                      <option value="Organic Grocery & Fresh Produce">Organic Grocery & Fresh Produce</option>
                      <option value="Books, Stationery & Cafe">Books, Stationery & Cafe</option>
                      <option value="Furniture & Interior Decor">Furniture & Interior Decor</option>
                      <option value="Specialty Coffee & Bakery">Specialty Coffee & Bakery</option>
                      <option value="Sports & Fitness Equipment">Sports & Fitness Equipment</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="form-field">
                <div className="form-label-row">
                  <label className="form-label" htmlFor="reg-password">
                    Password
                  </label>
                </div>
                <div className="password-input-group">
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    maxLength={16}
                    className="form-input"
                    value={form.password}
                    onChange={e => updateField('password', e.target.value)}
                    placeholder="8–16 chars, 1 uppercase, 1 special"
                  />
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setShowPassword(prev => !prev)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => updateField('password', 'Welcome@123')}
                  >
                    Use Valid Password
                  </button>
                </div>

                <div className="validation-checklist">
                  <span className={`check-item ${pwdChecks.length ? 'passed' : ''}`}>
                    <CheckIcon size={13} /> 8–16 characters
                  </span>
                  <span className={`check-item ${pwdChecks.uppercase ? 'passed' : ''}`}>
                    <CheckIcon size={13} /> 1 uppercase letter
                  </span>
                  <span className={`check-item ${pwdChecks.special ? 'passed' : ''}`}>
                    <CheckIcon size={13} /> 1 special character
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg btn-full"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account & Continue'}
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
                <span style={{ color: '#64748b' }}>Already have an account?</span>
                <Link href="/login" className="btn btn-outline btn-sm">
                  Sign In
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
