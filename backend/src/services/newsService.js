import supabase from '../config/supabase.js';
import tavilyService from './tavilyService.js';
import aiService from './aiService.js';

class NewsService {
  /**
   * Fetch and score news for a specific client
   * @param {string} clientId - Client UUID
   * @returns {Promise<Array>} Processed news alerts
   */
  async fetchNewsForClient(clientId) {
    try {
      const { data: client, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error || !client) {
        throw new Error(`Client ${clientId} not found: ${error?.message}`);
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

      for (const article of relevantArticles) {
        // Check if article already exists for this client
        const { data: existing } = await supabase
          .from('news_alerts')
          .select('id')
          .eq('client_id', clientId)
          .eq('url', article.url)
          .single();

        if (!existing) {
          const { data: inserted, error: insertError } = await supabase
            .from('news_alerts')
            .insert({
              client_id: clientId,
              title: article.title,
              summary: article.summary,
              url: article.url,
              source: article.source,
              published_at: article.publishedAt,
              priority: article.priority,
              category: article.category,
              tags: article.tags,
              relevance_score: article.relevanceScore,
              relevance_reason: article.reason
            })
            .select()
            .single();

          if (!insertError && inserted) {
            savedArticles.push(inserted);
          }
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
   * Fetch news for all active clients
   * @returns {Promise<Object>} Results summary
   */
  async fetchNewsForAllClients() {
    const { data: clients, error } = await supabase
      .from('clients')
      .select('*')
      .eq('status', 'active');

    if (error) {
      throw new Error(`Failed to fetch clients: ${error.message}`);
    }

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
   * @param {string} clientId - Client UUID
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} News alerts
   */
  async getClientNews(clientId, filters = {}) {
    const { priority, category, limit = 20, onlyUnread = false } = filters;

    let query = supabase
      .from('news_alerts')
      .select('*')
      .eq('client_id', clientId);

    if (priority && priority !== 'all') {
      query = query.eq('priority', priority);
    }

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (onlyUnread) {
      query = query.eq('is_read', false);
    }

    query = query
      .order('published_at', { ascending: false })
      .limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching client news:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get news alerts for all clients (for the global news page)
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} News alerts with client info
   */
  async getAllNews(filters = {}) {
    const { priority, category, clientId, limit = 50 } = filters;

    let query = supabase
      .from('news_alerts')
      .select(`
        *,
        clients (
          id,
          name
        )
      `);

    if (clientId && clientId !== 'all') {
      query = query.eq('client_id', clientId);
    }

    if (priority && priority !== 'all') {
      query = query.eq('priority', priority);
    }

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    query = query
      .order('published_at', { ascending: false })
      .limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching all news:', error);
      return [];
    }

    // Transform data to include client name
    return (data || []).map(alert => ({
      ...alert,
      relevantClients: alert.clients ? [alert.clients.name] : []
    }));
  }

  /**
   * Mark news alert as read
   * @param {string} alertId - Alert UUID
   */
  async markAsRead(alertId) {
    const { error } = await supabase
      .from('news_alerts')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', alertId);

    if (error) {
      console.error('Error marking news as read:', error);
    }
  }

  /**
   * Get alert configuration for a client
   * @param {string} clientId - Client UUID
   * @returns {Promise<Object|null>} Alert configuration
   */
  async getAlertConfig(clientId) {
    const { data, error } = await supabase
      .from('alert_configs')
      .select('*')
      .eq('client_id', clientId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching alert config:', error);
    }

    return data || null;
  }

  /**
   * Update alert configuration for a client
   * @param {string} clientId - Client UUID
   * @param {Object} config - Configuration settings
   * @returns {Promise<Object>} Updated configuration
   */
  async updateAlertConfig(clientId, config) {
    const { keywords, categories, minPriority, frequency, emailEnabled, emailDigestTime } = config;

    const { data, error } = await supabase
      .from('alert_configs')
      .upsert({
        client_id: clientId,
        keywords: keywords || [],
        categories: categories || [],
        min_priority: minPriority || 'low',
        frequency: frequency || 'realtime',
        email_enabled: emailEnabled !== undefined ? emailEnabled : true,
        email_digest_time: emailDigestTime || '08:00:00',
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating alert config:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get clients list
   * @returns {Promise<Array>} List of clients
   */
  async getClients() {
    const { data, error } = await supabase
      .from('clients')
      .select('id, name, aum, client_since, status')
      .eq('status', 'active')
      .order('name');

    if (error) {
      console.error('Error fetching clients:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Clean up old news alerts (older than 30 days)
   */
  async cleanupOldAlerts() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { error, count } = await supabase
      .from('news_alerts')
      .delete()
      .lt('fetched_at', thirtyDaysAgo.toISOString());

    if (error) {
      console.error('Error cleaning up old alerts:', error);
      return 0;
    }

    console.log(`🧹 Cleaned up ${count || 0} old news alerts`);
    return count || 0;
  }
}

export default new NewsService();
