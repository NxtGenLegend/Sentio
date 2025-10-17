import Parser from 'rss-parser';
import { supabase } from '../config/supabase.js';

const parser = new Parser();

// Financial news RSS feeds
const NEWS_FEEDS = [
  {
    url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html', // CNBC Markets
    category: 'market',
    source: 'CNBC'
  },
  {
    url: 'https://feeds.bloomberg.com/markets/news.rss', // Bloomberg Markets
    category: 'market',
    source: 'Bloomberg'
  },
  {
    url: 'https://www.sec.gov/news/pressreleases.rss', // SEC Press Releases
    category: 'regulatory',
    source: 'SEC'
  },
  {
    url: 'https://www.ft.com/rss/companies/financialservices', // Financial Times
    category: 'market',
    source: 'Financial Times'
  }
];

/**
 * Fetch news from RSS feeds
 */
export async function fetchNews() {
  console.log('📰 Starting news fetch...');
  const allArticles = [];

  for (const feed of NEWS_FEEDS) {
    try {
      console.log(`Fetching from ${feed.source}...`);
      const feedData = await parser.parseURL(feed.url);

      const articles = feedData.items.slice(0, 10).map(item => ({
        title: item.title || 'Untitled',
        summary: item.contentSnippet || item.content || 'No summary available',
        url: item.link,
        source: feed.source,
        published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        category: feed.category,
        priority: determinePriority(item.title, item.contentSnippet),
        tags: extractTags(item.title, item.contentSnippet)
      }));

      allArticles.push(...articles);
      console.log(`✅ Fetched ${articles.length} articles from ${feed.source}`);
    } catch (error) {
      console.error(`❌ Error fetching from ${feed.source}:`, error.message);
    }
  }

  console.log(`📊 Total articles fetched: ${allArticles.length}`);
  return allArticles;
}

/**
 * Determine priority based on content
 */
function determinePriority(title = '', content = '') {
  const text = `${title} ${content}`.toLowerCase();

  // High priority keywords - market moving events
  const highPriorityKeywords = [
    'breaking', 'alert', 'urgent', 'major', 'crisis',
    'crash', 'surge', 'plunge', 'record', 'historic',
    'fed', 'rate cut', 'rate hike', 'emergency', 'collapse'
  ];

  // Medium priority keywords - important updates
  const mediumPriorityKeywords = [
    'report', 'announce', 'release', 'update', 'change',
    'new', 'increase', 'decrease', 'growth', 'decline',
    'sec', 'regulation', 'policy', 'trillion', 'billion'
  ];

  if (highPriorityKeywords.some(keyword => text.includes(keyword))) {
    return 'high';
  }

  if (mediumPriorityKeywords.some(keyword => text.includes(keyword))) {
    return 'medium';
  }

  return 'low';
}

/**
 * Extract relevant tags from content - BROAD SCOPE for better matching
 */
function extractTags(title = '', content = '') {
  const text = `${title} ${content}`.toLowerCase();
  const tags = [];

  const tagKeywords = {
    'stock': ['stock', 'equity', 'equities', 'shares', 'market', 'trading', 'investor'],
    'bond': ['bond', 'treasury', 'yield', 'debt', 'fixed income'],
    'real estate': ['real estate', 'property', 'housing', 'reit', 'commercial', 'residential'],
    'tech': ['tech', 'technology', 'software', 'ai', 'artificial intelligence', 'startup', 'innovation', 'digital'],
    'energy': ['energy', 'oil', 'gas', 'solar', 'renewable', 'power', 'utilities'],
    'finance': ['bank', 'banking', 'financial', 'credit', 'lending', 'jpmorgan', 'goldman', 'wells fargo', 'citibank', 'fintech'],
    'crypto': ['crypto', 'cryptocurrency', 'bitcoin', 'blockchain', 'ethereum', 'binance', 'digital asset'],
    'esg': ['esg', 'sustainable', 'sustainability', 'green', 'climate', 'environmental', 'social', 'governance'],
    'regulation': ['sec', 'regulatory', 'regulation', 'compliance', 'policy', 'law', 'rule'],
    'economic': ['fed', 'federal reserve', 'interest rate', 'inflation', 'gdp', 'economy', 'economic'],
    'private equity': ['private equity', 'pe', 'venture capital', 'vc', 'buyout', 'acquisition'],
    'healthcare': ['healthcare', 'pharma', 'biotech', 'medical', 'drug'],
    'consumer': ['retail', 'consumer', 'e-commerce', 'amazon', 'walmart'],
    'global': ['china', 'europe', 'asia', 'global', 'international', 'trade']
  };

  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      tags.push(tag);
    }
  }

  return tags;
}

/**
 * Save articles to database
 * Returns array of newly inserted articles with their IDs
 */
export async function saveArticlesToDatabase(articles) {
  console.log(`💾 Saving ${articles.length} articles to database...`);
  const savedArticles = [];

  for (const article of articles) {
    try {
      // Check if article already exists (by URL)
      const { data: existing } = await supabase
        .from('news_articles')
        .select('id')
        .eq('url', article.url)
        .single();

      if (existing) {
        console.log(`⏭️  Article already exists: ${article.title.substring(0, 50)}...`);
        continue;
      }

      // Insert new article
      const { data, error } = await supabase
        .from('news_articles')
        .insert({
          title: article.title,
          summary: article.summary.substring(0, 500), // Limit summary length
          url: article.url,
          source: article.source,
          published_at: article.published_at,
          category: article.category,
          priority: article.priority,
          tags: article.tags
        })
        .select()
        .single();

      if (error) {
        console.error(`❌ Error saving article: ${error.message}`);
      } else {
        savedArticles.push(data);
        console.log(`✅ Saved: ${article.title.substring(0, 50)}...`);
      }
    } catch (error) {
      console.error(`❌ Error processing article: ${error.message}`);
    }
  }

  console.log(`✨ Successfully saved ${savedArticles.length} new articles`);
  return savedArticles;
}

/**
 * Main function to fetch and save news
 */
export async function fetchAndSaveNews() {
  try {
    const articles = await fetchNews();
    const savedArticles = await saveArticlesToDatabase(articles);
    return {
      success: true,
      totalFetched: articles.length,
      totalSaved: savedArticles.length,
      articles: savedArticles
    };
  } catch (error) {
    console.error('❌ Error in fetchAndSaveNews:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
