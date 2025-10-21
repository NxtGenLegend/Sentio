# News Alerts MVP - Implementation Status

## ✅ What's DONE

### 1. News Fetching Service (`backend/src/services/newsFetcher.js`)
- ✅ Fetches news from 4 financial RSS feeds (CNBC, Bloomberg, SEC, FT)
- ✅ Auto-categorizes articles (market, regulatory)
- ✅ Auto-assigns priority (high, medium, low) based on keywords
- ✅ Extracts relevant tags (tech, real estate, ESG, crypto, etc.)
- ✅ Saves to `news_articles` table (not `news_alerts` yet)
- ✅ Prevents duplicates by checking URL

### 2. Dependencies Installed
- ✅ `googleapis` - For Gmail API
- ✅ `rss-parser` - For fetching RSS feeds

## ❌ What Still NEEDS TO BE BUILT

I've hit context limits, so here's what you need to create:

### 1. **Create `news_articles` Table** (Run in Supabase)
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

CREATE INDEX idx_news_articles_published ON news_articles(published_at DESC);
CREATE INDEX idx_news_articles_category ON news_articles(category);
```

### 2. **Gmail Email Service** (`backend/src/services/emailService.js`)
```javascript
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CREDENTIALS_PATH = path.join(__dirname, '../../credentials.json');

