# shrnk.io — URL Shortener with Analytics

A full-stack URL shortener built with the MERN stack. Users can sign up,
shorten long URLs, manage their links from a dashboard, and view per-link
analytics (click counts, last visited time, recent visit history, and daily
click trend charts).

> 📄 See [`AI_PLANNING.md`](./AI_PLANNING.md) for the architecture diagram,
> full feature list, and AI-assisted development workflow.

## Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS v4, React Router, Recharts, Axios
- **Backend**: Node.js + Express
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT + bcrypt password hashing

## Project Structure

```
url-shortener/
├── backend/          # Express API
│   ├── config/       # MongoDB connection
│   ├── controllers/  # Auth, URL, redirect logic
│   ├── middleware/   # JWT auth, error handling
│   ├── models/       # User, Url, Click (Mongoose schemas)
│   ├── routes/       # API route definitions
│   ├── utils/        # Validators
│   └── server.js     # App entry point
├── frontend/          # React (Vite) SPA
│   └── src/
│       ├── api/          # Axios instance
│       ├── components/   # Reusable UI components
│       ├── context/      # Auth context
│       └── pages/         # Login, Signup, Dashboard, Analytics, Public Stats
├── AI_PLANNING.md
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- A MongoDB connection string (use a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster, or a local MongoDB instance)

### 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and fill in:

| Variable | Description |
|---|---|
| `PORT` | Port for the API server (default `5000`) |
| `MONGO_URI` | Your MongoDB connection string |
| `JWT_SECRET` | A long, random secret string for signing JWTs |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `BASE_URL` | Public base URL used to build short links, e.g. `http://localhost:5000` |
| `CLIENT_URL` | Frontend URL, for CORS, e.g. `http://localhost:5173` |

Start the server:

```bash
npm run dev      # with nodemon (auto-restart)
# or
npm start
```

The API will be available at `http://localhost:5000`. Verify with:

```bash
curl http://localhost:5000/api/health
```

### 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API, e.g. `http://localhost:5000` |

Start the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Using the App

1. **Sign up** for a new account (name, email, password — min 6 characters).
2. On the **Dashboard**, paste a long URL and click **Shorten**.
   - Click **Options** to optionally set a **custom alias** or an **expiry date**.
3. Each link is shown as a card with:
   - The short link (click to visit, click the copy icon to copy)
   - The original destination
   - Total click count
   - Actions: **copy**, **QR code**, **edit destination**, **view analytics**, **open**, **delete**
4. Click the analytics (bar chart) icon on any link to see:
   - Total clicks, last visited time, created date
   - A bar chart of clicks over the last 14 days
   - A table of recent visits (timestamp, referrer, user agent)
5. **Bulk upload**: click "Bulk upload (CSV)" on the dashboard and upload a
   `.csv` or `.txt` file with one URL per line (an optional header row named
   `url`/`originalUrl` is ignored).
6. **Public stats**: any link's aggregate stats (total clicks, last visited,
   created date) can be viewed without logging in at
   `http://localhost:5173/stats/<shortCode>`.

## API Overview

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Log in and receive a JWT |
| GET | `/api/auth/me` | Private | Get current user |
| GET | `/api/urls` | Private | List all of the user's short URLs |
| POST | `/api/urls` | Private | Create a new short URL |
| POST | `/api/urls/bulk` | Private | Bulk-create short URLs from a list |
| GET | `/api/urls/:id` | Private | Get a single short URL's details |
| PUT | `/api/urls/:id` | Private | Update destination URL / expiry |
| DELETE | `/api/urls/:id` | Private | Delete a short URL |
| GET | `/api/urls/:id/analytics` | Private | Get analytics for a short URL |
| GET | `/api/urls/:id/qrcode` | Private | Get a QR code (data URL) for a short URL |
| GET | `/api/public/:shortCode` | Public | Public aggregate stats for a short URL |
| GET | `/:shortCode` | Public | Redirect to the original URL (logs a click) |

## Assumptions Made

- A single MongoDB database is used for both the application data and
  analytics (separate `Url` and `Click` collections), rather than a separate
  analytics datastore, since the data volume expected for this project is
  small.
- Click analytics record IP address and user agent from request headers for
  potential future geolocation/device breakdowns, but the current UI does not
  surface geolocation since that would require a third-party IP-lookup
  service (see `AI_PLANNING.md` for reasoning).
- Short codes are 7-character `nanoid` strings by default; custom aliases
  must be 3-20 characters (letters, numbers, hyphens, underscores) and cannot
  collide with reserved API path segments (`api`, `auth`, `login`, etc.).
- "Recent visit history" is capped at the 50 most recent visits per link to
  keep the analytics response lightweight; the daily trend chart covers the
  last 14 days.
- Expired links return `410 Gone` on the redirect route and are visually
  flagged as "Expired" in the dashboard, but are not automatically deleted.
- Passwords must be at least 6 characters; JWTs are stored in
  `localStorage` on the client for simplicity (acceptable for a hackathon
  scope; a production app would consider httpOnly cookies).

## Demo Video

> _Add your Loom/YouTube link here before submitting._

---
## Screenshots

### Login Page
![Login Page](./frontend/screenshots/Login.png)

---
### Dashboard
![Dashboard](./frontend/screenshots/Dashboard.png)

---

### QR
![QR Page](./frontend/screenshots/Qr.png)

---
### Analytics
![Analytics](./frontend/screenshots/Analytics.png)

---
This project is a part of a hackathon run by https://katomaran.com
