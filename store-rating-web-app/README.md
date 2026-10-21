# RateSpace — Store Rating Web Application (NexaPrime Coding Challenge)

A production-ready full-stack web application built with **Next.js (App Router)**, **Node.js + Express**, and **MongoDB (Mongoose)** that enables customers to browse registered stores, submit or update 1-to-5 star ratings, and allows store owners to monitor store ratings and customer feedback analytics.

## Key Features & Resolved Bugs

1. **Working Authentication & Role-Based Redirection**:
   - Supports **Normal User (`user`)** and **Store Owner (`owner`)** roles.
   - Pre-configured `.env` and `.env.local` files plus automatic database seeding ensure Login and Create Account work immediately out of the box.
   - One-click **Demo Sign In** and **Auto-Fill** buttons on both the Login and Create Account pages.
   - Store Owners can create and link their store directly during registration or from the Owner Console.
2. **Normal User Dashboard (`/dashboard`)**:
   - View all registered stores with name, category, address, average rating, and review count.
   - Instant search bar with **Search Stores** and **Reset** buttons, status filters (`All Stores`, `Rated by Me`, `Not Rated Yet`, `Top Rated 4.5+`), and sorting (`Name A–Z`, `Highest Rated`, `Most Reviewed`).
   - Interactive 1-to-5 star rating buttons plus an explicit **Submit Rating** / **Update Rating** button and **Details** breakdown modal on every store card.
3. **Store Owner Console (`/owner`)**:
   - Displays portfolio KPI summary cards (`Managed Stores`, `Portfolio Average Rating`, `Total Customer Reviews`).
   - Visual 5-star to 1-star rating distribution bars, customer ratings table with star filters, **Register New Store** button, and **Export Ratings CSV** button.
4. **Resilient Storage Architecture**:
   - Connects natively to **MongoDB** (`MONGODB_URI`) using Mongoose models (`User`, `Store`, `Rating`).
   - Includes an automatic persistent JSON datastore fallback (`backend/data/local_db.json`) if a local MongoDB daemon is not running, preventing server startup crashes.

## Project Folder Structure

```text
store-rating-web-app/
├── README.md
├── package.json
├── backend/
│   ├── package.json
│   ├── .env
│   ├── .env.example
│   ├── render.yaml
│   ├── data/
│   │   ├── seedData.js
│   │   └── local_db.json
│   ├── src/
│   │   ├── server.js
│   │   ├── app.js
│   │   ├── seed.js
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── env.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── storeController.js
│   │   │   └── ownerController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Store.js
│   │   │   └── Rating.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── storeRoutes.js
│   │   │   └── ownerRoutes.js
│   │   ├── services/
│   │   │   └── dataStore.js
│   │   └── utils/
│   │       ├── cryptoAuth.js
│   │       ├── httpAdapter.js
│   │       └── validators.js
│   └── tests/
│       └── api.test.js
└── frontend/
    ├── package.json
    ├── next.config.mjs
    ├── vercel.json
    ├── .env.local
    ├── .env.example
    ├── app/
    │   ├── layout.js
    │   ├── globals.css
    │   ├── page.js
    │   ├── login/page.js
    │   ├── register/page.js
    │   ├── dashboard/page.js
    │   └── owner/page.js
    ├── components/
    │   ├── Icon.js
    │   ├── Navbar.js
    │   ├── Footer.js
    │   ├── StarRating.js
    │   └── StoreCard.js
    └── lib/
        ├── api.js
        └── validation.js
```

## How to Run Locally

### Prerequisites
- **Node.js** v18+ (or v20+)
- **MongoDB** (Local MongoDB instance or MongoDB Atlas URI; if local MongoDB is not running, the backend automatically uses its built-in persistent JSON datastore)

### Step 1: Extract and Start the Backend API
Open a terminal in the project root folder and run:

```bash
cd backend
npm install
npm run seed
npm run dev
```
- The backend API starts at `http://localhost:5000` (health check: `http://localhost:5000/api/health`).
- Run automated API tests anytime with:
  ```bash
  npm test
  ```

### Step 2: Start the Frontend Web Application
Open a second terminal in the project root folder and run:

```bash
cd frontend
npm install
npm run dev
```
- Open `http://localhost:3000` in your browser.

## Pre-Seeded Test Account Credentials

| Role | Email | Password | Dashboard Route |
| :--- | :--- | :--- | :--- |
| **Normal User (Customer)** | `aarav.sharma@nexaprime.in` | `Welcome@123` | `/dashboard` |
| **Normal User 2 (Customer)** | `priya.nair@nexaprime.in` | `Welcome@123` | `/dashboard` |
| **Store Owner (Merchant)** | `vikram.kulkarni@nexaprime.in` | `Owner@1234` | `/owner` |
| **Store Owner 2 (Demo)** | `owner.demo@example.com` | `Owner@1234` | `/owner` |

## REST API Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Server & database connectivity check |
| `POST` | `/api/auth/register` | Public | Register a Normal User or Store Owner account |
| `POST` | `/api/auth/login` | Public | Authenticate user and return signed JWT |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |
| `GET` | `/api/stores` | Authenticated | List & search stores (`?search=&sort=`) |
| `GET` | `/api/stores/:id` | Authenticated | View single store details and rating distribution |
| `POST` / `PUT` | `/api/stores/:id/ratings` | Authenticated | Submit (1–5) or update rating for a store |
| `GET` | `/api/owner/dashboard` | Store Owner | View owner stores, average scores, and customer ratings |
| `POST` | `/api/owner/stores` | Store Owner | Register an additional store under owner account |
