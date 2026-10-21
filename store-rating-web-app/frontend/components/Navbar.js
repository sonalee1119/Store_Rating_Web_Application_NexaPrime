'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUser, logout } from '../lib/api';
import { StoreIcon, UserIcon } from './Icon';

export default function Navbar({ activePage = '' }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-left">
          <Link href="/" className="brand-link">
            <span className="brand-logo-box">
              <StoreIcon size={18} />
            </span>
            <span className="brand-text">RateSpace</span>
            <span className="brand-tag">ENTERPRISE</span>
          </Link>

          <nav className="navbar-links">
            <Link
              href="/"
              className={`nav-item ${activePage === 'home' ? 'active' : ''}`}
            >
              Overview
            </Link>
            <Link
              href="/dashboard"
              className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
            >
              Store Directory
            </Link>
            {user?.role === 'owner' && (
              <Link
                href="/owner"
                className={`nav-item ${activePage === 'owner' ? 'active' : ''}`}
              >
                Owner Console
              </Link>
            )}
          </nav>
        </div>

        <div className="navbar-right">
          {user ? (
            <>
              <div className="user-chip">
                <UserIcon size={15} />
                <span className="user-chip-name">{user.name}</span>
                <span className={`role-badge ${user.role === 'owner' ? 'owner' : 'user'}`}>
                  {user.role === 'owner' ? 'Store Owner' : 'Normal User'}
                </span>
              </div>
              {user.role === 'owner' && activePage !== 'owner' && (
                <Link href="/owner" className="btn btn-secondary btn-sm">
                  Owner Console
                </Link>
              )}
              {activePage !== 'dashboard' && (
                <Link href="/dashboard" className="btn btn-secondary btn-sm">
                  Browse Stores
                </Link>
              )}
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={logout}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={`btn btn-ghost btn-sm ${activePage === 'login' ? 'active' : ''}`}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="btn btn-primary btn-sm"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
