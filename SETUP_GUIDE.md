# 🚀 Sentio Setup Guide

Complete guide to set up and run the Sentio wealth management platform with AI-powered news alerts.

---

## Prerequisites

- Node.js (v18 or higher)
- npm
- Supabase account (free tier works)
- OpenAI API key
- Tavily API key

---

## Step 1: Supabase Database Setup

### 1.1 Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in project details and wait for setup to complete

### 1.2 Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Open the file `SUPABASE_SCHEMA.md` in this repo
3. Copy the SQL from **Step 2: Create Tables** section
4. Paste into SQL Editor and click **Run**

### 1.3 Populate Sample Data

1. Open the file `POPULATE_DATABASE.sql` in this repo
2. Copy the entire contents
3. Paste into Supabase SQL Editor and click **Run**
4. Verify data was created by running:
   ```sql
   SELECT COUNT(*) FROM clients;
   SELECT COUNT(*) FROM prospects;
   ```
   You should see 5 clients and 6 prospects.

### 1.4 Get API Keys

1. In Supabase dashboard, go to **Project Settings** (gear icon)
2. Click **API** in settings menu
3. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long JWT token)

---

## Step 2: Get API Keys for AI Services

### 2.1 OpenAI API Key

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in or create account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-proj-...`)

### 2.2 Tavily API Key

1. Go to [https://tavily.com](https://tavily.com)
2. Sign up for free account
3. Get your API key from dashboard
4. Copy the key (starts with `tvly-...`)

---

## Step 3: Frontend Setup

### 3.1 Install Dependencies

```bash
npm install
```

### 3.2 Configure Environment Variables

Create/edit `.env` file in the **root directory**:

```bash
# Supabase Configuration
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key-here"

# API Keys (for frontend reference, but backend uses these)
OPENAI_API_KEY="sk-proj-your-key-here"
TAVILY_API_KEY="tvly-your-key-here"
```

Replace the values with your actual keys from Steps 1.4 and 2.

### 3.3 Start Frontend

```bash
npm run dev
```

Frontend will start on **http://localhost:5173**

---

## Step 4: Backend Setup

### 4.1 Install Backend Dependencies

```bash
cd backend
npm install
```

### 4.2 Configure Backend Environment

Create/edit `backend/.env` file:

```bash
PORT=3001
NODE_ENV=development

# API Keys
OPENAI_API_KEY="sk-proj-your-openai-key-here"
TAVILY_API_KEY="tvly-your-tavily-key-here"

# Supabase Configuration
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key-here"

# News Settings
NEWS_FETCH_SCHEDULE=*/15 * * * *
MAX_NEWS_PER_CLIENT=20
NEWS_SEARCH_DAYS=7
```

Replace with your actual API keys.

### 4.3 Start Backend

**In a new terminal window:**

```bash
cd backend
npm run dev
```

Backend will start on **http://localhost:3001**

You should see:
```
✅ Supabase client initialized for backend
🚀 Sentio News Alerts Backend
📡 Server running on http://localhost:3001
✅ OpenAI API key configured
✅ Tavily API key configured
✨ Backend is ready to serve requests!
```

---

## Step 5: Verify Everything Works

### 5.1 Test Frontend

1. Open browser to **http://localhost:5173**
2. Click "Demo Login" button (accepts any credentials for demo)
3. You should see:
   - Dashboard with clients
   - Prospects page with sample data
   - News Alerts page (empty initially)

### 5.2 Test Backend API

In a new terminal:

```bash
# Test backend is running
curl http://localhost:3001/health

# Get clients from Supabase
curl http://localhost:3001/api/news/clients

# Check news alerts (will be empty initially)
curl http://localhost:3001/api/news/alerts
```

### 5.3 Fetch News with AI (Manual Test)

To test the AI news fetching system, manually trigger a news fetch:

```bash
# Fetch news for all clients
curl -X POST http://localhost:3001/api/news/fetch-all
```

This will:
1. Use Tavily to search for relevant financial news for each client
2. Use OpenAI GPT-4o-mini to score relevance
3. Save high-relevance articles to Supabase
4. Take 1-2 minutes depending on number of clients

**Check backend terminal** - you'll see:
```
📰 Fetching news for Richard & Margaret Ashford...
   Found 15 articles from Tavily
   Scoring relevance with AI...
   5 articles passed relevance threshold
   ✅ Saved 5 new articles
