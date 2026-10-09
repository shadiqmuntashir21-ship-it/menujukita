-- Staged PIN rotation: never revoke active access before the customer claims a replacement PIN.
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS pending_pin_hash text;
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS pending_pin_salt text;
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS pending_pin_hint text;
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS pending_pin_expires_at timestamptz;
