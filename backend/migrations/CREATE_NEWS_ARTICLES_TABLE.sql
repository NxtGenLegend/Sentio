-- ============================================
-- CREATE NEWS_ARTICLES TABLE
-- ============================================
-- This table stores fetched news articles from RSS feeds
-- before they are matched with client preferences
-- ============================================

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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_news_articles_published ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_articles_priority ON news_articles(priority);
CREATE INDEX IF NOT EXISTS idx_news_articles_created ON news_articles(created_at DESC);

-- Verify table creation
SELECT 'news_articles table created successfully!' as status;

-- Display table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'news_articles'
ORDER BY ordinal_position;
