import Link from 'next/link';
import { StoreIcon } from './Icon';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="brand-logo-box sm">
            <StoreIcon size={15} />
          </span>
          <span className="footer-title">RateSpace Store Rating Platform</span>
          <span className="footer-divider">|</span>
          <span className="footer-copy">NexaPrime Full Stack Engineering Assessment</span>
        </div>
        <div className="footer-links">
          <Link href="/">Platform Overview</Link>
          <Link href="/dashboard">Store Directory</Link>
          <Link href="/login">Sign In</Link>
          <Link href="/register">Create Account</Link>
        </div>
      </div>
    </footer>
  );
}
