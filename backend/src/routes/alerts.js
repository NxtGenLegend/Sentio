import express from 'express';
import { fetchAndSaveNews } from '../services/newsFetcher.js';
import { matchArticlesWithClientAlerts } from '../services/alertMatcher.js';

const router = express.Router();

/**
 * POST /api/alerts/fetch-and-send
 * Fetch news from RSS feeds, analyze with AI, and send digest email to advisor
 */
router.post('/fetch-and-send', async (req, res) => {
  try {
    console.log('🚀 Starting AI-powered news fetch and alert process...');

    // Step 1: Fetch news from RSS feeds
    const fetchResult = await fetchAndSaveNews();

    if (!fetchResult.success) {
      return res.status(500).json({
        success: false,
        error: fetchResult.error
      });
    }

    // Step 2: AI-powered matching and advisor email
    const matchResult = await matchArticlesWithClientAlerts(fetchResult.articles);

    res.json({
      success: true,
      articlesFetched: fetchResult.totalFetched,
      articlesSaved: fetchResult.totalSaved,
      clientsWithAlerts: matchResult.clientAlerts.length,
      totalAlerts: matchResult.totalAlerts || 0,
      advisorEmailSent: matchResult.emailSent,
      aiDigestGenerated: !!matchResult.aiDigest,
      clientSummaries: matchResult.clientAlerts.map(ca => ({
        client: `${ca.client.first_name} ${ca.client.last_name}`,
        alertCount: ca.articles.length,
        highPriority: ca.articles.filter(a => a.priority === 'high').length
      }))
    });

  } catch (error) {
    console.error('❌ Error in fetch-and-send:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
