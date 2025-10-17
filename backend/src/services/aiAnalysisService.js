import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Analyze article relevance for a specific client using AI
 * Returns relevance score (0-100) and reasoning
 */
export async function analyzeArticleRelevance(article, client, clientProfile) {
  try {
    const prompt = `You are a wealth management advisor analyzing news relevance for a high-net-worth client.

CLIENT PROFILE:
- Name: ${client.first_name} ${client.last_name}
- Net Worth: $${clientProfile.net_worth?.toLocaleString() || 'N/A'}
- Investment Interests: ${clientProfile.keywords?.join(', ') || 'General market news'}
- Risk Tolerance: ${clientProfile.risk_tolerance || 'Moderate'}
- Portfolio Focus: ${clientProfile.categories_enabled?.join(', ') || 'Diversified'}
- Age: ${clientProfile.age || 'N/A'}
- Occupation: ${clientProfile.occupation || 'N/A'}

ARTICLE:
Title: ${article.title}
Summary: ${article.summary}
Source: ${article.source}
Category: ${article.category}

TASK:
Analyze how relevant this article is to this client's financial interests and portfolio.

IMPORTANT: Consider BOTH direct and indirect relevance:
- Direct: Article explicitly mentions client's interests (e.g., "tech stocks" for tech investor)
- Indirect: Article affects client's interests indirectly (e.g., "federal agriculture policy changes" affects agritech investor, "banking regulations" affect fintech investor, "interest rate changes" affect real estate investor)

Think broadly about:
1. How this news could impact their portfolio or investments
2. Regulatory/policy changes that affect their industry
3. Market trends that influence their holdings
4. Economic conditions affecting their wealth strategy

Be generous with relevance scores for indirect but meaningful connections.

Respond in JSON format:
{
  "relevance_score": <number 0-100>,
  "reasoning": "<brief explanation of direct OR indirect relevance>",
  "key_insights": "<1-2 sentence summary of what the client should know>",
  "action_items": "<optional: any recommended actions>"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    const analysis = JSON.parse(completion.choices[0].message.content);
    return analysis;
  } catch (error) {
    console.error('Error analyzing article relevance:', error);
    return {
      relevance_score: 50,
      reasoning: 'AI analysis unavailable - using keyword matching',
      key_insights: article.summary.substring(0, 150),
      action_items: ''
    };
  }
}

/**
 * Generate personalized summary of all matched articles for a client
 */
export async function generateClientSummary(client, matchedArticles, clientProfile) {
  try {
    const articlesText = matchedArticles.map((a, i) =>
      `${i + 1}. [${a.priority.toUpperCase()}] ${a.title}\n   ${a.summary}\n   Source: ${a.source}`
    ).join('\n\n');

    const prompt = `You are a wealth management advisor preparing a personalized news digest for your client.

CLIENT: ${client.first_name} ${client.last_name}
Net Worth: $${clientProfile.net_worth?.toLocaleString() || 'N/A'}
Interests: ${clientProfile.keywords?.join(', ') || 'General market news'}

ARTICLES (${matchedArticles.length} total):
${articlesText}

TASK:
Write a concise, personalized summary (3-4 sentences) that:
1. Highlights the most important developments for THIS specific client
2. Explains why these articles matter to their portfolio/interests
3. Suggests any high-level considerations or opportunities

Write in a professional but conversational tone, as if speaking directly to the client.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 200
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating client summary:', error);
    return `We found ${matchedArticles.length} news article(s) matching your interests in ${clientProfile.keywords?.join(', ') || 'market news'}. Please review the details below.`;
  }
}

/**
 * Generate overall advisor digest summarizing all client alerts
 */
export async function generateAdvisorDigest(clientAlerts) {
  try {
    const summaryText = clientAlerts.map(ca =>
      `${ca.client.first_name} ${ca.client.last_name}: ${ca.articles.length} alerts (${ca.articles.filter(a => a.priority === 'high').length} high priority)`
    ).join('\n');

    const allArticles = clientAlerts.flatMap(ca => ca.articles);
    const uniqueArticles = [...new Map(allArticles.map(a => [a.url, a])).values()];

    const topArticlesText = uniqueArticles
      .slice(0, 10)
      .map((a, i) => `${i + 1}. [${a.priority.toUpperCase()}] ${a.title}`)
      .join('\n');

    const prompt = `You are a wealth management advisor reviewing today's news alerts for your clients.

CLIENT ALERT SUMMARY:
${summaryText}

TOP ARTICLES TODAY:
${topArticlesText}

TASK:
Write a brief executive summary (4-5 sentences) that:
1. Highlights the key market themes/events from today's news
2. Notes which clients are most affected and why
3. Suggests any immediate actions or discussions needed
4. Maintains a professional advisory tone

This is for your own review to prepare for client conversations.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 250
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating advisor digest:', error);
    return `Found ${clientAlerts.length} client(s) with matching alerts. Total ${clientAlerts.reduce((sum, ca) => sum + ca.articles.length, 0)} articles matched across all clients.`;
  }
}

/**
 * Batch analyze multiple articles for a client
 * Returns articles with AI analysis included
 */
export async function batchAnalyzeArticles(articles, client, clientProfile) {
  console.log(`🤖 AI analyzing ${articles.length} articles for ${client.first_name} ${client.last_name}...`);

  const analyzedArticles = [];

  // Process in batches to avoid rate limits
  for (const article of articles) {
    const analysis = await analyzeArticleRelevance(article, client, clientProfile);

    analyzedArticles.push({
      ...article,
      ai_relevance_score: analysis.relevance_score,
      ai_reasoning: analysis.reasoning,
      ai_key_insights: analysis.key_insights,
      ai_action_items: analysis.action_items
    });

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Sort by AI relevance score
  analyzedArticles.sort((a, b) => b.ai_relevance_score - a.ai_relevance_score);

  console.log(`✅ AI analysis complete. Top score: ${analyzedArticles[0]?.ai_relevance_score || 0}`);

  return analyzedArticles;
}
