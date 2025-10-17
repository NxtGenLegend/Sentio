import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for common operations

/**
 * Fetch all clients for the current advisor
 */
export async function getClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('status', 'active')
    .order('last_name', { ascending: true });

  if (error) {
    console.error('Error fetching clients:', error);
    return [];
  }

  return data;
}

/**
 * Fetch all prospects for the current advisor
 * Includes interactions for each prospect
 */
export async function getProspects() {
  const { data, error } = await supabase
    .from('prospects')
    .select(`
      *,
      interactions (
        id,
        interaction_type,
        subject,
        notes,
        interaction_date
      )
    `)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching prospects:', error);
    return [];
  }

  // Transform interactions to match the format expected by the UI
  return data.map(prospect => ({
    ...prospect,
    interactions: (prospect.interactions || []).map(interaction => ({
      type: interaction.interaction_type,
      date: interaction.interaction_date,
      note: interaction.notes || interaction.subject || ''
    }))
  }));
}

/**
 * Fetch interactions for a prospect
 */
export async function getProspectInteractions(prospectId) {
  const { data, error } = await supabase
    .from('interactions')
    .select('*')
    .eq('prospect_id', prospectId)
    .order('interaction_date', { ascending: false });

  if (error) {
    console.error('Error fetching interactions:', error);
    return [];
  }

  return data;
}

/**
 * Fetch news alerts for a client
 */
export async function getClientNews(clientId, options = {}) {
  const { priority, category, limit = 20, onlyUnread = false } = options;

  let query = supabase
    .from('news_alerts')
    .select('*')
    .eq('client_id', clientId);

  if (priority && priority !== 'all') {
    query = query.eq('priority', priority);
  }

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  if (onlyUnread) {
    query = query.eq('is_read', false);
  }

  query = query
    .order('published_at', { ascending: false })
    .limit(limit);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching client news:', error);
    return [];
  }

  return data;
}

/**
 * Fetch all news alerts across all clients
 */
export async function getAllNews(options = {}) {
  const { priority, category, clientId, limit = 50 } = options;

  let query = supabase
    .from('news_alerts')
    .select(`
      *,
      clients (
        id,
        first_name,
        last_name
      )
    `);

  if (clientId && clientId !== 'all') {
    query = query.eq('client_id', clientId);
  }

  if (priority && priority !== 'all') {
    query = query.eq('priority', priority);
  }

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  query = query
    .order('published_at', { ascending: false })
    .limit(limit);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching news:', error);
    return [];
  }

  // Transform data to match expected format
  return data.map(alert => ({
    ...alert,
    relevantClients: alert.clients ? [`${alert.clients.first_name} ${alert.clients.last_name}`] : []
  }));
}

/**
 * Mark news alert as read
 */
export async function markNewsAsRead(alertId) {
  const { error } = await supabase
    .from('news_alerts')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', alertId);

  if (error) {
    console.error('Error marking news as read:', error);
  }
}

/**
 * Get alert configuration for a client
 */
export async function getAlertConfig(clientId) {
  const { data, error } = await supabase
    .from('alert_configs')
    .select('*')
    .eq('client_id', clientId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
    console.error('Error fetching alert config:', error);
  }

  return data || null;
}

/**
 * Update alert configuration for a client
 */
export async function updateAlertConfig(clientId, config) {
  const { data, error } = await supabase
    .from('alert_configs')
    .upsert({
      client_id: clientId,
      ...config,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error updating alert config:', error);
    throw error;
  }

  return data;
}

/**
 * Create a new prospect
 */
export async function createProspect(prospectData) {
  const { data, error } = await supabase
    .from('prospects')
    .insert(prospectData)
    .select()
    .single();

  if (error) {
    console.error('Error creating prospect:', error);
    throw error;
  }

  return data;
}

/**
 * Update a prospect
 */
export async function updateProspect(prospectId, updates) {
  const { data, error } = await supabase
    .from('prospects')
    .update(updates)
    .eq('id', prospectId)
    .select()
    .single();

  if (error) {
    console.error('Error updating prospect:', error);
    throw error;
  }

  return data;
}

/**
 * Create a new interaction
 */
export async function createInteraction(interactionData) {
  const { data, error } = await supabase
    .from('interactions')
    .insert(interactionData)
    .select()
    .single();

  if (error) {
    console.error('Error creating interaction:', error);
    throw error;
  }

  return data;
}

/**
 * Get advisor profile
 */
export async function getAdvisorProfile() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('advisors')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching advisor profile:', error);
    return null;
  }

  return data;
}

