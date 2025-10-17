import OpenAI from 'openai';

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Score relevance of a news article for a specific client
   * @param {Object} article - News article
   * @param {Object} client - Client with profile
   * @returns {Promise<Object>} Relevance score and analysis
   */
  async scoreRelevance(article, client) {
    try {
      const profile = typeof client.profile === 'string'
        ? JSON.parse(client.profile)
        : client.profile;

      const prompt = `You are a financial advisor assistant analyzing news relevance for wealth management clients.

CLIENT PROFILE:
- Name: ${client.name}
- AUM: $${(client.aum / 1000000).toFixed(1)}M
- Holdings: ${profile.holdings?.join(', ') || 'N/A'}
- Interests: ${profile.interests?.join(', ') || 'N/A'}
- Risk Tolerance: ${profile.riskTolerance || 'N/A'}
- Investment Style: ${profile.investmentStyle || 'N/A'}

NEWS ARTICLE:
Title: ${article.title}
Summary: ${article.summary}
Source: ${article.source}

TASK:
Analyze this article's relevance to the client. Provide:
1. Relevance Score (0.0 to 1.0)
2. Priority Level (high/medium/low)
3. Category (Market News/Regulatory/Economic Policy/Investment Trends/Alternative Investments)
4. Brief Reason (2-3 sentences explaining why this matters to the client)
5. Key Tags (3-5 relevant keywords)

Respond in JSON format:
{
  "score": 0.0-1.0,
  "priority": "high|medium|low",
  "category": "category name",
  "reason": "explanation",
  "tags": ["tag1", "tag2", "tag3"]
}`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // Using GPT-4o-mini for cost efficiency
        messages: [
          {
            role: 'system',
            content: 'You are an expert financial advisor assistant. Respond only with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      });

      const analysis = JSON.parse(completion.choices[0].message.content);

      return {
        relevanceScore: parseFloat(analysis.score),
        priority: analysis.priority,
        category: analysis.category,
        reason: analysis.reason,
        tags: analysis.tags
      };
    } catch (error) {
      console.error('AI scoring error:', error.message);
      // Return default values on error
      return {
        relevanceScore: 0.5,
        priority: 'medium',
        category: 'Market News',
        reason: 'Unable to analyze relevance automatically.',
        tags: ['Financial', 'Market']
      };
    }
  }

  /**
   * Batch score multiple articles for a client
   * @param {Array} articles - Array of articles
   * @param {Object} client - Client object
   * @returns {Promise<Array>} Articles with scores
   */
  async scoreMultipleArticles(articles, client) {
    const scoredArticles = [];

    for (const article of articles) {
      const analysis = await this.scoreRelevance(article, client);
      scoredArticles.push({
        ...article,
        ...analysis
      });

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Sort by relevance score descending
    return scoredArticles.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Filter articles by minimum relevance threshold
   * @param {Array} scoredArticles - Articles with scores
   * @param {number} threshold - Minimum score (default 0.6)
   * @returns {Array} Filtered articles
   */
  filterByRelevance(scoredArticles, threshold = 0.6) {
    return scoredArticles.filter(article => article.relevanceScore >= threshold);
  }
}

export default new AIService();
