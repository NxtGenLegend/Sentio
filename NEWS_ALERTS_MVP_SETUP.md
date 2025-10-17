# News Alerts MVP - Complete Setup Guide

## ✅ What's Been Built

All backend and frontend code is now complete! Here's what was created:

### Backend Services
1. **`backend/src/services/newsFetcher.js`** - Fetches news from RSS feeds (CNBC, Bloomberg, SEC, Financial Times)
2. **`backend/src/services/emailService.js`** - Gmail API integration for sending emails
3. **`backend/src/services/alertMatcher.js`** - Matches articles with client preferences
4. **`backend/src/routes/alerts.js`** - API endpoint for fetch-and-send operation
5. **`backend/src/server.js`** - Updated to include alerts route

### Frontend
6. **`src/App.jsx`** - Added "Fetch News & Send Alerts" button to News Alerts page

### Database
7. **`CREATE_NEWS_ARTICLES_TABLE.sql`** - SQL script to create the news_articles table

---

## 🚀 Setup Instructions

### Step 1: Create the Database Table

Run the SQL script in your Supabase SQL Editor:

```bash
# Open Supabase Dashboard → SQL Editor → New Query
# Copy and paste the contents of CREATE_NEWS_ARTICLES_TABLE.sql
# Click "Run"
```

Or directly run this SQL:

```sql
CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT,
  url TEXT NOT NULL UNIQUE,
  source TEXT,
  published_at TIMESTAMPTZ,
  category TEXT,
  priority TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_articles_published ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_articles_priority ON news_articles(priority);
```

### Step 2: Set Up Gmail API Credentials

You mentioned you have `credentials.json` ready. Make sure it's placed at:

```
backend/credentials.json
```

The file should contain OAuth2 credentials in this format:

```json
{
  "type": "authorized_user",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "refresh_token": "YOUR_REFRESH_TOKEN"
}
```

**If you need help setting up Gmail OAuth2:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Gmail API
4. Create OAuth2 credentials
5. Download credentials and get refresh token using OAuth2 playground

### Step 3: Verify Backend Dependencies

All required dependencies should already be installed. Verify with:

```bash
cd backend
npm list googleapis rss-parser
```

If missing, install:

```bash
npm install googleapis rss-parser
```

### Step 4: Start the Backend

```bash
cd backend
npm run dev
```

You should see:

```
🚀 Sentio News Alerts Backend
📡 Server running on http://localhost:3001
```

### Step 5: Start the Frontend

In a separate terminal:

```bash
cd /mnt/c/Users/skjet/Coding/Sentio
npm run dev
```

---

## 🧪 Testing the MVP

### 1. Set Up Client Alert Preferences

Before fetching news, make sure at least one client has alert preferences configured:

1. Go to **Clients** page
2. Click on a client (e.g., Richard, Margaret, or Harrison)
3. Click **"Configure Alerts"** button
4. Add keywords like: `tech`, `real estate`, `ESG`, `market`, `stocks`
5. Set priority threshold to `medium`
6. Enable categories: `market`, `regulatory`
7. Enable email notifications
8. Save configuration

### 2. Test the Fetch & Send Flow

1. Go to **News Alerts** page
2. Click the **"🔄 Fetch News & Send Alerts"** button
3. Wait for the process to complete (shows "⏳ Fetching..." during operation)

**Expected Behavior:**
- Backend fetches ~40 articles from RSS feeds
- Articles are categorized and prioritized automatically
- System matches articles with client keywords
- Emails are sent to clients with matching articles
- You'll see an alert: `✅ Fetched X articles and sent Y emails to client1@example.com, client2@example.com!`

### 3. Verify Results

**Check Backend Logs:**
```
📰 Starting news fetch...
Fetching from CNBC...
✅ Fetched 10 articles from CNBC
Fetching from Bloomberg...
✅ Fetched 10 articles from Bloomberg
...
🔍 Matching 40 articles with client preferences...
📧 Sending 5 alerts to Richard Whitmore
✅ Sent emails to 2 clients
```

**Check Supabase Database:**
```sql
-- View fetched articles
SELECT * FROM news_articles ORDER BY created_at DESC LIMIT 10;

-- View matched alerts
SELECT * FROM news_alerts ORDER BY created_at DESC LIMIT 10;

-- View clients with alert configs
SELECT c.first_name, c.last_name, ac.keywords, ac.priority_threshold
FROM clients c
JOIN alert_configs ac ON ac.client_id = c.id;
```

**Check Email:**
- Emails should arrive at the client's primary_email
- Subject: `📈 X New Market Alerts`
- Body contains article titles, summaries, sources, and priority levels

---

## 🔍 How It Works