/**
 * Update advisor profile
 */
export async function updateAdvisorProfile(updates) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('advisors')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating advisor profile:', error);
    throw error;
  }

  return data;
}

/**
 * Create a new client
 */
export async function createNewClient(clientData) {
  const { data, error } = await supabase
    .from('clients')
    .insert({
      advisor_id: '00000000-0000-0000-0000-000000000001', // TODO: Get from auth
      ...clientData,
      status: 'active'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating client:', error);
    throw error;
  }

  return data;
}

/**
 * Convert prospect to client
 */
export async function convertProspectToClient(prospectId, clientData) {
  // Start a transaction-like operation
  try {
    // 1. Get prospect data
    const { data: prospect, error: prospectError } = await supabase
      .from('prospects')
      .select('*')
      .eq('id', prospectId)
      .single();

    if (prospectError) throw prospectError;

    // 2. Create client from prospect data
    // Split name into first and last name
    const nameParts = prospect.name ? prospect.name.split(' ') : ['', ''];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const newClient = {
      advisor_id: prospect.advisor_id,
      first_name: firstName,
      last_name: lastName,
      primary_email: prospect.email,
      mobile_phone: prospect.phone,
      aum: clientData.aum || 0,
      client_since: clientData.client_since || new Date().toISOString().split('T')[0],
      account_type: clientData.account_type || 'individual',
      profile: clientData.profile || {
        holdings: [],
        interests: [],
        riskTolerance: 'moderate',
        investmentStyle: 'balanced',
        tags: prospect.tags || []
      },
      notes: prospect.notes || '',
      status: 'active'
    };

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert(newClient)
      .select()
      .single();

    if (clientError) throw clientError;

    // 3. Delete the prospect (now that they're a client)
    const { error: deleteError } = await supabase
      .from('prospects')
      .delete()
      .eq('id', prospectId);

    if (deleteError) throw deleteError;

    return client;
  } catch (error) {
    console.error('Error converting prospect to client:', error);
    throw error;
  }
}

/**
 * Delete a prospect
 */
export async function deleteProspect(prospectId) {
  const { error } = await supabase
    .from('prospects')
    .delete()
    .eq('id', prospectId);

  if (error) {
    console.error('Error deleting prospect:', error);
    throw error;
  }
}

/**
 * Get portfolio allocations for a client
 */
export async function getPortfolioAllocations(clientId) {
  const { data, error } = await supabase
    .from('portfolio_allocations')
    .select('*')
    .eq('client_id', clientId)
    .order('percentage', { ascending: false });

  if (error) {
    console.error('Error fetching portfolio allocations:', error);
    return [];
  }

  return data;
}

/**
 * Get client accounts
 */
export async function getClientAccounts(clientId) {
  const { data, error } = await supabase
    .from('client_accounts')
    .select('*')
    .eq('client_id', clientId)
    .order('is_primary', { ascending: false });

  if (error) {
    console.error('Error fetching client accounts:', error);
    return [];
  }

  return data;
}

/**
 * Get holdings for a client
 */
export async function getHoldings(clientId) {
  const { data, error } = await supabase
    .from('holdings')
    .select('*')
    .eq('client_id', clientId)
    .order('current_value', { ascending: false });

  if (error) {
    console.error('Error fetching holdings:', error);
    return [];
  }

  return data;
}
