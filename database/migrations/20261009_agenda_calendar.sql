-- MenujuKita 2.0 custom calendar agenda, supplementing task/payment/event dates.
CREATE TABLE IF NOT EXISTS wedding_agenda_entries (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
 title text NOT NULL,
 kind text NOT NULL DEFAULT 'meeting' CHECK(kind IN ('meeting','appointment','family','other')),
 happens_on date NOT NULL,
 starts_at time,
 location text,
 note text,
 created_by text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_wedding_agenda_entries_date ON wedding_agenda_entries(wedding_id,happens_on,starts_at);
