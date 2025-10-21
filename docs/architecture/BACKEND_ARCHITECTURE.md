# News Alerts Backend Architecture

## Executive Summary

**Recommendation: Build a separate backend service**

The News Alerts feature requires real-time data fetching, intelligent filtering, and potentially expensive AI operations (Tavily search). A dedicated backend is the better architectural choice for scalability, security, and maintainability.

---

## Why Separate Backend?

### ✅ Pros of Backend Service

1. **API Key Security**
   - Tavily API keys never exposed to client
   - No risk of key theft or abuse
   - Rate limiting controlled server-side

2. **Cost Control**
   - Implement caching to reduce API calls
   - Batch requests for multiple clients
   - Monitor and limit usage per advisor

3. **Performance**
   - Background jobs can fetch news periodically
   - Pre-process and rank articles
   - Serve cached results instantly

4. **Advanced Features**
   - AI summarization of articles
   - Sentiment analysis
   - Entity extraction (companies, people)
   - Custom relevance scoring

5. **Scalability**
   - Handle thousands of concurrent users
   - Queue system for long-running searches
   - Database for persistence

6. **Data Privacy**
   - Client information never sent to browser in search queries
   - Secure storage of preferences
   - Audit logs for compliance

### ❌ Cons of Frontend-Only

1. **Security Risk**: API keys exposed in browser
2. **Performance**: Every user makes individual API calls
3. **Cost**: No caching = expensive at scale
4. **Rate Limits**: Harder to manage across users
5. **No Background Processing**: Can't pre-fetch news

---

## Recommended Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ News Alerts  │  │ Filters UI   │  │ Client Profiles │  │
│  │  Component   │  │ Component    │  │                 │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└────────────────┬────────────────────────────────────────────┘
                 │ REST/WebSocket API
                 │
┌────────────────▼────────────────────────────────────────────┐
│                    Backend Service (Node.js/Python)          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Layer (Express/FastAPI)             │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         News Intelligence Service                    │  │
│  │  • Tavily Search Integration                         │  │
│  │  • AI Relevance Scoring                              │  │
│  │  • Entity Extraction (Companies, Keywords)           │  │
│  │  • Summarization (Claude API)                        │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Background Jobs (Bull Queue)                 │  │
│  │  • Periodic news fetching (every 15 min)             │  │
│  │  • Relevance scoring                                 │  │
│  │  • Alert notifications                               │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Caching Layer (Redis)                        │  │
│  │  • Cache search results (15-60 min TTL)              │  │
│  │  • Cache processed articles                          │  │
│  │  • Session management                                │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Database (PostgreSQL)                        │  │
│  │  • Client preferences & portfolios                   │  │
│  │  • News articles (deduplicated)                      │  │
│  │  • Alert configurations                              │  │
│  │  • Read/unread status                                │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │
┌────────────────▼────────────────────────────────────────────┐
│                    External Services                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   Tavily API │  │  Claude API  │  │  Email Service  │  │
│  │   (Search)   │  │(Summarize)   │  │  (SendGrid)     │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Backend Technology Stack

### Option 1: Node.js (Recommended for React shops)

```javascript
// Stack
- Framework: Express.js or Fastify
- Database: PostgreSQL with Prisma ORM
- Cache: Redis
- Queue: Bull (Redis-based)
- AI: Anthropic Claude SDK
- Search: Tavily API client

// Pros
- Same language as frontend (JavaScript/TypeScript)
- Easy for React developers to maintain
- Excellent npm ecosystem
- Fast for I/O-heavy operations

// Cons
- CPU-intensive AI operations slower than Python
```

### Option 2: Python (Recommended for AI/ML teams)

```python
# Stack
- Framework: FastAPI
- Database: PostgreSQL with SQLAlchemy
- Cache: Redis
- Queue: Celery
- AI: Anthropic Python SDK
- Search: Tavily Python client

# Pros
- Superior AI/ML libraries
- Better for complex data processing
- Type hints with Pydantic
- Async support with FastAPI

# Cons
- Different language from frontend
- Slower for pure I/O operations
```

---

## Key Features to Implement

### 1. Intelligent News Fetching

