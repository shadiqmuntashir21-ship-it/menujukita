-- MenujuKita 2.0 partner access; production migration only after all release gates.
CREATE TABLE IF NOT EXISTS wedding_partner_access (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 wedding_id uuid NOT NULL UNIQUE REFERENCES weddings(id) ON DELETE CASCADE,
 license_id uuid NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
 display_name text,
 status text NOT NULL DEFAULT 'invited' CHECK(status IN ('invited','active','revoked')),
 invite_token_hash text UNIQUE,
 invite_expires_at timestamptz,
 pin_hash text,
 pin_salt text,
 pin_hint text,
 joined_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE license_sessions ADD COLUMN IF NOT EXISTS partner_id uuid REFERENCES wedding_partner_access(id) ON DELETE CASCADE;
ALTER TABLE license_sessions ADD COLUMN IF NOT EXISTS actor_kind text NOT NULL DEFAULT 'owner' CHECK(actor_kind IN ('owner','partner'));
CREATE INDEX IF NOT EXISTS idx_partner_access_license ON wedding_partner_access(license_id,status);
CREATE INDEX IF NOT EXISTS idx_license_sessions_partner ON license_sessions(partner_id);
