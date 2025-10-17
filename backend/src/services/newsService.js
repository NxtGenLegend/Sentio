import db from '../config/database.js';
import tavilyService from './tavilyService.js';
import aiService from './aiService.js';

class NewsService {
  /**
   * Fetch and score news for a specific client
   * @param {number} clientId - Client ID
   * @returns {Promise<Array>} Processed news alerts
   */
  async fetchNewsForClient(clientId) {
    try {
      const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(clientId);
      if (!client) {
        throw new Error(`Client ${clientId} not found`);
      }

      console.log(`\n📰 Fetching news for ${client.name}...`);

      // Step 1: Search for news using Tavily
      const articles = await tavilyService.searchNewsForClient(client);
      console.log(`   Found ${articles.length} articles from Tavily`);

      if (articles.length === 0) {
        console.log(`   No articles found for ${client.name}`);
        return [];
      }

      // Step 2: Score relevance using AI
      console.log(`   Scoring relevance with AI...`);
      const scoredArticles = await aiService.scoreMultipleArticles(articles, client);

      // Step 3: Filter by relevance threshold
      const relevantArticles = aiService.filterByRelevance(scoredArticles, 0.5);
      console.log(`   ${relevantArticles.length} articles passed relevance threshold`);

      // Step 4: Check for duplicates and save to database
      const savedArticles = [];
      const insertStmt = db.prepare(`
        INSERT INTO news_alerts (
          client_id, title, summary, url, source, published_at,
          priority, category, tags, relevance_score, relevance_reason
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const article of relevantArticles) {
        // Check if article already exists for this client
        const existing = db.prepare(
          'SELECT id FROM news_alerts WHERE client_id = ? AND url = ?'
        ).get(clientId, article.url);

        if (!existing) {
          const result = insertStmt.run(
            clientId,
            article.title,
            article.summary,
            article.url,
            article.source,
            article.publishedAt,
            article.priority,
            article.category,
            JSON.stringify(article.tags),
            article.relevanceScore,
            article.reason
          );

          savedArticles.push({
            id: result.lastInsertRowid,
            ...article
          });
        }
      }

      console.log(`   ✅ Saved ${savedArticles.length} new articles for ${client.name}\n`);
      return savedArticles;
    } catch (error) {
      console.error(`Error fetching news for client ${clientId}:`, error.message);
      throw error;
    }
  }

  /**
   * Fetch news for all clients
   * @returns {Promise<Object>} Results summary
   */
  async fetchNewsForAllClients() {
    const clients = db.prepare('SELECT * FROM clients').all();
    const results = {
      total: clients.length,
      success: 0,
      failed: 0,
      articlesAdded: 0
    };

    console.log(`\n🔄 Starting news fetch for ${clients.length} clients...\n`);

    for (const client of clients) {
      try {
        const articles = await this.fetchNewsForClient(client.id);
        results.success++;
        results.articlesAdded += articles.length;
      } catch (error) {
        console.error(`Failed to fetch news for ${client.name}:`, error.message);
        results.failed++;
      }
    }

    console.log(`\n✅ News fetch complete!`);
    console.log(`   Clients processed: ${results.success}/${results.total}`);
    console.log(`   Total articles added: ${results.articlesAdded}\n`);

    return results;
  }

  /**
   * Get news alerts for a client
   * @param {number} clientId - Client ID
   * @param {Object} filters - Filter options
   * @returns {Array} News alerts
   */
  getClientNews(clientId, filters = {}) {
    const { priority, category, limit = 20, onlyUnread = false } = filters;

    let query = 'SELECT * FROM news_alerts WHERE client_id = ?';
    const params = [clientId];

    if (priority && priority !== 'all') {
      query += ' AND priority = ?';
      params.push(priority);
    }

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (onlyUnread) {
      query += ' AND is_read = 0';
    }

    query += ' ORDER BY published_at DESC LIMIT ?';
    params.push(limit);

    const alerts = db.prepare(query).all(...params);

    return alerts.map(alert => ({
      ...alert,
      tags: JSON.parse(alert.tags || '[]')
    }));
  }

  /**
   * Get news alerts for all clients (for the global news page)
   * @param {Object} filters - Filter options
   * @returns {Array} News alerts
   */
  getAllNews(filters = {}) {
    const { priority, category, clientId, limit = 50 } = filters;

    let query = 'SELECT n.*, c.name as client_name FROM news_alerts n LEFT JOIN clients c ON n.client_id = c.id WHERE 1=1';
    const params = [];

    if (clientId && clientId !== 'all') {
      query += ' AND n.client_id = ?';
      params.push(clientId);
    }

    if (priority && priority !== 'all') {
      query += ' AND n.priority = ?';
      params.push(priority);
    }

    if (category && category !== 'all') {
      query += ' AND n.category = ?';
      params.push(category);
    }

    query += ' ORDER BY n.published_at DESC LIMIT ?';
    params.push(limit);

    const alerts = db.prepare(query).all(...params);

    return alerts.map(alert => ({
      ...alert,
      tags: JSON.parse(alert.tags || '[]'),
      relevantClients: [alert.client_name]
    }));
  }

  /**
   * Mark news alert as read
   * @param {number} alertId - Alert ID
   */
  markAsRead(alertId) {
    db.prepare('UPDATE news_alerts SET is_read = 1 WHERE id = ?').run(alertId);
  }

  /**
   * Get alert configuration for a client
   * @param {number} clientId - Client ID
   * @returns {Object|null} Alert configuration
   */
  getAlertConfig(clientId) {
    const config = db.prepare('SELECT * FROM alert_configs WHERE client_id = ?').get(clientId);
    if (config) {
      return {
        ...config,
        keywords: config.keywords ? config.keywords.split(',') : [],
        categories: config.categories ? config.categories.split(',') : []
      };
    }
    return null;
  }

  /**
   * Update alert configuration for a client
   * @param {number} clientId - Client ID
   * @param {Object} config - Configuration settings
   * @returns {Object} Updated configuration
   */
  updateAlertConfig(clientId, config) {
    const { keywords, categories, minPriority, frequency, emailEnabled } = config;

    const stmt = db.prepare(`
      INSERT INTO alert_configs (client_id, keywords, categories, min_priority, frequency, email_enabled, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(client_id) DO UPDATE SET
        keywords = excluded.keywords,
        categories = excluded.categories,
        min_priority = excluded.min_priority,
        frequency = excluded.frequency,
        email_enabled = excluded.email_enabled,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(
      clientId,
      keywords?.join(',') || '',
      categories?.join(',') || '',
      minPriority || 'low',
      frequency || 'realtime',
      emailEnabled ? 1 : 0
    );

    return this.getAlertConfig(clientId);
  }

  /**
   * Get clients list
   * @returns {Array} List of clients
   */
  getClients() {
    return db.prepare('SELECT id, name, aum, client_since FROM clients').all();
  }

  /**
   * Clean up old news alerts (older than 30 days)
   */
  cleanupOldAlerts() {
    const result = db.prepare(`
      DELETE FROM news_alerts
      WHERE datetime(fetched_at) < datetime('now', '-30 days')
    `).run();

    console.log(`🧹 Cleaned up ${result.changes} old news alerts`);
    return result.changes;
  }
}

export default new NewsService();
