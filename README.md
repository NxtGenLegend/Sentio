# Sentio

> **The AgenticOS for Wealth Management**

An AI-powered wealth management platform that transforms how financial advisors manage client portfolios and stay informed about market-moving news.

## Overview

Sentio is an intelligent operating system for wealth advisors that combines real-time news monitoring, AI-powered relevance scoring, and interactive portfolio visualization. Built for high-net-worth client management, Sentio automates the tedious work of news curation while providing advisors with powerful tools to visualize and communicate complex financial portfolios.

## The Problem

Wealth advisors face three critical challenges:

1. **Information Overload**: Thousands of news articles published daily, making it impossible to manually identify what matters for each client
2. **Manual Client Monitoring**: Time-consuming process to track news relevant to each client's unique portfolio, interests, and risk profile
3. **Complex Portfolio Communication**: Difficulty visualizing and explaining multi-asset portfolios (stocks, bonds, real estate, private equity, alternatives) to clients

## The Solution

Sentio automates and enhances the wealth advisor workflow with three core features:

### 1. AI-Powered News Intelligence
- **Automated News Aggregation**: Fetches latest news from 30+ sources using Tavily API
- **Client-Specific Matching**: AI analyzes each article against individual client profiles (keywords, risk tolerance, portfolio composition)
- **Smart Relevance Scoring**: OpenAI GPT-4 scores articles 0-100 based on relevance to each client's financial situation
- **Intelligent Filtering**: Pre-filters by priority, category, and excluded keywords before AI analysis
- **Digest Emails**: Automated daily digests sent to advisors with curated news for each client

### 2. Interactive Portfolio Dashboards
- **Drag-and-Drop Canvas**: React Flow-powered visual portfolio builder
- **Multi-Asset Widgets**: Pre-built components for stocks, bonds, real estate, private equity, crypto, and alternatives
- **Persistent Layouts**: Client-specific dashboard configurations saved to database
- **Real-Time Updates**: Live portfolio metrics and performance tracking
- **Professional Design**: "Old money" aesthetic with gradient accents and glass-morphism effects

### 3. Comprehensive Client Management
- **Centralized Client Database**: Store client profiles, contact information, and financial metrics
- **Alert Configuration**: Per-client customization of news preferences and notification settings
- **Client Portal**: Dedicated pages for each client with dashboard and news alerts
- **Net Worth Tracking**: Monitor and visualize client portfolio values over time

## How AI is Used

Sentio leverages AI at multiple layers to deliver intelligent wealth management:

### News Relevance Analysis (OpenAI GPT-4)
- **Context-Aware Scoring**: Analyzes article content against client occupation, net worth, age, portfolio composition, and custom keywords
- **Nuanced Understanding**: Catches indirect relevance (e.g., "federal law changes" for agritech investors)
- **Batch Processing**: Efficiently processes up to 15 articles per client per fetch cycle
- **Threshold-Based Filtering**: Only alerts scoring ≥50/100 reach advisors, reducing noise

### Client Summaries (OpenAI GPT-4)
- **Personalized Insights**: Generates custom summaries explaining why each article matters for specific clients
- **Portfolio Context**: Incorporates client risk tolerance, age, occupation, and net worth into analysis
- **Actionable Recommendations**: Suggests potential portfolio implications and discussion points

### Advisor Digest Generation (OpenAI GPT-4)
- **Multi-Client Overview**: Synthesizes alerts across entire client base into coherent digest
- **Priority Highlighting**: Identifies most critical alerts requiring immediate attention
- **Trend Analysis**: Spots cross-client patterns and market-wide developments

### Technical Implementation
```javascript
// Example: AI relevance scoring
const aiAnalysis = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{
    role: "system",
    content: "You are a financial advisor assistant analyzing news relevance..."
  }, {
    role: "user",
    content: `Client: ${client.occupation}, $${client.net_worth}, age ${client.age}
              Keywords: ${keywords.join(', ')}
              Article: ${article.title} - ${article.summary}
              Score 0-100 on relevance and explain why.`
  }]
});
```

## Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **React Flow** for interactive portfolio visualization
- **React Router v6** for client-side routing
- **Tailwind CSS** for styling with custom old-money color palette
- **Lucide Icons** for consistent iconography

### Backend
- **Node.js/Express** REST API
- **Supabase/PostgreSQL** for data persistence
- **OpenAI API** for AI-powered news analysis
- **Gmail API** with OAuth2 for email delivery
- **Tavily API** for news aggregation

### Database Schema
```sql
clients           # Client profiles and financial data
alert_configs     # Per-client news preferences
news_alerts       # Matched articles stored per client
client_dashboards # React Flow layouts (JSONB)
```

## Project Structure

```
sentio/
├── src/                          # Frontend React application
│   ├── components/
│   │   ├── dashboard/           # Portfolio widget components
│   │   └── clients/             # Client management UI
│   ├── pages/
│   │   ├── client/              # Client-specific pages
│   │   └── ClientsPage.jsx      # Main client list view
│   └── App.jsx                  # Main app with routing
│
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── newsService.js         # Tavily API integration
│   │   │   ├── aiAnalysisService.js   # OpenAI integration
│   │   │   ├── alertMatcher.js        # News-client matching logic
│   │   │   └── emailService.js        # Gmail API integration
│   │   ├── routes/              # Express API routes
│   │   ├── config/              # Supabase and service configs
│   │   └── server.js            # Express app entry point
│   │
│   ├── migrations/              # SQL database migrations
│   ├── docs/                    # Setup and configuration guides
│   └── scripts/                 # Utility scripts
│
└── README.md                    # This file
```

## Getting Started

### Prerequisites
- Node.js 16+
- Supabase account
- OpenAI API key
- Google Cloud project with Gmail API enabled
- Tavily API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/sentio.git
cd sentio
```

2. **Install dependencies**
```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

3. **Configure environment variables**

Create `backend/.env`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
OPENAI_API_KEY=your_openai_key
TAVILY_API_KEY=your_tavily_key
PORT=3001
```

4. **Run database migrations**

Follow instructions in `backend/docs/MIGRATION_INSTRUCTIONS.md`

5. **Set up Gmail OAuth**

Follow instructions in `backend/docs/GMAIL_SETUP.md`

6. **Start development servers**
```bash
# Frontend (from root directory)
npm run dev

# Backend (from backend directory)
cd backend
npm run dev
```

Visit `http://localhost:5173` to see the application.

## Key Features in Detail

### News Alert System
- Fetches 30 latest articles from Tavily API
- Pre-filters by category, priority, and excluded keywords
- AI analyzes each article against client profiles
- Only articles scoring ≥50/100 are stored and reported
- Generates personalized summaries per client
- Creates consolidated advisor digest
- Sends beautifully formatted HTML email

### Portfolio Dashboard
- Drag-and-drop widget placement
- 7 widget types: Stock, Bond, Real Estate, Private Equity, Crypto, Portfolio Summary, Alternative
- Auto-layout feature for automatic organization
- Persistent storage in PostgreSQL as JSONB
- Mini-map for navigation of large dashboards
- Animated connections between related assets
- Real-time save functionality

### Client Management
- Create/edit client profiles
- Configure alert preferences per client
- View client-specific news alerts
- Customize dashboard layouts per client
- Track net worth and portfolio composition

## Team

Built by a passionate team of innovators:

- **Adhish Chakravorty**
- **Luke Stokes**
- **Camila Patino**
- **Sabrina Ueslati**

## Documentation

- [Database Migration Guide](backend/docs/MIGRATION_INSTRUCTIONS.md)
- [Gmail OAuth Setup](backend/docs/GMAIL_SETUP.md)

## License

[Add your license here]

## Contact

[Add contact information]

---

**Sentio** - Empowering wealth advisors with AI-driven intelligence and intuitive portfolio visualization.
