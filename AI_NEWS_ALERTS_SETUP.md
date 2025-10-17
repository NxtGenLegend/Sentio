# AI-Powered News Alerts System - Complete Setup Guide

## 🎯 What This System Does

This is an **AI-powered news alerting system** that:
1. **Fetches** financial news from 4 RSS feeds (CNBC, Bloomberg, SEC, Financial Times)
2. **Analyzes** each article using AI to determine relevance for each client
3. **Ranks** articles by AI relevance score (0-100) based on client profile
4. **Generates** personalized AI summaries for each client
5. **Sends** a single beautiful digest email to YOU (the advisor) with all alerts

## ✨ Key AI Features

### 🤖 AI Relevance Analysis
For each article matched to a client, GPT-4 analyzes:
- Client's net worth and investment capacity
- Current keywords/interests
- Risk tolerance
- Age and occupation
- Portfolio focus areas

Returns:
- **Relevance Score** (0-100) - Only articles >= 60 are included
- **Reasoning** - Why this article matters (or doesn't) for this client
- **Key Insights** - What the client needs to know
- **Action Items** - Recommended next steps

### 📝 AI Personalized Summaries
For each client with alerts, AI generates a 3-4 sentence summary that:
- Highlights why these articles matter to THIS specific client
- Explains impact on their portfolio/interests
- Suggests considerations or opportunities

### 📊 AI Executive Digest
For the advisor, AI generates an overall summary that:
- Identifies key market themes from today's news
- Notes which clients are most affected and why
- Suggests immediate actions or client discussions needed

## 🏗️ Architecture

```
┌─────────────┐
│  Frontend   │
│   Button    │
└──────┬──────┘
       │ POST /api/alerts/fetch-and-send
       ▼
┌────────────────────────────────────────┐
│         Backend API Route              │
└──────┬─────────────────────────────────┘
       │
       ▼
┌─────────────────────┐
│  newsFetcher.js     │
│  - Fetch RSS feeds  │
│  - Categorize       │
│  - Prioritize       │
│  - Save to DB       │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│         alertMatcher.js                 │
│  ┌────────────────────────────────────┐ │
│  │ 1. Get clients with alert configs  │ │
│  │ 2. Basic keyword filtering         │ │
│  │ 3. AI relevance analysis (GPT-4)   │ │
│  │ 4. Filter by AI score >= 60        │ │
│  │ 5. Save to news_alerts table       │ │
│  │ 6. Generate client AI summaries    │ │
│  │ 7. Generate advisor AI digest      │ │
│  │ 8. Send single email to advisor    │ │
│  └────────────────────────────────────┘ │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────┐
│  aiAnalysisService  │
│  - GPT-4 Mini       │
│  - Relevance scoring│
│  - Summarization    │
└─────────────────────┘
```

## 📧 Email Example

You will receive ONE email that looks like this:

```
┌────────────────────────────────────────────────┐
│     📊 Client News Alerts Digest               │
│     Friday, October 17, 2025                   │
├────────────────────────────────────────────────┤
│  Clients: 3  │  Total Alerts: 12  │  High: 4  │
├────────────────────────────────────────────────┤
│                                                 │
│  🤖 AI EXECUTIVE SUMMARY                       │
│                                                 │
│  Today's market showed significant volatility  │
│  driven by Fed rate decisions. Your tech-      │
│  focused clients (Richard, Margaret) are most  │
│  affected due to their concentration in growth │
│  stocks. Consider scheduling calls to discuss  │
│  rebalancing opportunities...                  │
│                                                 │
├────────────────────────────────────────────────┤
│                                                 │
│  👤 Richard Whitmore (5 alerts)                │
│                                                 │
│  🤖 AI PERSONALIZED SUMMARY                    │
│  Given Richard's $25M tech-heavy portfolio,    │
│  today's Fed announcement directly impacts his │
│  holdings. The semiconductor news presents a   │
│  buying opportunity aligned with his growth    │
│  strategy...                                   │
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │ HIGH                                     │  │
│  │ Fed Announces Rate Cut                   │  │
│  │                                           │  │
│  │ 🤖 AI Relevance: 95/100                  │  │
│  │ This is highly relevant given Richard's  │  │
│  │ large allocation to rate-sensitive tech   │  │
│  │ stocks. Lower rates typically boost       │  │
│  │ valuations in his portfolio segment.      │  │
│  │                                           │  │
│  │ Summary: Federal Reserve cuts rates...   │  │
│  │ Source: CNBC | Read Full Article →       │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  [... 4 more articles ...]                     │
│                                                 │
├────────────────────────────────────────────────┤
│  👤 Margaret Thompson (4 alerts)               │
│  [... similar format ...]                      │
└────────────────────────────────────────────────┘
```

## 🚀 Setup Instructions

### Step 1: Update Advisor Email

**IMPORTANT:** Update your email address in the alertMatcher.js file:

```bash
# Edit backend/src/services/alertMatcher.js
# Change line 10:
const ADVISOR_EMAIL = 'your-email@gmail.com';
# To:
const ADVISOR_EMAIL = 'your-actual-email@gmail.com';
```

Or better yet, add it to `.env`:

```bash
# In backend/.env, add:
ADVISOR_EMAIL=your-email@gmail.com
```

Then update alertMatcher.js to use:
```javascript
const ADVISOR_EMAIL = process.env.ADVISOR_EMAIL || 'your-email@gmail.com';
```

### Step 2: Verify OpenAI API Key

Check that your OpenAI API key is in `backend/.env`:

```bash
OPENAI_API_KEY="sk-proj-..."
```

The system uses GPT-4 Mini for cost-effective analysis (~$0.15 per 1M tokens).

### Step 3: Create news_articles Table

Run in Supabase SQL Editor:

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

### Step 4: Verify Gmail Credentials

Make sure `backend/credentials.json` exists and contains valid OAuth2 credentials:

```json
{
  "type": "authorized_user",
  "client_id": "...",
  "client_secret": "...",
  "refresh_token": "..."
}
```

### Step 5: Start Backend

```bash
cd backend
npm run dev
```

You should see:
```
🚀 Sentio News Alerts Backend
📡 Server running on http://localhost:3001
✅ OpenAI API key configured
```

### Step 6: Start Frontend

In a separate terminal:

```bash
npm run dev
```

### Step 7: Configure Client Alerts

1. Go to **Clients** page
2. Click on a client (e.g., Richard, Margaret, or Harrison)
3. Click **"Configure Alerts"** button
4. Add keywords relevant to their portfolio:
   - Examples: `tech`, `real estate`, `ESG`, `semiconductor`, `AI`, `crypto`, `bonds`
5. Set priority threshold (recommend `medium`)
6. Enable categories: `market`, `regulatory`
7. Enable email notifications
8. **Save configuration**

### Step 8: Test the System

1. Go to **News Alerts** page
2. Click **"🔄 Fetch News & Send Alerts"** button
3. Wait for completion (30-60 seconds for AI analysis)
4. Check your email inbox for the digest

## 🔍 How It Works (Detailed Flow)

### Phase 1: Fetch News
```
newsFetcher.js fetches from 4 RSS feeds
├─ CNBC Markets (10 articles)
├─ Bloomberg Markets (10 articles)
├─ SEC Press Releases (10 articles)
└─ Financial Times (10 articles)

For each article:
├─ Auto-categorize: market/regulatory
├─ Auto-prioritize: high/medium/low based on keywords
├─ Extract tags: tech, real estate, crypto, ESG, etc.
└─ Save to news_articles table (skip duplicates)
```

### Phase 2: Match & Analyze
```
alertMatcher.js processes each client
├─ Get client with alert config
│  ├─ keywords: ['tech', 'ESG', 'real estate']
│  ├─ excluded_keywords: []
│  ├─ priority_threshold: 'medium'
│  └─ categories_enabled: ['market', 'regulatory']
│
├─ Step 1: Basic keyword filter (reduce API costs)
│  └─ Match: 15 articles contain 'tech' or 'ESG' or 'real estate'
│
├─ Step 2: AI Analysis (GPT-4 Mini)
│  ├─ For each article (up to 10 max):
│  │  ├─ Send client profile + article to GPT-4
│  │  ├─ Get relevance_score (0-100)
│  │  ├─ Get reasoning
│  │  ├─ Get key_insights
│  │  └─ Get action_items
│  └─ Result: 15 articles → 8 articles with scores >= 60
│
├─ Step 3: Save to database
│  └─ Insert 8 articles into news_alerts table
│
├─ Step 4: Generate client AI summary
│  └─ GPT-4 summarizes all 8 articles for this client
│
└─ Result: Client alert package ready
```

### Phase 3: Generate Digest
```
After all clients processed:
├─ Generate AI executive summary (advisor digest)
│  ├─ Input: All client alerts
│  ├─ AI analyzes: Key themes, affected clients, actions
│  └─ Output: 4-5 sentence executive summary
│
└─ Send single email to advisor
   ├─ Subject: "📊 Client News Digest: 3 clients, 12 alerts"
   ├─ Body: Beautiful HTML with AI summaries
   └─ Recipient: ADVISOR_EMAIL
```

## 💰 Cost Estimate

Using GPT-4 Mini (`gpt-4o-mini`):
- Input: ~$0.15 per 1M tokens
- Output: ~$0.60 per 1M tokens

Typical usage per fetch:
- 40 articles fetched
- 3 clients configured
- 10 articles analyzed per client
- ~500 tokens per analysis

**Estimated cost per fetch:** $0.05 - $0.10

**Monthly cost (daily fetches):** ~$1.50 - $3.00

## 🐛 Troubleshooting

### "Cannot find OpenAI API key"
- Check `backend/.env` has `OPENAI_API_KEY="sk-proj-..."`
- Restart backend server after adding

### "AI analysis unavailable"
- Check OpenAI API key is valid
- Check you have API credits
- System will fall back to keyword matching (score = 50)

### "No relevant alerts found"
- Client keywords might be too specific
- Try broader keywords: `market`, `stocks`, `economy`
- Lower priority threshold to `low`

### "Email not sent"
- Check `ADVISOR_EMAIL` is set correctly
- Verify `credentials.json` exists and is valid
- Check Gmail API permissions

### "Articles with score < 60 excluded"
- This is normal - AI filters low-relevance articles
- If too aggressive, lower threshold in alertMatcher.js line 99:
  ```javascript
  const relevantArticles = analyzedArticles.filter(a => a.ai_relevance_score >= 50); // Changed from 60
  ```

## 🎯 Best Practices

### Keyword Strategy
**Good keywords (broad, high-value):**
- `tech`, `technology`, `AI`, `artificial intelligence`
- `real estate`, `property`, `housing`
- `ESG`, `sustainable`, `climate`
- `semiconductor`, `chip`
- `crypto`, `bitcoin`, `blockchain`

**Bad keywords (too specific):**
- `NVIDIA Q3 earnings` (too narrow)
- `John Smith` (proper noun, unlikely match)
- `buy` or `sell` (too generic, false positives)

### Client Profiles
Make sure clients have rich profiles for better AI analysis:
- Net worth
- Age
- Occupation
- Risk tolerance (if added to schema)

The AI uses this context to determine relevance.

### Email Frequency
Recommend running once per day:
- Morning: Before market open (7-8 AM)
- Or Evening: After market close (5-6 PM)

Can be automated with a cron job later.

## 📊 Success Metrics

After running, check:
- ✅ Articles fetched: 40 (from 4 feeds)
- ✅ Articles saved: 10-15 new (rest are duplicates)
- ✅ Clients with alerts: 2-3 (depends on keywords)
- ✅ Total alerts: 8-15 (after AI filtering)
- ✅ High priority: 2-4
- ✅ Advisor email sent: Yes
- ✅ AI digest generated: Yes

## 🔮 Future Enhancements

1. **Scheduled Fetching**: Auto-run daily using node-cron
2. **Client-facing Emails**: Send individual emails to clients (optional)
3. **In-app Notifications**: Show alerts in the app
4. **Historical Tracking**: Track which articles led to client actions
5. **Sentiment Analysis**: Add market sentiment scores
6. **More Sources**: Add WSJ, Reuters, FT Premium
7. **Portfolio Integration**: Link to actual holdings for deeper analysis
8. **Read Tracking**: Mark articles as read/actioned

## ✅ Final Checklist

Before first use:
- [ ] Run `CREATE_NEWS_ARTICLES_TABLE.sql` in Supabase
- [ ] Update `ADVISOR_EMAIL` in alertMatcher.js
- [ ] Verify OpenAI API key in `.env`
- [ ] Verify Gmail credentials in `credentials.json`
- [ ] Start backend: `cd backend && npm run dev`
- [ ] Start frontend: `npm run dev`
- [ ] Configure alerts for at least one client
- [ ] Click "Fetch News & Send Alerts"
- [ ] Check email inbox
- [ ] Verify articles in database

---

**🎉 You're all set! Enjoy AI-powered news alerts!**

For issues, check backend logs for detailed error messages.
