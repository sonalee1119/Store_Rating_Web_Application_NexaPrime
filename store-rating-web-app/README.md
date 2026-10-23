# Store Rating Web Application — NexaPrime Coding Challenge

Full-stack Store Rating Web Application built for the **NexaPrime Pvt. Ltd. Full Stack Intern Coding Challenge**. Registered users can browse and search stores, view overall store ratings, and submit or update their own 1-to-5 star ratings. Store owners can sign in to a dedicated merchant analytics dashboard to view their store's average rating, rating distribution breakdown, and customer review submissions.

## 1. Live Deployment & Repository Links

| Submission Deliverable | Link / Endpoint |
| :--- | :--- |
| **GitHub Repository** | https://github.com/sonalee1119/Store_Rating_Web_Application_NexaPrime |
| **Live Frontend Deployment (Vercel)** | https://store-rating-web-application-nexa-p.vercel.app |
| **Backend API Base URL (Vercel / Render)** | https://store-rating-web-application-nexa-p.vercel.app/api |
| **Backend Health Check Endpoint** | https://store-rating-web-application-nexa-p.vercel.app/api/health |

## 2. Technologies Used

| Layer | Technology Stack |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), React 18, Custom Responsive CSS Design System, Inline SVG Iconography |
| **Backend** | Node.js, Express.js REST API |
| **Database** | MongoDB with Mongoose ODM (`User`, `Store`, and `Rating` schemas) + Built-in Local JSON Fallback (`backend/data/local_db.json`) |
| **Authentication & Security** | JSON Web Tokens (`jsonwebtoken`), Bcrypt Password Hashing (`bcryptjs`), Role-Based Access Control (`user` and `owner` roles) |
| **Deployment** | Vercel (Frontend), Render (Backend Web Service), MongoDB Atlas (Cloud Database) |

## 3. Pre-Seeded Test Account Credentials

The application is pre-seeded with test accounts for both required user roles (**Normal User** and **Store Owner**). Evaluators can sign in using these credentials or click the one-click demo login buttons on `/login`:

| User Role | Full Name | Email Address | Password | Redirect Dashboard |
| :--- | :--- | :--- | :--- | :--- |
| **Normal User** | Aarav Deshmukh (Customer Account) | `aarav.sharma@nexaprime.in` | `Welcome@123` | `/dashboard` |
| **Normal User** | Priya Nandakumar Nair (Customer) | `priya.nair@nexaprime.in` | `Welcome@123` | `/dashboard` |
| **Normal User** | Rohan Rajendra Joshi (Customer) | `rohan.joshi@nexaprime.in` | `Welcome@123` | `/dashboard` |
| **Store Owner** | Vikramaditya Kulkarni (Store Owner) | `vikram.kulkarni@nexaprime.in` | `Owner@1234` | `/owner` |
| **Store Owner** | Siddharth Deshpande (Demo Owner) | `owner.demo@example.com` | `Owner@1234` | `/owner` |

## 4. Required Environment Variables

### Backend (`store-rating-web-app/backend/.env`)

```ini
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/store_rating_app
JWT_SECRET=replace_with_a_long_random_secret_key
CLIENT_ORIGIN=http://localhost:3000
```

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Port number for the Express API server | `5000` |
| `MONGODB_URI` | MongoDB local or MongoDB Atlas connection URI | `mongodb://127.0.0.1:27017/store_rating_app` |
| `JWT_SECRET` | Secret key used to sign and verify JWT tokens | `nexaprime_store_rating_jwt_secret_key_2026` |
| `CLIENT_ORIGIN` | Allowed frontend origin URL for CORS | `http://localhost:3000` |

### Frontend (`store-rating-web-app/frontend/.env.local`)

```ini
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Base URL for backend API requests | `http://localhost:5000/api` |

## 5. Local Setup & Run Instructions

### Prerequisites

* **Node.js**: v18.0.0 or higher
* **MongoDB**: Local MongoDB instance or MongoDB Atlas connection string (if a local MongoDB instance is not running, the backend automatically falls back to its persistent JSON datastore at `backend/data/local_db.json`)

### Step 1: Clone the Repository

```bash
git clone [https://github.com/sonalee1119/Store_Rating_Web_Application_NexaPrime.git](https://github.com/sonalee1119/Store_Rating_Web_Application_NexaPrime.git)
cd Store_Rating_Web_Application_NexaPrime/store-rating-web-app
```

### Step 2: Setup and Start the Backend API

```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

* The backend server runs at `http://localhost:5000` (health check: `http://localhost:5000/api/health`).
* To run the automated backend API test suite (8 integration tests):
  ```bash
  npm test
  ```

### Step 3: Setup and Start the Frontend Application

Open a second terminal window inside `Store_Rating_Web_Application_NexaPrime/store-rating-web-app`:

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

* Open `http://localhost:3000` in your browser.

## 6. Project Folder Structure

```text
Store_Rating_Web_Application_NexaPrime/
├── README.md
├── .gitignore
└── store-rating-web-app/
    ├── README.md
    ├── package.json
    ├── backend/
    │   ├── package.json
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

## 7. Functional Features & Validation Rules

### Functional Overview

* **Authentication (`/login` & `/register`)**: User registration and login with JWT session management, password hashing, and automatic role-based redirection (`/dashboard` for Normal Users, `/owner` for Store Owners).
* **Normal User Dashboard (`/dashboard`)**: View all registered stores, search stores by name or address, filter by rating status, view each store's average rating, submit a new 1-to-5 star rating, and update previously submitted ratings.
* **Store Owner Console (`/owner`)**: View store performance KPIs, average store rating, 5-star to 1-star rating distribution bars, and a filterable table of users who have rated the store.

### Validation Rules Implemented

* **Name**: 20–60 characters standard validation (with a one-click helper on the registration form).
* **Address**: Maximum 400 characters.
* **Password**: 8–16 characters, including at least one uppercase letter and one special character.
* **Email**: Standard valid email format.
* **Rating**: Whole number from 1 to 5 (one rating per user per store, updatable anytime).

## 8. REST API Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | API health and storage status check |
| `POST` | `/api/auth/register` | Public | Register a Normal User or Store Owner account |
| `POST` | `/api/auth/login` | Public | Authenticate user and return signed JWT |
| `GET` | `/api/auth/me` | Authenticated | Get current logged-in user details |
| `GET` | `/api/stores` | Authenticated | List all registered stores (`?search=&sort=`) |
| `GET` | `/api/stores/:id` | Authenticated | Get single store details and rating breakdown |
| `POST` / `PUT` | `/api/stores/:id/ratings` | Authenticated | Submit (1–5) or update rating for a store |
| `GET` | `/api/owner/dashboard` | Store Owner | View owner stores, average rating, and customer ratings |
| `POST` | `/api/owner/stores` | Store Owner | Register an additional store for the authenticated owner |