```typescript
// Pseudo-code for backend service

class NewsIntelligenceService {
  async fetchRelevantNews(clientProfile) {
    // Build smart search query based on:
    // - Client's portfolio holdings
    // - Industry tags
    // - Geographic preferences
    // - Investment strategies (ESG, value, growth)

    const searchQuery = this.buildSearchQuery(clientProfile);

    // Tavily search with context
    const results = await tavily.search(searchQuery, {
      max_results: 20,
      include_domains: ['wsj.com', 'ft.com', 'bloomberg.com'],
      topic: 'finance'
    });

    // AI-powered relevance scoring
    const scored = await this.scoreRelevance(results, clientProfile);

    // Filter and rank
    return scored.filter(r => r.relevanceScore > 0.7)
                 .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  async scoreRelevance(articles, profile) {
    // Use Claude to score each article's relevance
    const prompt = `
      Client Profile:
      - Holdings: ${profile.holdings}
      - Interests: ${profile.interests}
      - Risk tolerance: ${profile.riskTolerance}

      Article: ${article.title} - ${article.summary}

      Score relevance 0-1 and explain why this matters to the client.
    `;

    const score = await claude.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      messages: [{ role: 'user', content: prompt }]
    });

    return parseScore(score);
  }
}
```

### 2. Background Job System

```typescript
// Fetch news for all clients every 15 minutes
async function fetchNewsForAllClients() {
  const clients = await db.clients.findMany();

  for (const client of clients) {
    await newsQueue.add('fetch-client-news', {
      clientId: client.id,
      profile: client.profile
    });
  }
}

// Process individual client
newsQueue.process('fetch-client-news', async (job) => {
  const { clientId, profile } = job.data;

  const news = await newsService.fetchRelevantNews(profile);

  // Store in database
  await db.newsAlerts.createMany({
    data: news.map(article => ({
      clientId,
      ...article,
      fetchedAt: new Date()
    }))
  });

  // Check if high-priority alert
  const highPriority = news.filter(n => n.priority === 'high');
  if (highPriority.length > 0) {
    await notificationService.sendEmail(client.advisor.email, {
      subject: `${highPriority.length} High Priority Alerts`,
      template: 'news-alert',
      data: { news: highPriority }
    });
  }
});
```

### 3. API Endpoints

```typescript
// GET /api/news/alerts
// Fetch news for logged-in advisor's clients
router.get('/api/news/alerts', authenticate, async (req, res) => {
  const { priority, category, clientId, limit = 20 } = req.query;

  const alerts = await db.newsAlerts.findMany({
    where: {
      advisor: req.user.id,
      ...(priority && { priority }),
      ...(category && { category }),
      ...(clientId && { clientId }),
      publishedAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      }
    },
    orderBy: { publishedAt: 'desc' },
    take: limit
  });

  res.json(alerts);
});

// POST /api/news/configure
// Set up alert preferences
router.post('/api/news/configure', authenticate, async (req, res) => {
  const { clientId, keywords, categories, priority, frequency } = req.body;

  await db.alertConfig.upsert({
    where: { clientId },
    create: { clientId, ...req.body },
    update: req.body
  });

  res.json({ success: true });
});

// POST /api/news/search
// On-demand search (rate limited)
router.post('/api/news/search', authenticate, rateLimit('10/hour'), async (req, res) => {
  const { query, clientId } = req.body;

  const results = await newsService.searchNews(query, clientId);

  res.json(results);
});
```

### 4. Caching Strategy

```typescript
// Cache at multiple levels

// 1. Result cache (Redis)
async function getCachedNews(cacheKey) {
  const cached = await redis.get(`news:${cacheKey}`);
  if (cached) return JSON.parse(cached);

  const fresh = await fetchFreshNews();
  await redis.setex(`news:${cacheKey}`, 900, JSON.stringify(fresh)); // 15 min

  return fresh;
}

// 2. Deduplication cache
async function deduplicateArticle(article) {
  const hash = hashContent(article.title + article.summary);
  const exists = await redis.exists(`article:${hash}`);

  if (exists) return null; // Already seen

  await redis.setex(`article:${hash}`, 86400, '1'); // 24 hours
  return article;
}

// 3. User session cache
// Cache user's filter preferences in Redis for fast retrieval
```

---

## Database Schema

