-- Runtime secrets stay server-side in Postgres and are generated inside the database.
CREATE TABLE IF NOT EXISTS app_secrets(
  secret_key text PRIMARY KEY,
  secret_value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO app_secrets(secret_key,secret_value)
VALUES('rsvp_signing_secret',encode(gen_random_bytes(48),'hex'))
ON CONFLICT(secret_key) DO NOTHING;

INSERT INTO app_secrets(secret_key,secret_value)
VALUES('storage_internal_secret',encode(gen_random_bytes(32),'hex'))
ON CONFLICT(secret_key) DO NOTHING;
