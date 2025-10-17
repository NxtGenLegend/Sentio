import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CREDENTIALS_PATH = path.join(__dirname, '../../credentials.json');

// Initialize Gmail API
const oauth2Client = new google.auth.OAuth2();
oauth2Client.setCredentials(JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8')));

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

/**
 * Send email via Gmail API
 */
export async function sendEmail(to, subject, htmlBody) {
  const message = [
    `To: ${to}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    '',
    htmlBody
  ].join('\n');

  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  try {
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate HTML email for advisor digest with AI-enhanced summaries
 */
export function generateAdvisorDigestEmail(clientAlerts, aiDigest) {
  const totalAlerts = clientAlerts.reduce((sum, ca) => sum + ca.articles.length, 0);
  const highPriorityCount = clientAlerts.reduce(
    (sum, ca) => sum + ca.articles.filter(a => a.priority === 'high').length,
    0
  );

  const clientSections = clientAlerts.map(({ client, articles, aiSummary }) => {
    const sortedArticles = articles.sort((a, b) =>
      (b.ai_relevance_score || 0) - (a.ai_relevance_score || 0)
    );

    const articlesHtml = sortedArticles.map(article => `
      <div style="margin-bottom: 15px; padding: 12px; background: #f9f9f9; border-radius: 6px; border-left: 3px solid ${
        article.priority === 'high' ? '#dc2626' :
        article.priority === 'medium' ? '#f59e0b' : '#10b981'
      };">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 6px;">
          <h4 style="margin: 0; color: #0A1929; font-size: 14px; flex: 1;">${article.title}</h4>
          <span style="font-size: 11px; font-weight: bold; padding: 2px 8px; border-radius: 12px; background: ${
            article.priority === 'high' ? '#fee2e2' :
            article.priority === 'medium' ? '#fef3c7' : '#d1fae5'
          }; color: ${
            article.priority === 'high' ? '#dc2626' :
            article.priority === 'medium' ? '#f59e0b' : '#10b981'
          }; white-space: nowrap; margin-left: 8px;">
            ${article.priority.toUpperCase()}
          </span>
        </div>
        ${article.ai_relevance_score ? `
          <div style="margin-bottom: 8px; padding: 6px 8px; background: #e0f2fe; border-radius: 4px;">
            <div style="font-size: 11px; color: #0369a1; font-weight: bold; margin-bottom: 3px;">
              🤖 AI Relevance: ${article.ai_relevance_score}/100
            </div>
            <div style="font-size: 11px; color: #075985;">
              ${article.ai_key_insights || article.ai_reasoning}
            </div>
          </div>
        ` : ''}
        <p style="margin: 0 0 8px; color: #666; font-size: 12px; line-height: 1.5;">
          ${article.summary.substring(0, 200)}${article.summary.length > 200 ? '...' : ''}
        </p>
        <div style="font-size: 11px; color: #999;">
          <strong>Source:</strong> ${article.source} |
          <a href="${article.url}" target="_blank" style="color: #0369a1; text-decoration: none;">Read Full Article →</a>
        </div>
      </div>
    `).join('');

    return `
      <div style="margin-bottom: 35px; padding: 20px; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
        <h2 style="color: #0A1929; margin: 0 0 10px; font-size: 18px;">
          ${client.first_name} ${client.last_name}
          <span style="font-size: 14px; color: #666; font-weight: normal;">
            (${articles.length} alert${articles.length !== 1 ? 's' : ''})
          </span>
        </h2>
        ${aiSummary ? `
          <div style="margin-bottom: 20px; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 6px; color: white;">
            <div style="font-size: 12px; font-weight: bold; margin-bottom: 8px; opacity: 0.9;">
              🤖 AI PERSONALIZED SUMMARY
            </div>
            <div style="font-size: 13px; line-height: 1.6;">
              ${aiSummary}
            </div>
          </div>
        ` : ''}
        ${articlesHtml}
      </div>
    `;
  }).join('');

  return `
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; background: #f3f4f6;">
        <div style="max-width: 800px; margin: 0 auto;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0A1929 0%, #1e3a5f 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0 0 10px; font-size: 28px; font-weight: 600;">
              📊 Client News Alerts Digest
            </h1>
            <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 14px;">
              ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <!-- Stats Bar -->
          <div style="background: white; padding: 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-around; text-align: center;">
            <div>
              <div style="font-size: 24px; font-weight: bold; color: #0A1929;">${clientAlerts.length}</div>
              <div style="font-size: 12px; color: #666;">Client${clientAlerts.length !== 1 ? 's' : ''}</div>
            </div>
            <div>
              <div style="font-size: 24px; font-weight: bold; color: #0A1929;">${totalAlerts}</div>
              <div style="font-size: 12px; color: #666;">Total Alerts</div>
            </div>
            <div>
              <div style="font-size: 24px; font-weight: bold; color: #dc2626;">${highPriorityCount}</div>
              <div style="font-size: 12px; color: #666;">High Priority</div>
            </div>
          </div>

          <!-- AI Executive Summary -->
          ${aiDigest ? `
            <div style="background: white; padding: 25px; border-bottom: 3px solid #667eea;">
              <h3 style="color: #0A1929; margin: 0 0 15px; font-size: 16px; display: flex; align-items: center;">
                <span style="font-size: 20px; margin-right: 8px;">🤖</span>
                AI Executive Summary
              </h3>
              <div style="font-size: 14px; color: #374151; line-height: 1.8;">
                ${aiDigest}
              </div>
            </div>
          ` : ''}

          <!-- Client Sections -->
          <div style="background: #fafafa; padding: 25px;">
            ${clientSections}
          </div>

          <!-- Footer -->
          <div style="background: #0A1929; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
            <p style="color: rgba(255,255,255,0.6); margin: 0; font-size: 12px;">
              Sentio Wealth Management | AI-Powered News Alerts
            </p>
            <p style="color: rgba(255,255,255,0.4); margin: 5px 0 0; font-size: 11px;">
              Delivered by Claude Code
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}
