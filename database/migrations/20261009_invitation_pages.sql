-- Opt-in public mini invitation. Never make wedding data public unless published=true.
CREATE TABLE IF NOT EXISTS wedding_invitation_pages (
 wedding_id uuid PRIMARY KEY REFERENCES weddings(id) ON DELETE CASCADE,
 public_id uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
 published boolean NOT NULL DEFAULT false,
 theme text NOT NULL DEFAULT 'sage' CHECK (theme IN ('sage','ivory','rose')),
 headline text NOT NULL DEFAULT 'Dengan penuh kebahagiaan, kami mengundang Anda',
 story text NOT NULL DEFAULT '',
 note text NOT NULL DEFAULT '',
 updated_by text,
 updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_wedding_invitation_public_id ON wedding_invitation_pages(public_id);

CREATE INDEX IF NOT EXISTS idx_wedding_invitation_published ON wedding_invitation_pages(published) WHERE published=true;
