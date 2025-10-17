# ⚡ Quick Start - Run Everything

The simplest way to get Sentio up and running.

---

## Prerequisites Check

✅ You already have:
- Supabase database with sample data (from POPULATE_DATABASE.sql)
- Environment variables configured in `.env` and `backend/.env`
- Dependencies installed

---

## Running the Application

### Terminal 1 - Frontend

```bash
npm run dev
```

Frontend will start on: **http://localhost:5173**

### Terminal 2 - Backend

```bash
cd backend
npm run dev
```

Backend will start on: **http://localhost:3001**

---

## Test It Works

### 1. Frontend Test
1. Open **http://localhost:5173**
2. Click "Demo Login" (any username/password works)
3. You should see dashboard with clients and prospects

### 2. Backend Test
```bash
# Test backend health
curl http://localhost:3001/health

# Fetch news for all clients (takes 1-2 minutes)
curl -X POST http://localhost:3001/api/news/fetch-all
```

### 3. View AI-Generated News
1. Go to "News Alerts" page in frontend
2. Refresh after backend fetch completes
3. You should see AI-curated news articles

---

## What's Running

### Frontend (http://localhost:5173)
- React app with Tailwind CSS
- Connected to Supabase for clients/prospects
- Demo authentication (accepts any credentials)

### Backend (http://localhost:3001)
- Express API server
- Tavily news search integration
- OpenAI GPT-4o-mini for relevance scoring
- Automatic news fetching every 15 minutes
- All data stored in Supabase

---

## Key Features to Test

### ✅ Working Now
- Login (demo mode)
- View clients and prospects from Supabase
- Manual news fetch via API
- View AI-scored news alerts
- Filter news by priority/category
- Background job auto-fetches news every 15 min

### 🚧 Coming Soon
- "Configure Alerts" button (backend ready, frontend needs connection)
- Real authentication with Supabase Auth
- Email notifications
- Prospect → Client conversion workflow

---

## Stopping the Servers

Press `Ctrl+C` in each terminal window to stop frontend and backend.

---

## Need More Help?

See **SETUP_GUIDE.md** for detailed instructions and troubleshooting.
