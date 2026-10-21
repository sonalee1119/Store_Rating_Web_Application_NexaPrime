import './globals.css';

export const metadata = {
  title: 'RateSpace | Enterprise Store Rating & Merchant Analytics Platform',
  description:
    'Discover registered stores, submit verified 1-to-5 ratings, and track store performance analytics.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
