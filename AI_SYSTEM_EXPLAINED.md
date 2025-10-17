# AI News Alerts System - Complete Explanation

## 🤖 What the AI Does & Why

The system uses **GPT-4 Mini** (cost-effective, fast) to analyze news relevance for each client. Here's the complete flow:

---

## Flow Overview

```
1. FETCH NEWS (30 articles)
   ↓
2. PRE-FILTER (remove excluded keywords, check priority/category)
   ↓
3. AI ANALYSIS (analyze each article for each client)
   ↓
4. FILTER BY SCORE (keep only articles with AI score >= 50)
   ↓
5. AI SUMMARIZE (generate personalized summary per client)
   ↓
6. AI DIGEST (generate executive summary for advisor)
   ↓
7. SEND EMAIL (one email to advisor with everything)
```

---

## Step-by-Step: What Happens When You Click the Button

### Step 1: Fetch News from RSS Feeds
**File:** `newsFetcher.js`

Fetches ~30 articles from:
- CNBC Markets (10 articles)
- Bloomberg Markets (10 articles)
- SEC Press Releases (10 articles)
- Financial Times (10 articles - currently broken, 404 error)

For each article:
- **Auto-categorize**: `market` or `regulatory` based on source
- **Auto-prioritize**: Scans title/summary for keywords:
  - **High**: breaking, alert, urgent, crisis, crash, fed, rate cut, collapse
  - **Medium**: report, announce, sec, regulation, policy, trillion, billion
  - **Low**: everything else
- **Extract tags**: Now includes 14 categories with BROAD keywords:
  - Stock, bond, real estate, tech, energy, finance, crypto, ESG
  - Regulation, economic, private equity, healthcare, consumer, global

**Example:**
```
Article: "Fed Governor Miran wants a half-point cut"
→ Priority: HIGH (contains "fed")
→ Tags: ['economic', 'finance', 'regulation']
→ Category: market
```

---

### Step 2: Save to Database
**Table:** `news_articles`

Articles are saved with duplicate prevention (unique URL constraint).

**You mentioned "nothing got saved"** - this happens when:
- All 30 articles already exist (fetched in previous run)
- RSS feeds return same articles
- Solution: RSS feeds update slowly, run again in a few hours for fresh articles

---

### Step 3: Match Articles to Clients (Pre-Filter)
**File:** `alertMatcher.js` → Lines 51-88

**Query:** Gets all clients from database with their `alert_configs`

**Pre-Filter Logic** (VERY loose to let AI do heavy lifting):
```javascript
For each article:
  ✅ NOT in excluded_keywords list
  ✅ Priority >= client's threshold (low/medium/high)
  ✅ Category in client's enabled categories
  ❌ NO KEYWORD MATCHING HERE (let AI decide!)
```

