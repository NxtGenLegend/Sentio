import { supabase } from './src/config/supabase.js';

async function setupTestClientAlerts() {
  console.log('🔧 Setting up test client alert configurations...\n');

  // Get first client
  const { data: clients, error: clientsError } = await supabase
    .from('clients')
    .select('id, first_name, last_name')
    .limit(1);

  if (clientsError || !clients || clients.length === 0) {
    console.error('❌ Error fetching clients:', clientsError);
    console.log('ℹ️  Make sure you have at least one client in the database');
    return;
  }

  const client = clients[0];
  console.log(`👤 Setting up alerts for: ${client.first_name} ${client.last_name}`);

  // Check if alert config already exists
  const { data: existing, error: checkError } = await supabase
    .from('alert_configs')
    .select('id')
    .eq('client_id', client.id);

  if (existing && existing.length > 0) {
    console.log('⚠️  Alert config already exists for this client');
    console.log('   Updating existing configuration...\n');

    // Update existing
    const { data, error } = await supabase
      .from('alert_configs')
      .update({
        keywords: ['business', 'finance', 'technology', 'market', 'investment', 'economy'],
        excluded_keywords: [],
        priority_threshold: 'low',  // Very lenient for testing
        email_notifications: true,
        categories_enabled: ['Business', 'Technology', 'Finance', 'Markets', 'Economy', 'Startups']
      })
      .eq('client_id', client.id)
      .select();

    if (error) {
      console.error('❌ Error updating alert config:', error);
    } else {
      console.log('✅ Alert configuration updated successfully!');
    }
  } else {
    console.log('   Creating new configuration...\n');

    // Create new alert config
    const { data, error } = await supabase
      .from('alert_configs')
      .insert({
        client_id: client.id,
        keywords: ['business', 'finance', 'technology', 'market', 'investment', 'economy'],
        excluded_keywords: [],
        priority_threshold: 'low',  // Very lenient for testing
        email_notifications: true,
        categories_enabled: ['Business', 'Technology', 'Finance', 'Markets', 'Economy', 'Startups']
      })
      .select();

    if (error) {
      console.error('❌ Error creating alert config:', error);
    } else {
      console.log('✅ Alert configuration created successfully!');
    }
  }

  // Show the configuration
  const { data: config, error: configError } = await supabase
    .from('alert_configs')
    .select('*')
    .eq('client_id', client.id)
    .single();

  if (config) {
    console.log('\n📋 Alert Configuration:');
    console.log(`   Keywords: ${config.keywords?.join(', ')}`);
    console.log(`   Excluded: ${config.excluded_keywords?.join(', ') || 'none'}`);
    console.log(`   Priority threshold: ${config.priority_threshold}`);
    console.log(`   Categories: ${config.categories_enabled?.join(', ')}`);
    console.log(`   Email notifications: ${config.email_notifications ? 'enabled' : 'disabled'}`);
  }

  console.log('\n✅ Setup complete! You can now test the news alert system.');
  console.log('   Run: curl -X POST http://localhost:3001/api/alerts/fetch-and-send\n');
}

setupTestClientAlerts().catch(console.error);