```

### 5.4 View News in Frontend

1. Go to **News Alerts** page in frontend
2. You should now see AI-fetched news articles
3. Each article shows:
   - Priority (high/medium/low)
   - Category (Market News, ESG, etc.)
   - Relevance reason (why it matters to the client)
   - Tags

---

## How to Use the Platform

### Demo Login
- Username: anything (demo mode)
- Password: anything (demo mode)

### Dashboard
- View all clients and their AUM
- Quick stats overview

### Prospects Page
- View pipeline of potential clients
- Track interactions and status
- Filter and search prospects

### News Alerts Page
- AI-curated news for your clients
- Filter by priority, category, or client
- Click article to view in new tab
- Background job fetches news every 15 minutes

### Configure Alerts (Coming Soon)
- "Configure Alerts" button is in UI
- Backend API is ready (`POST /api/news/config/:clientId`)
- Frontend integration pending

---

## Background Jobs

The backend automatically runs these jobs:

### News Fetching
- **Schedule**: Every 15 minutes (configurable)
- **What it does**: Searches for relevant news for each client using Tavily + OpenAI
- **Cost**: ~$0.05 per client per fetch (15 articles × $0.003)

### Cleanup
- **Schedule**: Daily at 2 AM
- **What it does**: Removes news alerts older than 30 days

---

## API Endpoints

### News Alerts

#### Get All Alerts
```bash
GET /api/news/alerts?priority=high&category=Market%20News&clientId=<uuid>&limit=50
```

#### Get Client-Specific Alerts
```bash
GET /api/news/client/<client-uuid>?priority=high&limit=20
```

#### Manually Fetch News for Client
```bash
POST /api/news/fetch/<client-uuid>
```

#### Manually Fetch News for All Clients
```bash
POST /api/news/fetch-all
```

#### Mark Alert as Read
```bash
PUT /api/news/read/<alert-uuid>
```

### Alert Configuration

#### Get Alert Config
```bash
GET /api/news/config/<client-uuid>
```

#### Update Alert Config
```bash
POST /api/news/config/<client-uuid>
Content-Type: application/json

{
  "keywords": ["ESG", "sustainable"],
  "categories": ["Market News", "ESG"],
  "minPriority": "medium",
  "frequency": "realtime",
  "emailEnabled": true
}
```

### Clients

#### Get All Clients
```bash
GET /api/news/clients
```

---

## File Structure

```
Sentio/
├── src/                          # Frontend source
│   ├── App.jsx                   # Main React app
│   └── lib/
│       └── supabase.js          # Frontend Supabase client
├── backend/                      # Backend service
│   ├── src/
│   │   ├── server.js            # Express server
│   │   ├── config/
│   │   │   └── supabase.js      # Backend Supabase client
│   │   ├── services/
│   │   │   ├── newsService.js   # Main business logic
│   │   │   ├── tavilyService.js # Tavily API integration
│   │   │   └── aiService.js     # OpenAI GPT integration
│   │   ├── routes/
│   │   │   └── newsRoutes.js    # API endpoints
│   │   └── jobs/
│   │       └── newsScheduler.js # Cron jobs
│   ├── .env                      # Backend environment vars
│   └── package.json
├── .env                          # Frontend environment vars
├── SUPABASE_SCHEMA.md           # Database schema
├── POPULATE_DATABASE.sql        # Sample data
└── SETUP_GUIDE.md               # This file
```

---

## Troubleshooting

### "Missing Supabase environment variables"
- Check `.env` file exists in root directory
- Verify environment variable names are correct (must start with `VITE_`)
- Restart frontend dev server after changing `.env`

### Backend won't start
- Check `backend/.env` has all required variables
- Verify API keys are valid
- Check port 3001 isn't already in use: `lsof -i :3001`

### No news appearing
1. Manually trigger fetch: `curl -X POST http://localhost:3001/api/news/fetch-all`
2. Check backend terminal for errors
3. Verify Tavily API key is valid
4. Verify OpenAI API key is valid and has credits

### "Client not found" errors
- Make sure you ran `POPULATE_DATABASE.sql` in Supabase
- Verify clients exist: `SELECT * FROM clients;` in Supabase SQL Editor
- Check client UUIDs in API calls match database

### Frontend shows old data
- Clear browser cache
- Check Supabase data directly in SQL Editor
- Verify frontend is calling correct API endpoints

---

## Cost Estimates

For 100 advisors with 1000 clients total:

### API Costs (per month)
- **Tavily**: ~$50 (10,000 searches at $0.005 each)
- **OpenAI**: ~$100 (GPT-4o-mini for scoring 20,000 articles)
- **Supabase**: $0 (free tier sufficient for testing)

**Total**: ~$150/month for full AI features

### Optimization Tips
1. Increase relevance threshold (default 0.5 → 0.7) to reduce OpenAI calls
2. Adjust fetch frequency (every 15 min → hourly) for lower-priority clients
3. Use client alert configs to reduce unnecessary searches
4. Batch article scoring to minimize API calls

---

## Next Steps

1. **Connect "Configure Alerts" button** in frontend to backend API
2. **Add authentication** - Replace demo mode with real Supabase Auth
3. **Email notifications** - Implement email digests using the alert config settings
4. **Add client onboarding** - Form to add new clients with profile builder
5. **Prospect conversion** - Workflow to convert prospect → client

---

## Support

For issues or questions:
- Check backend logs in terminal
- Check frontend console in browser DevTools
- Verify all API keys are valid and have sufficient credits
- Check Supabase dashboard for database errors

---

**You're all set!** 🎉

Frontend: http://localhost:5173
Backend: http://localhost:3001
Backend Health: http://localhost:3001/health
Backend API Docs: http://localhost:3001/
