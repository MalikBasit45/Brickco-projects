-- Create stock_history table
CREATE TABLE IF NOT EXISTS stock_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    month DATE NOT NULL,
    total_stock INTEGER NOT NULL,
    low_stock_count INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create unique index to prevent duplicate entries for the same month
CREATE UNIQUE INDEX IF NOT EXISTS stock_history_month_idx ON stock_history(month);

-- Create function to snapshot stock data
CREATE OR REPLACE FUNCTION snapshot_stock_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_month DATE;
    total_stock_count INTEGER;
    low_stock_items INTEGER;
    min_threshold INTEGER := 10; -- Default threshold
BEGIN
    -- Get current month (first day)
    current_month := date_trunc('month', current_date)::DATE;
    
    -- Calculate total stock
    SELECT COALESCE(SUM(stock), 0)
    INTO total_stock_count
    FROM bricks;
    
    -- Calculate low stock items (using default threshold since original table doesn't have min_stock_threshold)
    SELECT COUNT(*)
    INTO low_stock_items
    FROM bricks
    WHERE stock < min_threshold;
    
    -- Insert or update the snapshot for current month
    INSERT INTO stock_history (month, total_stock, low_stock_count)
    VALUES (current_month, total_stock_count, low_stock_items)
    ON CONFLICT (month) 
    DO UPDATE SET 
        total_stock = EXCLUDED.total_stock,
        low_stock_count = EXCLUDED.low_stock_count,
        created_at = timezone('utc'::text, now());
END;
$$;

-- Initial snapshot
SELECT snapshot_stock_data(); 