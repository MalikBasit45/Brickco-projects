-- First, ensure the auth schema extensions are enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create the admin user in auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  uuid_generate_v4(),
  '00000000-0000-0000-0000-000000000000',
  'admin@example.com',
  crypt('Admin123!@#', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "admin"}',
  'authenticated',
  'authenticated',
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO UPDATE
SET encrypted_password = crypt('Admin123!@#', gen_salt('bf')),
    raw_user_meta_data = '{"role": "admin"}',
    updated_at = now()
RETURNING id;

-- Create or update the admin user in public.users
INSERT INTO public.users (id, full_name, role)
SELECT id, 'Admin User', 'admin'
FROM auth.users
WHERE email = 'admin@example.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin',
    full_name = 'Admin User';

-- Ensure the admin user has the correct permissions
UPDATE auth.users
SET role = 'authenticated',
    raw_user_meta_data = '{"role": "admin"}'
WHERE email = 'admin@example.com'; 