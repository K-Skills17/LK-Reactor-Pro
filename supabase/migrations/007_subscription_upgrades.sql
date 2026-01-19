-- Add upgrade/downgrade fields to subscriptions table
DO $$ 
BEGIN
  -- Add next_tier field
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='subscriptions' AND column_name='next_tier') THEN
    ALTER TABLE subscriptions ADD COLUMN next_tier TEXT CHECK (next_tier IN ('FREE', 'PRO', 'PREMIUM'));
  END IF;

  -- Add next_billing_cycle field
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='subscriptions' AND column_name='next_billing_cycle') THEN
    ALTER TABLE subscriptions ADD COLUMN next_billing_cycle TEXT CHECK (next_billing_cycle IN ('monthly', 'yearly'));
  END IF;

  -- Add cancel_at_period_end field
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='subscriptions' AND column_name='cancel_at_period_end') THEN
    ALTER TABLE subscriptions ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add unique constraint to clinic_id if it doesn't exist
  -- This ensures upsert works correctly (one active subscription per clinic)
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_clinic_id_key') THEN
    ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_clinic_id_key UNIQUE (clinic_id);
  END IF;
END $$;
