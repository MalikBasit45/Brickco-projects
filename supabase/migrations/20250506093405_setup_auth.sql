-- Create a secure users table that extends Supabase auth.users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'customer')),
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Allow users to read their role" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to read roles" ON public.users;

-- Create a simplified policy for role verification
CREATE POLICY "Users can read own data"
    ON public.users
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Create a simplified policy for admin access
CREATE POLICY "Admins can read all data"
    ON public.users
    FOR ALL
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT id FROM public.users WHERE role = 'admin'
        )
    );

-- Create a trigger to automatically create a public.users record when a new auth.users record is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, role, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to create admin user
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS void AS $$
DECLARE
    admin_id UUID;
BEGIN
    -- Check if admin already exists
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE email = 'admin@brickco.com'
    ) THEN
        -- Create admin user in auth.users
        INSERT INTO auth.users (
            email,
            encrypted_password,
            raw_app_meta_data,
            raw_user_meta_data,
            aud,
            role
        ) VALUES (
            'admin@brickco.com',
            crypt('Admin123!@#', gen_salt('bf')),
            '{"provider": "email", "providers": ["email"]}',
            '{"role": "admin", "full_name": "Admin User"}',
            'authenticated',
            'authenticated'
        ) RETURNING id INTO admin_id;

        -- The trigger will automatically create the public.users record
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function to create admin user
SELECT create_admin_user();

-- Create RLS policies for orders
CREATE POLICY "Customers can read own orders"
    ON orders
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = user_id AND 
        auth.jwt()->>'role' = 'customer'
    );

CREATE POLICY "Customers can create own orders"
    ON orders
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id AND 
        auth.jwt()->>'role' = 'customer'
    );

CREATE POLICY "Admins can read all orders"
    ON orders
    FOR SELECT
    TO authenticated
    USING (
        auth.jwt()->>'role' = 'admin'
    );

CREATE POLICY "Admins can modify orders"
    ON orders
    FOR ALL
    TO authenticated
    USING (
        auth.jwt()->>'role' = 'admin'
    );

-- Create RLS policies for bricks
CREATE POLICY "Anyone can read bricks"
    ON bricks
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can modify bricks"
    ON bricks
    FOR ALL
    TO authenticated
    USING (
        auth.jwt()->>'role' = 'admin'
    );

-- Create RLS policies for stock_history
CREATE POLICY "Admins can read stock history"
    ON stock_history
    FOR SELECT
    TO authenticated
    USING (
        auth.jwt()->>'role' = 'admin'
    );

CREATE POLICY "Admins can modify stock history"
    ON stock_history
    FOR ALL
    TO authenticated
    USING (
        auth.jwt()->>'role' = 'admin'
    ); 