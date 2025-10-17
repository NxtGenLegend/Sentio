import cron from 'node-cron';
import newsService from '../services/newsService.js';

class NewsScheduler {
  constructor() {
    this.jobs = [];
  }

  /**
   * Start the news fetching cron job
   */
  start() {
    // Default: every 15 minutes
    const schedule = process.env.NEWS_FETCH_SCHEDULE || '*/15 * * * *';

    console.log(`📅 Scheduling news fetch job: ${schedule}`);

    const job = cron.schedule(schedule, async () => {
      console.log(`\n⏰ Cron job triggered at ${new Date().toLocaleString()}`);
      try {
        await newsService.fetchNewsForAllClients();
      } catch (error) {
        console.error('Error in scheduled news fetch:', error);
      }
    });

    this.jobs.push(job);

    // Also schedule cleanup job (daily at 2 AM)
    const cleanupJob = cron.schedule('0 2 * * *', () => {
      console.log(`\n🧹 Running cleanup job at ${new Date().toLocaleString()}`);
      try {
        newsService.cleanupOldAlerts();
      } catch (error) {
        console.error('Error in cleanup job:', error);
      }
    });

    this.jobs.push(cleanupJob);

    console.log('✅ Background jobs scheduled successfully');
  }

  /**
   * Stop all scheduled jobs
   */
  stop() {
    this.jobs.forEach(job => job.stop());
    console.log('Stopped all background jobs');
  }
}

export default new NewsScheduler();
