import db from './database.js';

console.log('Initializing database schema...');

async function init() {
  await db.initDatabase();

  // Clients table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      aum REAL,
      client_since TEXT,
      profile TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Alert configurations table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS alert_configs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      keywords TEXT,
      categories TEXT,
      min_priority TEXT DEFAULT 'low',
      frequency TEXT DEFAULT 'realtime',
      email_enabled INTEGER DEFAULT 1,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id),
      UNIQUE(client_id)
    )
  `);

  // News alerts table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS news_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER,
      title TEXT NOT NULL,
      summary TEXT,
      content TEXT,
      source TEXT,
      url TEXT,
      published_at TEXT,
      fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      priority TEXT DEFAULT 'medium',
      category TEXT,
      tags TEXT,
      relevance_score REAL,
      relevance_reason TEXT,
      is_read INTEGER DEFAULT 0,
      FOREIGN KEY (client_id) REFERENCES clients(id)
    )
  `);

  // Create indexes
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_news_client_priority ON news_alerts(client_id, priority)`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_news_published ON news_alerts(published_at DESC)`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_news_category ON news_alerts(category)`);

  console.log('Database schema initialized successfully!');

  // Insert sample clients if table is empty
  const clientCount = await db.getOne('SELECT COUNT(*) as count FROM clients');
  if (clientCount.count === 0) {
    console.log('Inserting sample clients...');

    const clients = [
      {
        name: 'Richard & Margaret Ashford',
        aum: 42500000,
        since: '2019',
        profile: JSON.stringify({
          holdings: ['Real Estate', 'Manhattan Properties', 'Upper East Side'],
          interests: ['Real Estate Investment', 'Luxury Properties'],
          riskTolerance: 'Moderate',
          investmentStyle: 'Value',
          tags: ['Real Estate', 'Manhattan', 'High Net Worth']
        })
      },
      {
        name: 'The Whitmore Family Trust',
        aum: 78200000,
        since: '2015',
        profile: JSON.stringify({
          holdings: ['ESG Funds', 'Private Equity', 'Sustainable Investments'],
          interests: ['ESG Investing', 'Impact Funds', 'Private Equity'],
          riskTolerance: 'Moderate-Conservative',
          investmentStyle: 'ESG',
          tags: ['ESG', 'Sustainable Investing', 'Private Equity', 'Family Trust']
        })
      },
      {
        name: 'Harrison Blackwell',
        aum: 31800000,
        since: '2021',
        profile: JSON.stringify({
          holdings: ['Tech Stocks', 'NASDAQ', 'Growth Equities'],
          interests: ['Technology Sector', 'AI', 'Cloud Computing'],
          riskTolerance: 'Aggressive',
          investmentStyle: 'Growth',
          tags: ['Technology', 'NASDAQ', 'Growth Investing']
        })
      },
      {
        name: 'Eleanor Cunningham',
        aum: 19500000,
        since: '2020',
        profile: JSON.stringify({
          holdings: ['Art Collection', 'Alternative Assets'],
          interests: ['Contemporary Art', 'Art Market', 'Alternative Investments'],
          riskTolerance: 'Moderate',
          investmentStyle: 'Alternative',
          tags: ['Art', 'Alternative Assets', 'Contemporary Art']
        })
      },
      {
        name: 'The Kensington Foundation',
        aum: 125000000,
        since: '2012',
        profile: JSON.stringify({
          holdings: ['ESG Funds', 'Impact Investments', 'Sustainable Portfolio'],
          interests: ['ESG', 'Philanthropy', 'Sustainable Investing', 'Impact'],
          riskTolerance: 'Conservative',
          investmentStyle: 'ESG',
          tags: ['ESG', 'Foundation', 'Impact Investing', 'Philanthropy']
        })
      }
    ];

    for (const client of clients) {
      await db.runSQL(
        `INSERT INTO clients (name, aum, client_since, profile) VALUES (?, ?, ?, ?)`,
        [client.name, client.aum, client.since, client.profile]
      );
    }

    console.log('Sample clients inserted successfully!');
  }

  console.log('Database initialization complete!');
  process.exit(0);
}

init().catch(error => {
  console.error('Initialization error:', error);
  process.exit(1);
});
