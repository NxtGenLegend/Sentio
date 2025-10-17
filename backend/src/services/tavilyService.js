import axios from 'axios';

class TavilyService {
  constructor() {
    this.apiKey = process.env.TAVILY_API_KEY;
    this.baseUrl = 'https://api.tavily.com';
  }

  /**
   * Search for news articles using Tavily
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Array of news articles
   */
  async searchNews(query, options = {}) {
    try {
      const {
        maxResults = 10,
        searchDepth = 'advanced',
        topic = 'news',
        days = 7,
        includeDomains = [],
        excludeDomains = []
      } = options;

      const response = await axios.post(
        `${this.baseUrl}/search`,
        {
          api_key: this.apiKey,
          query,
          search_depth: searchDepth,
          topic,
          days,
          max_results: maxResults,
          include_domains: includeDomains.length > 0 ? includeDomains : undefined,
          exclude_domains: excludeDomains.length > 0 ? excludeDomains : undefined,
          include_answer: false,
          include_raw_content: false
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.results || [];
    } catch (error) {
      console.error('Tavily search error:', error.response?.data || error.message);
      throw new Error(`Tavily search failed: ${error.message}`);
    }
  }

  /**
   * Build search query based on client profile
   * @param {Object} clientProfile - Client profile information
   * @returns {string} Optimized search query
   */
  buildSearchQuery(clientProfile) {
    const { holdings = [], interests = [], tags = [] } = clientProfile;

    // Combine relevant terms, prioritizing interests and holdings
    const searchTerms = [
      ...interests.slice(0, 3),
      ...holdings.slice(0, 2),
      ...tags.slice(0, 2)
    ];

    // Add financial/investment context
    const query = `${searchTerms.join(' OR ')} (investment OR market OR financial OR wealth management)`;

    return query;
  }

  /**
   * Search news for a specific client based on their profile
   * @param {Object} client - Client object with profile
   * @returns {Promise<Array>} Array of relevant news articles
   */
  async searchNewsForClient(client) {
    try {
      const profile = typeof client.profile === 'string'
        ? JSON.parse(client.profile)
        : client.profile;

      const query = this.buildSearchQuery(profile);

      console.log(`Searching news for ${client.name} with query: ${query}`);

      const articles = await this.searchNews(query, {
        maxResults: 15,
        searchDepth: 'advanced',
        topic: 'news',
        days: parseInt(process.env.NEWS_SEARCH_DAYS) || 7,
        includeDomains: [
          'wsj.com',
          'ft.com',
          'bloomberg.com',
          'reuters.com',
          'cnbc.com',
          'forbes.com',
          'barrons.com',
          'marketwatch.com'
        ]
      });

      return articles.map(article => ({
        title: article.title,
        summary: article.content || '',
        url: article.url,
        source: new URL(article.url).hostname.replace('www.', ''),
        publishedAt: article.published_date || new Date().toISOString(),
        rawScore: article.score
      }));
    } catch (error) {
      console.error(`Error searching news for client ${client.name}:`, error.message);
      return [];
    }
  }
}

export default new TavilyService();
