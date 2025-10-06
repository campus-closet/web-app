/*
  # Campus Closet Initial Database Schema

  1. New Tables
    - `accounts`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password_hash` (text)
      - `role` (text) - admin, manager, temporary
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz) - for temporary accounts
    
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (numeric)
      - `image` (text)
      - `colors` (text[])
      - `sizes` (text[])
      - `logo_options` (text[])
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `orders`
      - `id` (uuid, primary key)
      - `order_number` (text, unique)
      - `customer_name` (text)
      - `customer_phone` (text)
      - `customer_email` (text)
      - `total_amount` (numeric)
      - `payment_status` (text) - pending, completed, failed
      - `payment_method` (text) - upi, whatsapp, email
      - `upi_transaction_id` (text)
      - `items` (jsonb)
      - `status` (text) - pending, processing, completed, cancelled
      - `created_at` (timestamptz)
      - `completed_at` (timestamptz)
    
    - `invoices`
      - `id` (uuid, primary key)
      - `invoice_number` (text, unique)
      - `order_id` (uuid, references orders)
      - `business_info` (jsonb)
      - `customer_info` (jsonb)
      - `items` (jsonb)
      - `subtotal` (numeric)
      - `discount` (numeric)
      - `tax` (numeric)
      - `grand_total` (numeric)
      - `notes` (text)
      - `pdf_url` (text)
      - `created_at` (timestamptz)
    
    - `settings`
      - `id` (uuid, primary key)
      - `key` (text, unique)
      - `value` (jsonb)
      - `updated_at` (timestamptz)
    
    - `custom_logos`
      - `id` (uuid, primary key)
      - `order_id` (uuid, references orders)
      - `file_name` (text)
      - `file_url` (text)
      - `drive_url` (text)
      - `uploaded_at` (timestamptz)
    
    - `analytics`
      - `id` (uuid, primary key)
      - `product_id` (uuid, references products)
      - `metric_type` (text) - views, cart_adds, purchases
      - `value` (integer)
      - `date` (date)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated admin access
    - Public access for products (read-only)
    - Order creation allowed for all users

  3. Important Notes
    - Passwords will be hashed using bcrypt
    - UPI ID and Google Drive settings stored in settings table
    - Google Sheets integration configuration in settings
    - Analytics tracked daily for performance metrics
*/

CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'manager',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  CONSTRAINT valid_role CHECK (role IN ('admin', 'manager', 'temporary'))
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL,
  image text NOT NULL,
  colors text[] NOT NULL DEFAULT '{}',
  sizes text[] NOT NULL DEFAULT '{}',
  logo_options text[] NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text NOT NULL,
  total_amount numeric NOT NULL,
  payment_status text DEFAULT 'pending',
  payment_method text,
  upi_transaction_id text,
  items jsonb NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'completed', 'failed')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'cancelled'))
);

CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  business_info jsonb NOT NULL,
  customer_info jsonb NOT NULL,
  items jsonb NOT NULL,
  subtotal numeric NOT NULL,
  discount numeric DEFAULT 0,
  tax numeric DEFAULT 0,
  grand_total numeric NOT NULL,
  notes text DEFAULT '',
  pdf_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS custom_logos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  drive_url text,
  uploaded_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  metric_type text NOT NULL,
  value integer DEFAULT 1,
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_metric_type CHECK (metric_type IN ('views', 'cart_adds', 'purchases'))
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_logos ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view their orders"
  ON orders FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage accounts"
  ON accounts FOR ALL
  USING (EXISTS (
    SELECT 1 FROM accounts
    WHERE accounts.id = auth.uid()
    AND accounts.role = 'admin'
    AND accounts.is_active = true
  ));

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (EXISTS (
    SELECT 1 FROM accounts
    WHERE accounts.id = auth.uid()
    AND accounts.role IN ('admin', 'manager')
    AND accounts.is_active = true
  ));

CREATE POLICY "Admins can manage orders"
  ON orders FOR ALL
  USING (EXISTS (
    SELECT 1 FROM accounts
    WHERE accounts.id = auth.uid()
    AND accounts.role IN ('admin', 'manager')
    AND accounts.is_active = true
  ));

CREATE POLICY "Admins can manage invoices"
  ON invoices FOR ALL
  USING (EXISTS (
    SELECT 1 FROM accounts
    WHERE accounts.id = auth.uid()
    AND accounts.role IN ('admin', 'manager')
    AND accounts.is_active = true
  ));

CREATE POLICY "Admins can manage settings"
  ON settings FOR ALL
  USING (EXISTS (
    SELECT 1 FROM accounts
    WHERE accounts.id = auth.uid()
    AND accounts.role = 'admin'
    AND accounts.is_active = true
  ));

CREATE POLICY "Admins can view custom logos"
  ON custom_logos FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM accounts
    WHERE accounts.id = auth.uid()
    AND accounts.role IN ('admin', 'manager')
    AND accounts.is_active = true
  ));

CREATE POLICY "Admins can view analytics"
  ON analytics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM accounts
    WHERE accounts.id = auth.uid()
    AND accounts.role IN ('admin', 'manager')
    AND accounts.is_active = true
  ));

CREATE POLICY "System can insert analytics"
  ON analytics FOR INSERT
  WITH CHECK (true);

INSERT INTO settings (key, value) VALUES
  ('upi_id', '{"id": "campuscloset@upi", "name": "Campus Closet"}'),
  ('google_drive', '{"folder_id": "", "enabled": false}'),
  ('google_sheets', '{"sheet_id": "", "enabled": false}'),
  ('email_config', '{"smtp_host": "", "smtp_port": 587, "from_email": "", "enabled": false}'),
  ('whatsapp_config', '{"api_key": "", "enabled": false}'),
  ('business_info', '{"name": "Campus Closet", "address": "123 Campus Road, City", "phone": "+91 98765 43210", "gstin": "29ABCDE1234F1Z5", "email": "info@campuscloset.com"}')
ON CONFLICT (key) DO NOTHING;

INSERT INTO accounts (email, password_hash, role, is_active) VALUES
  ('prajith@campuscloset.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', true)
ON CONFLICT (email) DO NOTHING;