// Initialize Gmail API
const oauth2Client = new google.auth.OAuth2();
oauth2Client.setCredentials(JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8')));

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

export async function sendEmail(to, subject, htmlBody) {
  const message = [
    `To: ${to}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    '',
    htmlBody
  ].join('\n');

  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  try {
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

export function generateAlertEmail(clientName, alerts) {
  const alertsHtml = alerts.map(alert => `
    <div style="margin-bottom: 20px; padding: 15px; border-left: 4px solid #0A1929;">
      <h3 style="margin: 0 0 10px; color: #0A1929;">${alert.title}</h3>
      <p style="margin: 0 0 10px; color: #666;">${alert.summary}</p>
      <p style="margin: 0; font-size: 12px; color: #999;">
        <strong>Source:</strong> ${alert.source} |
        <strong>Priority:</strong> ${alert.priority.toUpperCase()} |
        <a href="${alert.url}" target="_blank">Read More</a>
      </p>
    </div>
  `).join('');

  return `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #0A1929; border-bottom: 2px solid #0A1929; padding-bottom: 10px;">
          New Market Alerts for ${clientName}
        </h1>
        <p style="color: #666; margin-bottom: 30px;">
          You have ${alerts.length} new alert(s) matching your preferences.
        </p>
        ${alertsHtml}
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="font-size: 12px; color: #999; text-align: center;">
          Sentio Wealth Management | Powered by Claude Code
        </p>
      </body>
    </html>
  `;
}
```

### 3. **Alert Matching Service** (`backend/src/services/alertMatcher.js`)
```javascript
import { supabase } from '../config/supabase.js';
import { sendEmail, generateAlertEmail } from './emailService.js';

export async function matchArticlesWithClientAlerts(articles) {
  console.log(`🔍 Matching ${articles.length} articles with client preferences...`);

  // Get all clients with alert configs
  const { data: clients, error } = await supabase
    .from('clients')
    .select(`
      id,
      first_name,
      last_name,
      primary_email,
      alert_configs (*)
    `)
    .not('alert_configs', 'is', null);

  if (error || !clients) {
    console.error('Error fetching clients:', error);
    return;
  }

  const emailsSent = [];

  for (const client of clients) {
    const config = client.alert_configs[0];
    if (!config || !config.email_notifications) continue;

    const matchedArticles = articles.filter(article => {
      // Check if article contains any client keywords
      const hasKeyword = config.keywords?.some(keyword =>
        article.title.toLowerCase().includes(keyword.toLowerCase()) ||
        article.summary.toLowerCase().includes(keyword.toLowerCase())
      );

      // Check if article contains excluded keywords
      const hasExcluded = config.excluded_keywords?.some(keyword =>
        article.title.toLowerCase().includes(keyword.toLowerCase()) ||
        article.summary.toLowerCase().includes(keyword.toLowerCase())
      );

      // Check priority threshold
      const priorityMap = { low: 1, medium: 2, high: 3 };
      const meetsPriority = priorityMap[article.priority] >= priorityMap[config.priority_threshold];

      // Check category
      const matchesCategory = config.categories_enabled?.includes(article.category);

      return hasKeyword && !hasExcluded && meetsPriority && matchesCategory;
    });

    if (matchedArticles.length > 0) {
      console.log(`📧 Sending ${matchedArticles.length} alerts to ${client.first_name} ${client.last_name}`);

      // Save to news_alerts table
      for (const article of matchedArticles) {
        await supabase.from('news_alerts').insert({
          client_id: client.id,
          title: article.title,
          summary: article.summary,
          url: article.url,
          source: article.source,
          published_at: article.published_at,
          priority: article.priority,
          category: article.category,
          tags: article.tags
        });
      }

      // Send email
      const emailHtml = generateAlertEmail(
        `${client.first_name} ${client.last_name}`,
        matchedArticles
      );

      const result = await sendEmail(
        client.primary_email,
        `📈 ${matchedArticles.length} New Market Alerts`,
        emailHtml
      );

      if (result.success) {
        emailsSent.push(client.primary_email);
      }
    }
  }

  console.log(`✅ Sent emails to ${emailsSent.length} clients`);
  return emailsSent;
}
```

### 4. **API Endpoint** (`backend/src/routes/alerts.js`)
```javascript
import express from 'express';
import { fetchAndSaveNews } from '../services/newsFetcher.js';
import { matchArticlesWithClientAlerts } from '../services/alertMatcher.js';

const router = express.Router();

router.post('/fetch-and-send', async (req, res) => {
  try {
    console.log('🚀 Starting news fetch and alert process...');

    // Step 1: Fetch news
    const fetchResult = await fetchAndSaveNews();

    if (!fetchResult.success) {
      return res.status(500).json({
        success: false,
        error: fetchResult.error
      });
    }

    // Step 2: Match with client preferences and send emails
    const emailsSent = await matchArticlesWithClientAlerts(fetchResult.articles);

    res.json({
      success: true,
      articlesFetched: fetchResult.totalFetched,
      articlesSaved: fetchResult.totalSaved,
      emailsSent: emailsSent.length,
      recipients: emailsSent
    });

  } catch (error) {
    console.error('❌ Error in fetch-and-send:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
```

### 5. **Update server.js** (Add route)
```javascript
// In backend/src/server.js, add:
import alertsRouter from './routes/alerts.js';
app.use('/api/alerts', alertsRouter);
```

### 6. **Frontend Button** (Add to News Alerts page)
```javascript
// In src/App.jsx, add to NewsAlertsPage:

const [isFetching, setIsFetching] = useState(false);

const handleFetchNews = async () => {
  setIsFetching(true);
  try {
    const response = await fetch('http://localhost:3000/api/alerts/fetch-and-send', {
      method: 'POST'
    });
    const data = await response.json();

    if (data.success) {
      alert(`✅ Fetched ${data.articlesSaved} articles and sent ${data.emailsSent} emails!`);
      // Refresh news list
      fetchNews();
    } else {
      alert(`❌ Error: ${data.error}`);
    }
  } catch (error) {
    alert(`❌ Error: ${error.message}`);
  } finally {
    setIsFetching(false);
  }
};

// Add button in header:
<button
  onClick={handleFetchNews}
  disabled={isFetching}
  className="px-4 py-2 bg-old-money-navy text-old-money-cream rounded-lg hover:bg-old-money-navy/90 font-semibold"
>
  {isFetching ? '⏳ Fetching...' : '🔄 Fetch News & Send Alerts'}
</button>
```

## 🚀 How to Complete the Setup

1. **Run the SQL** to create `news_articles` table
2. **Create the 3 service files** I outlined above
3. **Create the alerts route** file
4. **Update server.js** to include the route
5. **Add the button** to the frontend
6. **Start backend**: `cd backend && npm run dev`
7. **Test**: Click "Fetch News & Send Alerts"

## 📧 Gmail Setup (Important!)

Your `credentials.json` needs to be a **Service Account** JSON or contain OAuth tokens.

If using OAuth2, you need:
```json
{
  "type": "authorized_user",
  "client_id": "...",
  "client_secret": "...",
  "refresh_token": "..."
}
```

Let me know if you need help setting up Gmail OAuth!

---

**Status**: Backend foundation complete, need to create 4 more files to finish MVP
