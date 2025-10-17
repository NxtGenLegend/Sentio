import { supabase } from '../config/supabase.js';
import { sendEmail, generateAdvisorDigestEmail } from './emailService.js';
import {
  batchAnalyzeArticles,
  generateClientSummary,
  generateAdvisorDigest
} from './aiAnalysisService.js';

// Advisor email - update this with your actual email
const ADVISOR_EMAIL = 'skjetly094@gmail.com'; // TODO: Move to .env

/**
 * Match fetched articles with client alert preferences using AI
 * and send a digest email to the advisor
 */
export async function matchArticlesWithClientAlerts(articles) {
  console.log(`🔍 Matching ${articles.length} articles with client preferences...`);

  // Get all clients with alert configs
  const { data: clients, error } = await supabase
    .from('clients')
    .select(`
      id,
      first_name,
      last_name,
      primary_email,
      net_worth,
      age,
      occupation,
      alert_configs (
        keywords,
        excluded_keywords,
        priority_threshold,
        email_notifications,
        categories_enabled
      )
    `);

  if (error) {
    console.error('Error fetching clients:', error);
    return { clientAlerts: [], emailSent: false };
  }

  if (!clients || clients.length === 0) {
    console.log('⚠️  No clients found in database');
    return { clientAlerts: [], emailSent: false };
  }

  console.log(`📋 Found ${clients.length} total clients`);

  // Filter to only clients with alert configs
  const clientsWithConfigs = clients.filter(c => c.alert_configs && c.alert_configs.length > 0);
  console.log(`📋 ${clientsWithConfigs.length} clients have alert configurations`);

  if (clientsWithConfigs.length === 0) {
    console.log('⚠️  No clients have alert configurations set up');
    return { clientAlerts: [], emailSent: false };
  }

  const clientAlerts = [];

  for (const client of clientsWithConfigs) {
    const config = client.alert_configs[0];
    if (!config) {
      console.log(`⚠️  ${client.first_name} ${client.last_name} has no config (should not happen)`);
      continue;
    }

    console.log(`\n👤 Processing ${client.first_name} ${client.last_name}`);
    console.log(`   Keywords: ${config.keywords?.join(', ') || 'none'}`);
    console.log(`   Priority threshold: ${config.priority_threshold}`);
    console.log(`   Categories: ${config.categories_enabled?.join(', ') || 'none'}`);

    // Step 1: Basic filtering (pre-filter to reduce AI costs)
    // For MVP, we'll be VERY loose here and let AI do the heavy lifting
    // TESTING MODE: Temporarily bypass filters to ensure articles pass through
    const preFilteredArticles = articles.filter(article => {
      // Check if article contains excluded keywords (hard filter)
      const hasExcluded = config.excluded_keywords?.some(keyword =>
        article.title.toLowerCase().includes(keyword.toLowerCase()) ||
        article.summary.toLowerCase().includes(keyword.toLowerCase())
      );

      // TESTING: Skip priority and category filters for now
      return !hasExcluded;
    });

    if (preFilteredArticles.length === 0) {
      console.log(`⏭️  No articles passed pre-filter for ${client.first_name} ${client.last_name}`);
      continue;
    }

    console.log(`📊 Found ${preFilteredArticles.length} articles for AI analysis for ${client.first_name} ${client.last_name}`);

    // Step 2: AI-powered relevance analysis
    const clientProfile = {
      net_worth: client.net_worth,
      age: client.age,
      occupation: client.occupation,
      keywords: config.keywords,
      risk_tolerance: 'moderate', // TODO: Add to client schema
      categories_enabled: config.categories_enabled
    };

    const analyzedArticles = await batchAnalyzeArticles(
      preFilteredArticles.slice(0, 15), // Increased from 10 to 15 for more coverage
      client,
      clientProfile
    );

    // Step 3: Filter by AI relevance score (keep articles with score >= 10)
    // TESTING: Lowered to 10 for testing to ensure articles pass through
    const relevantArticles = analyzedArticles.filter(a => a.ai_relevance_score >= 10);

    if (relevantArticles.length === 0) {
      console.log(`⏭️  No AI-relevant articles for ${client.first_name} ${client.last_name} (all scored < 10)`);
      continue;
    }

    console.log(`🤖 ${relevantArticles.length} articles passed AI relevance threshold (>= 10) for ${client.first_name} ${client.last_name}`);

    // Step 4: Save to news_alerts table
    for (const article of relevantArticles) {
      await supabase.from('news_alerts').insert({
        client_id: client.id,
        title: article.title,
        summary: article.summary,
        url: article.url,
        source: article.source,
        published_at: article.published_at,
        priority: article.priority,
        category: article.category,
        tags: article.tags
      });
    }

    // Step 5: Generate AI summary for this client
    const aiSummary = await generateClientSummary(client, relevantArticles, clientProfile);

    clientAlerts.push({
      client: {
        first_name: client.first_name,
        last_name: client.last_name,
        email: client.primary_email
      },
      articles: relevantArticles,
      aiSummary
    });
  }

  if (clientAlerts.length === 0) {
    console.log('❌ No relevant alerts found for any clients');
    return { clientAlerts: [], emailSent: false };
  }

  // Step 6: Generate overall advisor digest using AI
  console.log('🤖 Generating AI advisor digest...');
  const aiDigest = await generateAdvisorDigest(clientAlerts);

  // Step 7: Send single digest email to advisor
  console.log(`📧 Sending advisor digest email to ${ADVISOR_EMAIL}...`);

  const totalAlerts = clientAlerts.reduce((sum, ca) => sum + ca.articles.length, 0);
  const emailHtml = generateAdvisorDigestEmail(clientAlerts, aiDigest);

  const result = await sendEmail(
    ADVISOR_EMAIL,
    `📊 Client News Digest: ${clientAlerts.length} client(s), ${totalAlerts} alerts`,
    emailHtml
  );

  if (result.success) {
    console.log(`✅ Advisor digest email sent successfully`);
  } else {
    console.error(`❌ Failed to send advisor digest: ${result.error}`);
  }

  return {
    clientAlerts,
    totalAlerts,
    emailSent: result.success,
    aiDigest
  };
}
