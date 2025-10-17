import express from 'express';
import newsService from '../services/newsService.js';

const router = express.Router();

/**
 * GET /api/news/alerts
 * Get all news alerts with optional filtering
 */
router.get('/alerts', async (req, res) => {
  try {
    const { priority, category, clientId, limit } = req.query;

    const alerts = newsService.getAllNews({
      priority,
      category,
      clientId: clientId ? parseInt(clientId) : undefined,
      limit: limit ? parseInt(limit) : 50
    });

    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    console.error('Error fetching news alerts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/news/client/:clientId
 * Get news alerts for a specific client
 */
router.get('/client/:clientId', async (req, res) => {
  try {
    const clientId = parseInt(req.params.clientId);
    const { priority, category, limit, onlyUnread } = req.query;

    const alerts = newsService.getClientNews(clientId, {
      priority,
      category,
      limit: limit ? parseInt(limit) : 20,
      onlyUnread: onlyUnread === 'true'
    });

    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    console.error('Error fetching client news:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/news/fetch/:clientId
 * Manually trigger news fetch for a specific client
 */
router.post('/fetch/:clientId', async (req, res) => {
  try {
    const clientId = parseInt(req.params.clientId);
    const articles = await newsService.fetchNewsForClient(clientId);

    res.json({
      success: true,
      message: `Fetched ${articles.length} new articles`,
      count: articles.length,
      data: articles
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/news/fetch-all
 * Manually trigger news fetch for all clients
 */
router.post('/fetch-all', async (req, res) => {
  try {
    const results = await newsService.fetchNewsForAllClients();

    res.json({
      success: true,
      message: 'News fetch completed',
      results
    });
  } catch (error) {
    console.error('Error fetching all news:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/news/read/:alertId
 * Mark a news alert as read
 */
router.put('/read/:alertId', async (req, res) => {
  try {
    const alertId = parseInt(req.params.alertId);
    newsService.markAsRead(alertId);

    res.json({
      success: true,
      message: 'Alert marked as read'
    });
  } catch (error) {
    console.error('Error marking alert as read:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/news/config/:clientId
 * Get alert configuration for a client
 */
router.get('/config/:clientId', async (req, res) => {
  try {
    const clientId = parseInt(req.params.clientId);
    const config = newsService.getAlertConfig(clientId);

    res.json({
      success: true,
      data: config || {
        clientId,
        keywords: [],
        categories: [],
        minPriority: 'low',
        frequency: 'realtime',
        emailEnabled: true
      }
    });
  } catch (error) {
    console.error('Error fetching alert config:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/news/config/:clientId
 * Update alert configuration for a client
 */
router.post('/config/:clientId', async (req, res) => {
  try {
    const clientId = parseInt(req.params.clientId);
    const config = req.body;

    const updatedConfig = newsService.updateAlertConfig(clientId, config);

    res.json({
      success: true,
      message: 'Alert configuration updated',
      data: updatedConfig
    });
  } catch (error) {
    console.error('Error updating alert config:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/news/clients
 * Get list of all clients
 */
router.get('/clients', async (req, res) => {
  try {
    const clients = newsService.getClients();

    res.json({
      success: true,
      count: clients.length,
      data: clients
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
