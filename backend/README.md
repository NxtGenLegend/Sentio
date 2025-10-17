# Sentio News Alerts Backend

AI-powered news alert system for wealth management platform using Tavily search and OpenAI GPT for relevance scoring.

## Features

- 🔍 **Intelligent News Search** - Tavily API integration for financial news
- 🤖 **AI Relevance Scoring** - GPT-4 analyzes article relevance for each client
- ⏰ **Automated Fetching** - Background jobs fetch news every 15 minutes
- 🎯 **Personalized Alerts** - News filtered by client portfolio and interests
- 📊 **Priority Classification** - Automatic high/medium/low priority assignment
- 🏷️ **Smart Categorization** - AI categorizes news into relevant topics
- ⚙️ **Configurable Alerts** - Per-client alert preferences

## Tech Stack

- **Runtime**: Node.js with ES Modules
- **Framework**: Express.js
- **Database**: SQLite with better-sqlite3
- **AI**: OpenAI GPT-4o-mini
- **Search**: Tavily API
- **Scheduling**: node-cron

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
OPENAI_API_KEY=sk-...
TAVILY_API_KEY=tvly-...
```

**Get API Keys:**
- OpenAI: https://platform.openai.com/api-keys
- Tavily: https://tavily.com/ (sign up for free tier)

### 3. Initialize Database

```bash
npm run init-db
```

This creates the SQLite database and populates it with sample clients.

### 4. Start Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server will start on `http://localhost:3001`

## API Endpoints

### News Alerts

#### Get All Alerts
```
GET /api/news/alerts?priority=high&category=Market%20News&clientId=1&limit=50
```

#### Get Client-Specific Alerts
```
GET /api/news/client/:clientId?priority=high&limit=20
```

#### Fetch News for Client (Manual Trigger)
```
POST /api/news/fetch/:clientId
```

#### Fetch News for All Clients
```
POST /api/news/fetch-all
```

#### Mark Alert as Read
```
PUT /api/news/read/:alertId
```

### Alert Configuration

#### Get Alert Config
```
GET /api/news/config/:clientId
```

#### Update Alert Config
```
POST /api/news/config/:clientId
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
```
GET /api/news/clients
```

## How It Works

### 1. News Fetching Flow

```
Client Profile → Tavily Search → AI Scoring → Database Storage
```

1. **Profile Analysis**: Extract holdings, interests, and investment style
2. **Search Query Building**: Create optimized search query from profile
3. **Tavily Search**: Fetch relevant financial news articles
4. **AI Relevance Scoring**: GPT-4 analyzes each article for client relevance
5. **Priority Assignment**: Automatic high/medium/low classification
6. **Category Detection**: AI categorizes into Market News, Regulatory, etc.
7. **Database Storage**: Save articles with scores and metadata

### 2. Background Jobs

- **News Fetching**: Runs every 15 minutes (configurable)
- **Cleanup**: Runs daily at 2 AM to remove old alerts (>30 days)

### 3. AI Scoring

Each article is scored based on:
- Client's portfolio holdings
- Investment interests and style
- Risk tolerance
- Geographic preferences
- Current market context

Scores range from 0.0 to 1.0, with threshold of 0.5 for inclusion.

## Database Schema

### clients
- id, name, aum, client_since, profile (JSON)

### news_alerts
- id, client_id, title, summary, url, source
- published_at, priority, category, tags
- relevance_score, relevance_reason, is_read

### alert_configs
- id, client_id, keywords, categories
- min_priority, frequency, email_enabled

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| NODE_ENV | Environment | development |
| OPENAI_API_KEY | OpenAI API key | - |
| TAVILY_API_KEY | Tavily API key | - |
| DATABASE_PATH | SQLite database path | ./data/sentio.db |
| NEWS_FETCH_SCHEDULE | Cron schedule | */15 * * * * |
| MAX_NEWS_PER_CLIENT | Max articles per fetch | 20 |
| NEWS_SEARCH_DAYS | Days to search back | 7 |

## Development

### Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js        # Database connection
│   │   └── initDb.js          # Schema initialization
│   ├── services/
│   │   ├── tavilyService.js   # Tavily API integration
│   │   ├── aiService.js       # OpenAI GPT integration
│   │   └── newsService.js     # Main business logic
│   ├── routes/
│   │   └── newsRoutes.js      # API endpoints
│   ├── jobs/
│   │   └── newsScheduler.js   # Cron jobs
│   └── server.js              # Express app
├── data/
│   └── sentio.db              # SQLite database (generated)
├── package.json
└── .env
```

### Adding New Features

1. **New API Endpoint**: Add to `routes/newsRoutes.js`
2. **New Service Method**: Add to `services/newsService.js`
3. **Database Changes**: Update `config/initDb.js`
4. **Background Job**: Add to `jobs/newsScheduler.js`

## Cost Estimates

### API Usage Costs (per month for 100 advisors, 1000 clients)

- **Tavily**: ~$50 (10,000 searches at $0.005 each)
- **OpenAI**: ~$100 (GPT-4o-mini for scoring 20,000 articles)
- **Total**: ~$150/month

### Optimization Tips

1. **Increase relevance threshold** to reduce API calls
2. **Batch article scoring** to minimize requests
3. **Cache search results** for duplicate queries
4. **Adjust fetch frequency** based on needs

## Troubleshooting

### Database Issues
```bash
# Reset database
rm data/sentio.db
npm run init-db
```

### API Key Errors
- Verify keys are in `.env` file
- Check API key permissions and billing
- Test keys separately with curl

### No News Appearing
- Manually trigger fetch: `POST /api/news/fetch-all`
- Check logs for errors
- Verify Tavily API key is working
- Lower relevance threshold in `newsService.js`

## License

MIT
