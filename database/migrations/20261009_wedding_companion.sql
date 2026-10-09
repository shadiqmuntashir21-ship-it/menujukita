-- MenujuKita 2.0 optional planning modules. Non-destructive and wedding-scoped.
CREATE TABLE IF NOT EXISTS wedding_concepts (
  wedding_id uuid PRIMARY KEY REFERENCES weddings(id) ON DELETE CASCADE,
  theme_name text NOT NULL DEFAULT '',
  palette text NOT NULL DEFAULT '',
  dress_code text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  updated_by text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wedding_inspirations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  title text NOT NULL,
  image_url text CHECK(image_url IS NULL OR image_url ~ '^https://'),
  reference_url text CHECK(reference_url IS NULL OR reference_url ~ '^https://'),
  note text,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wedding_inspirations_wedding ON wedding_inspirations(wedding_id,created_at DESC);

CREATE TABLE IF NOT EXISTS wedding_gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK(quantity BETWEEN 1 AND 1000),
  estimated_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK(estimated_amount>=0),
  actual_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK(actual_amount>=0),
  purchased boolean NOT NULL DEFAULT false,
  store text,
  notes text,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wedding_gifts_wedding ON wedding_gifts(wedding_id,purchased,created_at);

CREATE TABLE IF NOT EXISTS wedding_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  title text NOT NULL,
  context text,
  status text NOT NULL DEFAULT 'discussing' CHECK(status IN('discussing','waiting_partner','agreed','cancelled')),
  resolution text,
  created_by text NOT NULL,
  decided_by text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wedding_decisions_wedding ON wedding_decisions(wedding_id,status,updated_at DESC);

CREATE TABLE IF NOT EXISTS wedding_decision_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  decision_id uuid NOT NULL REFERENCES wedding_decisions(id) ON DELETE CASCADE,
  author_id text NOT NULL,
  author_name text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wedding_decision_comments ON wedding_decision_comments(wedding_id,decision_id,created_at);
