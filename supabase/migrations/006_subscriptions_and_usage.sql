-- Add missing tables for subscriptions and usage tracking
-- These tables are referenced by API routes but were missing from initial schema

-- Subscriptions table - tracks active subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('FREE', 'PRO', 'PREMIUM')),
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'cancelled', 'expired', 'paused')),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  amount DECIMAL(10,2),
  mercadopago_payment_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_clinic_id ON subscriptions(clinic_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_tier ON subscriptions(tier);

-- Usage tracking table - tracks daily usage per clinic
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  messages_sent INTEGER NOT NULL DEFAULT 0,
  ai_generations INTEGER NOT NULL DEFAULT 0,
  campaigns_created INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(clinic_id, date)
);

CREATE INDEX idx_usage_tracking_clinic_date ON usage_tracking(clinic_id, date);
CREATE INDEX idx_usage_tracking_date ON usage_tracking(date);

-- Add additional fields to clinics table if they don't exist
DO $$ 
BEGIN
  -- Add name field if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='clinics' AND column_name='name') THEN
    ALTER TABLE clinics ADD COLUMN name TEXT;
  END IF;
  
  -- Add phone field if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='clinics' AND column_name='phone') THEN
    ALTER TABLE clinics ADD COLUMN phone TEXT;
  END IF;
  
  -- Add doctor_name field if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='clinics' AND column_name='doctor_name') THEN
    ALTER TABLE clinics ADD COLUMN doctor_name TEXT;
  END IF;
  
  -- Add profile_picture_url field if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='clinics' AND column_name='profile_picture_url') THEN
    ALTER TABLE clinics ADD COLUMN profile_picture_url TEXT;
  END IF;
END $$;

-- Add update triggers
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_tracking_updated_at BEFORE UPDATE ON usage_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Disable RLS (service-role only access from backend)
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking DISABLE ROW LEVEL SECURITY;

-- Create default FREE subscription for existing clinics
INSERT INTO subscriptions (clinic_id, tier, status, billing_cycle, current_period_start, current_period_end)
SELECT 
  id, 
  tier,
  CASE 
    WHEN tier = 'FREE' THEN 'trial'
    ELSE 'active'
  END as status,
  'monthly' as billing_cycle,
  NOW() as current_period_start,
  NOW() + INTERVAL '14 days' as current_period_end
FROM clinics
WHERE NOT EXISTS (
  SELECT 1 FROM subscriptions WHERE subscriptions.clinic_id = clinics.id
);

-- Comments for documentation
COMMENT ON TABLE subscriptions IS 'Tracks subscription status and billing for each clinic';
COMMENT ON TABLE usage_tracking IS 'Daily usage statistics per clinic for rate limiting';
COMMENT ON COLUMN subscriptions.status IS 'trial = 14-day trial, active = paid, cancelled = user cancelled, expired = payment failed, paused = temporary hold';
COMMENT ON COLUMN subscriptions.billing_cycle IS 'monthly or yearly subscription';
COMMENT ON COLUMN usage_tracking.messages_sent IS 'Number of WhatsApp messages sent today';
COMMENT ON COLUMN usage_tracking.ai_generations IS 'Number of AI messages generated today';
COMMENT ON COLUMN usage_tracking.campaigns_created IS 'Number of campaigns created today';
