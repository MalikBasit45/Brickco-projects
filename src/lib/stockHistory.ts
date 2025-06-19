import { supabase } from './supabase';

/**
 * Takes a snapshot of the current stock data if one hasn't been taken this month
 */
export const ensureStockSnapshot = async () => {
  try {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Check if we already have a snapshot for this month
    const { data: existingSnapshot } = await supabase
      .from('stock_history')
      .select('id')
      .eq('month', currentMonth.toISOString().slice(0, 10))
      .single();

    // If we already have a snapshot for this month, no need to create another
    if (existingSnapshot) {
      return;
    }

    // Take a new snapshot by calling the database function
    await supabase.rpc('snapshot_stock_data');
  } catch (error) {
    console.error('Error ensuring stock snapshot:', error);
  }
}; 