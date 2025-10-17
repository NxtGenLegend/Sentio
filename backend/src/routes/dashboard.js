import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

/**
 * GET /api/dashboard/:clientId
 * Get dashboard layout for a specific client
 */
router.get('/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;

    const { data, error } = await supabase
      .from('client_dashboards')
      .select('*')
      .eq('client_id', clientId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      throw error;
    }

    // Return empty layout if not found
    if (!data) {
      return res.json({
        layout: { nodes: [], edges: [] }
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/dashboard/:clientId
 * Save or update dashboard layout for a client
 */
router.post('/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    const { layout } = req.body;

    if (!layout) {
      return res.status(400).json({ error: 'Layout is required' });
    }

    // Upsert dashboard (insert or update)
    const { data, error } = await supabase
      .from('client_dashboards')
      .upsert({
        client_id: clientId,
        layout
      }, {
        onConflict: 'client_id'
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error saving dashboard:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/dashboard/:clientId
 * Delete dashboard layout for a client
 */
router.delete('/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;

    const { error } = await supabase
      .from('client_dashboards')
      .delete()
      .eq('client_id', clientId);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Dashboard deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting dashboard:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
