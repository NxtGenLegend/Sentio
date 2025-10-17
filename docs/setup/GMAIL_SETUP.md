# Gmail OAuth Setup Instructions

## Overview

Sentio uses Gmail API to send AI-powered news digest emails to advisors. This guide walks you through setting up Gmail OAuth authentication.

## Quick Setup (2 minutes)

### Step 1: Run the OAuth Setup Script

In your backend directory, run:

```bash
cd /mnt/c/Users/skjet/Coding/Sentio/backend
node scripts/setup-gmail-auth.js
```

### Step 2: Authorize in Browser

The script will output a URL that looks like:

```
https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=...
```

1. **Copy the entire URL** from your terminal
2. **Paste it in your browser** and press Enter
3. **Sign in** with your Google account (skjetly094@gmail.com)
4. **Grant permissions** when Google asks if you want to allow the app to send emails
5. **Copy the authorization code** that Google shows you (it will look like `4/0AanRRrt...`)

### Step 3: Paste the Code Back

Return to your terminal where the script is waiting and paste the authorization code.

The script will:
- Exchange the code for access/refresh tokens
- Save the tokens to `token.json`
- Confirm that setup is complete

### Step 4: Test Email Sending

Once the tokens are saved, test the email system:

```bash
curl -X POST http://localhost:3001/api/alerts/fetch-and-send
```

Or use the test script:

```bash
node scripts/setup-test-client-alerts.js
```

This should send a test email to **skjetly094@gmail.com**.

## What Gets Created

- `token.json` - Contains your OAuth access token and refresh token
- Tokens are stored securely and will auto-refresh when they expire

## Troubleshooting

### "credentials.json not found"
Make sure `credentials.json` exists in the backend root directory. It should contain your Google OAuth client credentials.

### "redirect_uri_mismatch"
Check that your Google Cloud Console OAuth app has `http://localhost` as an authorized redirect URI.

### "Access blocked: This app's request is invalid"
Your OAuth consent screen may need to be configured in Google Cloud Console. Make sure the app is set to "Testing" mode and your email is added as a test user.

## Security Note

- `credentials.json` contains your OAuth client ID/secret (not sensitive if the app is in testing mode)
- `token.json` contains access tokens - this IS sensitive and should never be committed to git
- Both files are already in `.gitignore`
