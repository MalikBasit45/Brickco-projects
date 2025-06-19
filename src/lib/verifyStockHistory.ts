import { supabase } from './supabase';

export const verifyStockHistory = async () => {
  try {
    // 1. Check if stock_history table exists and has data
    const { data: historyData, error: historyError } = await supabase
      .from('stock_history')
      .select('*')
      .order('month', { ascending: false });

    if (historyError) {
      console.error('Error fetching stock history:', historyError);
      return {
        success: false,
        error: 'Failed to fetch stock history',
        details: historyError
      };
    }

    // 2. Get current bricks data for comparison
    const { data: bricksData, error: bricksError } = await supabase
      .from('bricks')
      .select('stock');

    if (bricksError) {
      console.error('Error fetching bricks:', bricksError);
      return {
        success: false,
        error: 'Failed to fetch bricks data',
        details: bricksError
      };
    }

    // Calculate current totals
    const currentTotalStock = bricksData?.reduce((sum, brick) => sum + (brick.stock || 0), 0) || 0;
    const currentLowStock = bricksData?.filter(brick => (brick.stock || 0) < 10).length || 0;

    // 3. Take a new snapshot
    const { error: snapshotError } = await supabase.rpc('snapshot_stock_data');

    if (snapshotError) {
      console.error('Error taking snapshot:', snapshotError);
      return {
        success: false,
        error: 'Failed to take new snapshot',
        details: snapshotError
      };
    }

    // 4. Fetch latest snapshot to verify
    const { data: latestSnapshot, error: latestError } = await supabase
      .from('stock_history')
      .select('*')
      .order('month', { ascending: false })
      .limit(1)
      .single();

    if (latestError) {
      console.error('Error fetching latest snapshot:', latestError);
      return {
        success: false,
        error: 'Failed to fetch latest snapshot',
        details: latestError
      };
    }

    return {
      success: true,
      data: {
        historyExists: historyData && historyData.length > 0,
        snapshotsCount: historyData?.length || 0,
        currentStats: {
          totalStock: currentTotalStock,
          lowStockCount: currentLowStock
        },
        latestSnapshot: latestSnapshot,
        snapshotsHistory: historyData
      }
    };
  } catch (error) {
    console.error('Verification failed:', error);
    return {
      success: false,
      error: 'Verification failed',
      details: error
    };
  }
}; 