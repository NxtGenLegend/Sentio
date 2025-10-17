# Alert System - What Exists vs What Needs Building

## 🎯 Current State (What's Built)

### ✅ Frontend UI
1. **"Configure Alerts" Button** - In client detail page header
2. **Alert Configuration Modal** - Full UI for setting preferences:
   - Add/remove keywords to monitor
   - Add/remove excluded keywords
   - Set priority threshold (low/medium/high)
   - Enable/disable categories (market, regulatory, general)
   - Toggle email notifications
3. **News Alerts Page** - Displays news articles from database

### ✅ Database Tables
1. **`alert_configs`** - Stores client alert preferences
   ```sql
   - keywords: ['real estate', 'ESG', 'tech']
   - excluded_keywords: ['spam', 'advertisement']
   - priority_threshold: 'medium'
   - email_notifications: true
   - categories_enabled: ['market', 'regulatory']
   ```

2. **`news_alerts`** - Stores news articles
   ```sql
   - title, summary, url, source
   - published_at, priority, category
   - is_read, read_at
   ```

### ✅ API Functions
- `getAlertConfig(clientId)` - Fetch client's alert preferences
- `updateAlertConfig(clientId, config)` - Save alert preferences
- `getAllNews(options)` - Get news alerts with filters

---

## ❌ What's MISSING (Needs to be Built)

### 1. News Fetching Service (Backend)
**What it needs to do:**
- Scrape/fetch news from external APIs (Google News, Bloomberg, Financial Times, etc.)
- Run on a schedule (every hour/day)
- Store new articles in `news_alerts` table

**Technologies needed:**
- News API service (NewsAPI.org, Google News API, RSS feeds)
- Background job scheduler (node-cron, BullMQ, or Supabase Edge Functions)
- Web scraping (if needed)

### 2. Alert Matching Logic (Backend)
**What it needs to do:**
- When new news arrives, check each client's alert config
- Match article content against client keywords
- Filter out excluded keywords
- Check if article category is enabled
- Check if priority meets threshold
- Create alert records for matching clients

**Pseudocode:**
```javascript
for each new article:
  for each client with alerts enabled:
    if article contains client.keywords:
      if article does NOT contain client.excluded_keywords:
        if article.priority >= client.priority_threshold:
          if article.category in client.categories_enabled:
            // This is a match!
            create alert record
            queue for email notification
```

### 3. Email Notification System (Backend)
**What it needs to do:**
- Send emails when new relevant alerts are created
- Use Gmail API or SendGrid or similar
- Batch emails (don't send 100 individual emails)
- Track what's been sent
- Respect email_notifications toggle

**Technologies needed:**
- Gmail API + OAuth2 (if using Gmail)
- OR SendGrid/Mailgun/AWS SES (easier alternative)
- Email templates (HTML emails with article summaries)
- Queue system to batch sends

### 4. Email Configuration UI (Frontend - Future)
**What it needs to do:**
- Let user configure email settings:
  - Email address to send to
  - Frequency (real-time, daily digest, weekly)
  - Time of day for digests
- OAuth flow for Gmail (if using Gmail API)

---

## 🔧 How to Test Current Functionality

### Test "Configure Alerts" Button:

1. **Run the schema fix first:**
   ```bash
   # In Supabase SQL Editor:
   # Run FIX_ALL_SCHEMA_ISSUES.sql
   # Then run COMPLETE_SEED_DATA.sql
   ```

2. **Test the UI:**
   - Go to Clients page
   - Click on Richard, Margaret, or Harrison
   - Click "Configure Alerts" button
   - Modal should open
   - Add keywords like "real estate", "tech", "ESG"
   - Click "Save Configuration"
   - Should see success message

3. **Verify in database:**
   ```sql
   SELECT * FROM alert_configs;
   -- Should see your keywords saved
   ```

### Why It "Doesn't Work" Yet:

The button DOES work for saving preferences, but:
- ❌ No emails are sent (no email service)
- ❌ No news is fetched automatically (no news scraper)
- ❌ No alerts are generated (no matching logic)

**It's like setting up a filter in your email app before you've connected your email account - the settings save, but there's nothing to filter yet.**

---

## 🚀 Next Steps to Make It Functional

### Option 1: Manual News Entry (Quick Test)
Just manually add news articles to test the display:
```sql
INSERT INTO news_alerts (client_id, title, summary, url, source, published_at, priority, category)
VALUES (
  'client-id-here',
  'Test Article',
  'This matches your keywords!',
  'https://example.com',
  'Manual Entry',
  NOW(),
  'high',
  'market'
);
```

### Option 2: Build News Fetching (Medium Effort)
1. Sign up for NewsAPI.org (free tier: 100 requests/day)
2. Create a Supabase Edge Function or Node.js script
3. Run daily to fetch news
4. Store in database

### Option 3: Build Full Email System (High Effort)
1. Set up SendGrid account
2. Create email templates
3. Build matching logic
4. Set up cron job to check and send

### Option 4: Remove "Configure Alerts" for Now
If you don't want to build the backend yet, we can:
- Remove the "Configure Alerts" button
- Keep the news alerts page (manually add articles)
- Add email functionality later

---

## 💡 Recommendation

**For now, I suggest:**

1. **Keep the UI** - It's useful even without automation
2. **Manually add some news articles** - Shows how it will look
3. **Build email system later** - When you're ready for backend work

OR

**Remove it entirely** if you don't plan to build the backend soon.

---

**What would you like to do?**
- Keep it as-is (saves preferences, no emails yet)
- Remove the button until backend is ready
- Build a simple news fetching service now
