import fs from 'fs';
import readline from 'readline';
import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to credentials and token files
const CREDENTIALS_PATH = path.join(__dirname, '..', 'credentials.json');
const TOKEN_PATH = path.join(__dirname, '..', 'token.json');

// Gmail API scope
const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

/**
 * Create an OAuth2 client with the given credentials
 */
function authorize() {
  const content = fs.readFileSync(CREDENTIALS_PATH, 'utf8');
  const credentials = JSON.parse(content);
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Generate auth URL
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('\n📧 Gmail OAuth Setup\n');
  console.log('Please authorize this app by visiting this URL:');
  console.log('\n' + authUrl + '\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        console.error('❌ Error retrieving access token:', err);
        return;
      }
      oAuth2Client.setCredentials(token);

      // Store the token
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token, null, 2));
      console.log('\n✅ Token stored successfully to:', TOKEN_PATH);
      console.log('✅ Gmail authentication complete! You can now send emails.\n');
    });
  });
}

// Run the authorization
try {
  authorize();
} catch (error) {
  console.error('❌ Error during authorization:', error);
}