### 1. News Fetching (`newsFetcher.js`)
- Fetches from 4 RSS feeds every time button is clicked
- Auto-categorizes: `market` or `regulatory`
- Auto-prioritizes based on keywords:
  - **High**: breaking, alert, urgent, crash, surge, record
  - **Medium**: report, announce, release, update, growth
  - **Low**: everything else
- Extracts tags: tech, real estate, crypto, ESG, energy, etc.
- Saves to `news_articles` table (prevents duplicates by URL)

### 2. Alert Matching (`alertMatcher.js`)
- Gets all clients with alert configurations
- For each article:
  - ✅ Contains client keywords → Match
  - ❌ Contains excluded keywords → No match
  - ✅ Meets priority threshold → Match
  - ✅ Category is enabled → Match
- Saves matching articles to `news_alerts` table
- Queues emails for matching clients

### 3. Email Sending (`emailService.js`)
- Uses Gmail API to send HTML emails
- Beautiful formatting with:
  - Client name in header
  - Article title, summary, source
  - Priority badge (colored)
  - "Read More" link
  - Sentio branding in footer

### 4. API Endpoint (`routes/alerts.js`)
- `POST /api/alerts/fetch-and-send`
- Orchestrates the entire flow:
  1. Fetch news → 2. Match articles → 3. Send emails
- Returns summary:
  ```json
  {
    "success": true,
    "articlesFetched": 40,
    "articlesSaved": 12,
    "emailsSent": 2,
    "recipients": ["client1@example.com", "client2@example.com"]
  }
  ```

---

## 🐛 Troubleshooting

### Error: "Cannot read credentials.json"
**Solution:** Make sure `backend/credentials.json` exists and contains valid OAuth2 credentials.

### Error: "column 'news_articles' does not exist"
**Solution:** Run `CREATE_NEWS_ARTICLES_TABLE.sql` in Supabase SQL Editor.

### No emails are sent
**Possible causes:**
1. No clients have alert configurations → Set up alert configs for at least one client
2. No articles match client keywords → Try broader keywords like "market", "stocks", "tech"
3. Gmail API credentials expired → Regenerate refresh token
4. Email notifications disabled → Enable in client alert config

### Articles fetched but not saved
**Check:**
- Articles might already exist (duplicate URLs prevented)
- Check backend logs for database errors
- Verify Supabase connection in `.env`

### Frontend button not working
**Check:**
1. Backend is running on http://localhost:3001
2. Open browser console for errors
3. Check CORS settings in backend (already configured)

---

## 📊 Database Schema Reference

### `news_articles` (stores all fetched news)
```
- id: UUID
- title: TEXT
- summary: TEXT
- url: TEXT (UNIQUE)
- source: TEXT
- published_at: TIMESTAMPTZ
- category: TEXT
- priority: TEXT
- tags: TEXT[]
- created_at: TIMESTAMPTZ
```

### `news_alerts` (stores matched alerts per client)
```
- id: UUID
- client_id: UUID → clients(id)
- title: TEXT
- summary: TEXT
- url: TEXT
- source: TEXT
- published_at: TIMESTAMPTZ
- priority: TEXT
- category: TEXT
- tags: TEXT[]
- is_read: BOOLEAN
- read_at: TIMESTAMPTZ
- created_at: TIMESTAMPTZ
```

### `alert_configs` (stores client preferences)
```
- id: UUID
- client_id: UUID → clients(id)
- keywords: TEXT[]
- excluded_keywords: TEXT[]
- priority_threshold: TEXT
- email_notifications: BOOLEAN
- categories_enabled: TEXT[]
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

---

## 🎯 Next Steps (Future Enhancements)

Once the MVP is working, consider:

1. **Scheduled Fetching**: Use `node-cron` to fetch news every hour automatically
2. **Email Batching**: Send digest emails instead of individual alerts
3. **Frontend News Display**: Show fetched news from database instead of mock data
4. **Read/Unread Tracking**: Mark alerts as read when viewed
5. **More RSS Feeds**: Add Wall Street Journal, Reuters, etc.
6. **AI Summarization**: Use OpenAI to generate better summaries
7. **In-App Notifications**: Show alerts in the app before sending emails

---

## ✅ Checklist

- [ ] Run `CREATE_NEWS_ARTICLES_TABLE.sql` in Supabase
- [ ] Place `credentials.json` in `backend/` directory
- [ ] Start backend: `cd backend && npm run dev`
- [ ] Start frontend: `npm run dev`
- [ ] Configure alert preferences for at least one client
- [ ] Click "Fetch News & Send Alerts" button
- [ ] Verify articles in `news_articles` table
- [ ] Verify alerts in `news_alerts` table
- [ ] Check email inbox for alerts

---

**🎉 That's it! Your News Alerts MVP is ready to go!**

If you encounter any issues, check the backend logs and database tables first. The system is designed to fail gracefully and log detailed information about each step.
