import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import newsRoutes from './routes/newsRoutes.js';
import alertsRouter from './routes/alerts.js';
import dashboardRouter from './routes/dashboard.js';
import clientsRouter from './routes/clients.js';
import newsScheduler from './jobs/newsScheduler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/news', newsRoutes);
app.use('/api/alerts', alertsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/clients', clientsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Sentio News Alerts API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      news: {
        getAllAlerts: 'GET /api/news/alerts',
        getClientAlerts: 'GET /api/news/client/:clientId',
        fetchForClient: 'POST /api/news/fetch/:clientId',
        fetchForAll: 'POST /api/news/fetch-all',
        markAsRead: 'PUT /api/news/read/:alertId',
        getConfig: 'GET /api/news/config/:clientId',
        updateConfig: 'POST /api/news/config/:clientId',
        getClients: 'GET /api/news/clients'
      },
      alerts: {
        fetchAndSend: 'POST /api/alerts/fetch-and-send'
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 Sentio News Alerts Backend`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`${'='.repeat(60)}\n`);

  // Check API keys
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  WARNING: OPENAI_API_KEY not set');
  } else {
    console.log('✅ OpenAI API key configured');
  }

  if (!process.env.TAVILY_API_KEY) {
    console.warn('⚠️  WARNING: TAVILY_API_KEY not set');
  } else {
    console.log('✅ Tavily API key configured');
  }

  // Start background jobs
  console.log('');
  newsScheduler.start();

  console.log('\n✨ Backend is ready to serve requests!\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down gracefully...');
  newsScheduler.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Shutting down gracefully...');
  newsScheduler.stop();
  process.exit(0);
});