**Why no keyword matching?**
Because you wanted broad relevance! For example:
- Client has keyword: `agritech`
- Article: "Federal agriculture policy changes"
- Old system: ❌ No match (doesn't contain "agritech")
- New system: ✅ Passes to AI for analysis

**Result:** If client has `priority_threshold: low` and `categories: [market, regulatory]`, basically ALL articles pass to AI.

---

### Step 4: AI Analyzes Each Article for Each Client
**File:** `aiAnalysisService.js` → `analyzeArticleRelevance()`

**THE BIG ONE** - This is where the magic happens!

For EACH client, for EACH article (up to 15 per client):

**AI Prompt Sent to GPT-4 Mini:**
```
You are a wealth management advisor analyzing news relevance for a high-net-worth client.

CLIENT PROFILE:
- Name: Richard Whitmore
- Net Worth: $25,000,000
- Investment Interests: real estate, tech, ESG
- Risk Tolerance: Moderate
- Portfolio Focus: market, regulatory
- Age: 58
- Occupation: Real Estate Developer

ARTICLE:
Title: "Big banks like JPMorgan Chase and Goldman Sachs are..."
Summary: "Major US banks report Q4 earnings..."
Source: CNBC
Category: market

TASK:
Analyze how relevant this article is to this client's financial interests and portfolio.

IMPORTANT: Consider BOTH direct and indirect relevance:
- Direct: Article explicitly mentions client's interests
- Indirect: Article affects client's interests indirectly
  (e.g., "federal agriculture policy changes" affects agritech investor,
   "banking regulations" affect fintech investor,
   "interest rate changes" affect real estate investor)

Think broadly about:
1. How this news could impact their portfolio or investments
2. Regulatory/policy changes that affect their industry
3. Market trends that influence their holdings
4. Economic conditions affecting their wealth strategy

Be generous with relevance scores for indirect but meaningful connections.

Respond in JSON:
{
  "relevance_score": 0-100,
  "reasoning": "why this matters",
  "key_insights": "what the client should know",
  "action_items": "recommended actions"
}
```

**AI Response Example:**
```json
{
  "relevance_score": 75,
  "reasoning": "As a real estate developer with $25M net worth, changes in banking credit conditions directly affect Richard's ability to finance new projects. JPMorgan and Goldman are major commercial real estate lenders.",
  "key_insights": "Tightening credit from major banks may increase financing costs for new developments. Consider locking in current loan rates or exploring alternative lenders.",
  "action_items": "Schedule meeting to review current debt structure and refinancing opportunities before rates potentially rise."
}
```

**Context Used by AI:**
- ✅ Client's net worth ($25M = high-value client)
- ✅ Investment keywords (real estate, tech, ESG)
- ✅ Age (58 = near retirement, risk-averse)
- ✅ Occupation (Real Estate Developer = industry expertise)
- ✅ Risk tolerance (Moderate)
- ✅ Article content (title + summary)
- ✅ Article source (CNBC = reputable)
- ✅ Article category (market vs regulatory)

**Cost:** ~$0.001 per article analysis (GPT-4 Mini is cheap)

---

### Step 5: Filter by AI Score
**File:** `alertMatcher.js` → Line 97

```javascript
const relevantArticles = analyzedArticles.filter(a => a.ai_relevance_score >= 50);
```

**Threshold: 50/100**
- Score < 50: ❌ Filtered out (not relevant enough)
- Score >= 50: ✅ Included in email

**Why 50?**
- Lower than 50 = barely relevant or false positive
- 50-70 = indirectly relevant (Fed policy → real estate)
- 70-90 = directly relevant (real estate article → real estate investor)
- 90-100 = critical (urgent news about client's exact holdings)

---

### Step 6: AI Generates Personalized Client Summary
**File:** `aiAnalysisService.js` → `generateClientSummary()`

Once we know which articles are relevant for a client, AI creates a **personalized 3-4 sentence summary**:

**AI Prompt:**
```
You are a wealth management advisor preparing a personalized news digest for your client.

CLIENT: Richard Whitmore
Net Worth: $25,000,000
Interests: real estate, tech, ESG

ARTICLES (5 matched):
1. [HIGH] Big banks report earnings...
2. [MEDIUM] Fed signals rate policy...
3. [MEDIUM] Commercial real estate trends...
... (all 5 articles)

TASK:
Write a concise summary (3-4 sentences) that:
1. Highlights the most important developments for THIS specific client
2. Explains why these articles matter to their portfolio/interests
3. Suggests any high-level considerations or opportunities

Write in a professional but conversational tone.
```

**AI Response Example:**
```
"Richard, this week's market activity presents several notable developments for your real estate portfolio.
The major banks' earnings reports signal continued strength in commercial lending, which should support
your development projects. However, the Fed's latest commentary suggests potential rate adjustments in Q2
that could impact financing costs. Consider reviewing your debt structure and exploring fixed-rate options
before any policy shifts materialize."
```

**Context Used:**
- ✅ Client name & net worth
- ✅ Client interests
- ✅ ALL matched articles (not just one)
- ✅ Article priorities (emphasizes HIGH priority)
- ✅ Connections between articles

---

### Step 7: AI Generates Advisor Executive Digest
**File:** `aiAnalysisService.js` → `generateAdvisorDigest()`

Finally, AI creates a **single executive summary for YOU** covering all clients:

**AI Prompt:**
```
You are a wealth management advisor reviewing today's news alerts for your clients.

CLIENT ALERT SUMMARY:
Richard Whitmore: 5 alerts (2 high priority)
Margaret Thompson: 3 alerts (1 high priority)
Harrison Chen: 7 alerts (3 high priority)

TOP ARTICLES TODAY:
1. [HIGH] Big banks report Q4 earnings...
2. [HIGH] Fed signals potential rate cuts...
3. [MEDIUM] SEC proposes new ESG rules...
... (top 10 articles)

TASK:
Write a brief executive summary (4-5 sentences) that:
1. Highlights the key market themes/events from today's news
2. Notes which clients are most affected and why
3. Suggests any immediate actions or discussions needed
4. Maintains a professional advisory tone

This is for your own review to prepare for client conversations.
```

**AI Response Example:**
```
"Today's market developments center around banking sector strength and evolving Fed policy.
Major banks' strong Q4 earnings suggest healthy credit conditions, though Fed Governor Miran's
rate cut commentary introduces uncertainty for borrowers. Your real estate-focused clients
(Richard, Margaret) are most exposed to these dynamics given their leverage and development
timelines. Consider proactive outreach this week to discuss debt positioning, particularly
for Richard's commercial projects and Margaret's REIT holdings. The new SEC ESG disclosure
rules also warrant a conversation with Margaret given her impact investing focus."
```

**Context Used:**
- ✅ All clients with alerts
- ✅ All articles across all clients
- ✅ Priority levels
- ✅ Client profiles
- ✅ Connections between news & client interests

---

### Step 8: Send ONE Email to Advisor
**File:** `emailService.js` → `generateAdvisorDigestEmail()`

One beautiful HTML email sent to: `skjetly094@gmail.com`

**Email Structure:**
```
┌────────────────────────────────────┐
│ 📊 Client News Alerts Digest       │
│ Friday, October 17, 2025           │
├────────────────────────────────────┤
│ Stats: 3 clients | 15 alerts | 5 high │
├────────────────────────────────────┤
│                                     │
│ 🤖 AI EXECUTIVE SUMMARY            │
│ [4-5 sentence digest from AI]      │
│                                     │
├────────────────────────────────────┤
│ 👤 Richard Whitmore (5 alerts)     │
│                                     │
│ 🤖 AI PERSONALIZED SUMMARY         │
│ [3-4 sentences specific to Richard]│
│                                     │
│ ┌─────────────────────────────┐   │
│ │ HIGH | Article Title         │   │
│ │                               │   │
│ │ 🤖 AI Relevance: 75/100      │   │
│ │ Why this matters...          │   │
│ │                               │   │
│ │ Summary text...              │   │
│ │ Source: CNBC | Read More →   │   │
│ └─────────────────────────────┘   │
│                                     │
│ [4 more articles...]                │
│                                     │
├────────────────────────────────────┤
│ 👤 Margaret Thompson (3 alerts)    │
│ [Same format...]                    │
└────────────────────────────────────┘
```

---

## Summary: What AI Does

| **Step** | **AI Task** | **Context Used** | **Output** |
|----------|-------------|------------------|------------|
| **Relevance Analysis** | Score each article 0-100 for each client | Client profile (net worth, interests, age, occupation) + Article content | Relevance score + reasoning + key insights |
| **Client Summary** | Summarize all matched articles for one client | Client profile + all their matched articles | 3-4 sentence personalized summary |
| **Advisor Digest** | Summarize all alerts across all clients | All clients + all articles + priorities | 4-5 sentence executive summary |

---

## Why This Approach?

### Old Way (Keyword Matching Only):
```
Client keywords: ["agritech", "farming"]
Article: "Federal agriculture subsidies increase"
Result: ❌ No match (doesn't contain "agritech")
```

### New Way (AI Analysis):
```
Client keywords: ["agritech", "farming"]
Client occupation: "AgriTech Startup Founder"
Article: "Federal agriculture subsidies increase"

AI Reasoning: "Federal ag subsidies directly impact agritech startups
by increasing farmers' purchasing power for technology solutions. This
client's company could see increased demand from better-capitalized farmers."

AI Score: 78/100 ✅ MATCH
```

---

## Cost Breakdown

**Per Fetch (30 articles, 3 clients):**
- Pre-filter: Free (just checking keywords/priority)
- AI Analysis: 45 API calls (15 articles × 3 clients) = ~$0.05
- AI Client Summaries: 3 calls = ~$0.003
- AI Advisor Digest: 1 call = ~$0.001
- **Total: ~$0.054 per fetch**

**Monthly (daily fetches):**
- 30 days × $0.054 = ~$1.62/month

**Very affordable for the intelligence you get!**

---

## Current Settings

**Relevance Threshold:** 50/100 (can adjust in alertMatcher.js line 97)
**Articles per Client:** Up to 15 analyzed (can adjust in alertMatcher.js line 90)
**Pre-Filter:** VERY loose - only excludes keywords, checks priority/category
**Tags:** 14 categories with broad keywords for better matching

---

## Why Nothing Saved Recently?

RSS feeds return the same articles until they publish new content. The system correctly detects duplicates:
```
⏭️ Article already exists: Chinese robotaxi company...
⏭️ Article already exists: Fed Governor Miran...
```

**Solution:** Wait a few hours and run again. RSS feeds update throughout the day.

---

**Questions?** Check the code files mentioned or run the fetch button to see it in action!