```sql
-- PostgreSQL Schema

CREATE TABLE advisors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id UUID REFERENCES advisors(id),
  name VARCHAR(255) NOT NULL,
  profile JSONB, -- Holdings, interests, risk tolerance
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE news_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  source VARCHAR(255),
  url TEXT,
  published_at TIMESTAMP,
  fetched_at TIMESTAMP DEFAULT NOW(),
  priority VARCHAR(20), -- high, medium, low
  category VARCHAR(100),
  tags TEXT[],
  relevance_score FLOAT,
  is_read BOOLEAN DEFAULT FALSE,

  -- Indexes for fast filtering
  INDEX idx_client_priority (client_id, priority),
  INDEX idx_published (published_at DESC),
  INDEX idx_category (category)
);

CREATE TABLE alert_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) UNIQUE,
  keywords TEXT[],
  categories TEXT[],
  min_priority VARCHAR(20),
  frequency VARCHAR(20), -- realtime, hourly, daily
  email_enabled BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id UUID REFERENCES advisors(id),
  query TEXT,
  client_id UUID,
  results_count INT,
  searched_at TIMESTAMP DEFAULT NOW()
);
```

---

## Cost Optimization

### Tavily API Costs
- ~$0.005 per search request
- Budget: $500/month = 100,000 searches
- Strategy:
  - Cache aggressively (15-30 min)
  - Batch requests for similar queries
  - Use background jobs to pre-fetch

### Claude API Costs
- ~$0.015 per 1K tokens (Claude 3.5 Sonnet)
- Relevance scoring: ~500 tokens per article
- Budget: $200/month = ~2.6M tokens = ~5,200 articles
- Strategy:
  - Only score articles that pass basic filters
  - Cache relevance scores
  - Use smaller models for simple tasks

### Total Estimated Cost
- 100 advisors × 10 clients = 1,000 clients
- 1,000 clients × 3 searches/day × 30 days = 90,000 searches/month
- Cost: ~$450/month for searches + $150/month for AI scoring = **$600/month**

---

## Deployment

### Recommended Stack

```yaml
# Docker Compose for development
version: '3.8'
services:
  api:
    build: ./backend
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/sentio
      - REDIS_URL=redis://redis:6379
      - TAVILY_API_KEY=${TAVILY_API_KEY}
      - CLAUDE_API_KEY=${CLAUDE_API_KEY}
    depends_on:
      - db
      - redis

  worker:
    build: ./backend
    command: npm run worker
    environment:
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis

  db:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Production (AWS/GCP/Azure)

- **API**: ECS/Cloud Run/App Service (auto-scaling)
- **Database**: RDS PostgreSQL / Cloud SQL
- **Cache**: ElastiCache Redis / Memorystore
- **Queue**: AWS SQS / Cloud Tasks / Azure Queue
- **Frontend**: Vercel / Netlify / CloudFlare Pages

---

## Phase 1: MVP Implementation (2-3 weeks)

### Week 1: Backend Foundation
- [ ] Set up Express/FastAPI server
- [ ] PostgreSQL database + migrations
- [ ] Tavily API integration
- [ ] Basic news fetching endpoint
- [ ] Authentication (JWT)

### Week 2: Intelligence Layer
- [ ] Claude API integration for scoring
- [ ] Background job system
- [ ] Redis caching
- [ ] Filtering & ranking logic

### Week 3: Polish & Deploy
- [ ] Email notifications
- [ ] Rate limiting
- [ ] Error handling
- [ ] Deploy to production
- [ ] Frontend integration

---

## Security Considerations

1. **API Keys**: Store in environment variables, never commit
2. **Rate Limiting**: Prevent abuse (10 requests/min per user)
3. **Authentication**: JWT tokens, rotate regularly
4. **Data Privacy**: Encrypt client data at rest
5. **HTTPS Only**: All API calls over TLS
6. **Input Validation**: Sanitize all user inputs
7. **SQL Injection**: Use parameterized queries
8. **CORS**: Whitelist frontend domain only

---

## Monitoring & Observability

```typescript
// Key metrics to track

- API latency (p50, p95, p99)
- Tavily API call volume & costs
- Claude API token usage & costs
- Cache hit rate (target: >80%)
- Background job success rate
- Alert delivery success rate
- Database query performance
```

---

## Conclusion

**Build a separate backend service.** The benefits far outweigh the costs:

✅ **Security**: API keys protected
✅ **Performance**: Caching & background jobs
✅ **Cost**: Controlled & optimized
✅ **Scalability**: Ready for growth
✅ **Features**: AI intelligence unlocked

The upfront investment (2-3 weeks) pays off immediately with better UX, lower costs, and professional architecture.
