-- MenujuKita 2.0: non-destructive wedding cash ledger.
-- Do not run on production until release gate passes.
-- Existing budget_items/payments remain intact.
CREATE TABLE IF NOT EXISTS wedding_cash_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  payment_id uuid REFERENCES payments(id) ON DELETE RESTRICT,
  kind text NOT NULL CHECK (kind IN ('deposit','withdrawal','vendor_payment','refund')),
  contributor text NOT NULL DEFAULT 'shared' CHECK (contributor IN ('partner_one','partner_two','family','shared','other')),
  amount numeric(14,2) NOT NULL CHECK (amount > 0),
  happened_on date NOT NULL DEFAULT CURRENT_DATE,
  note text,
  created_by text NOT NULL,
  voided_at timestamptz,
  voided_by text,
  void_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cash_payment_kind CHECK (
    (kind = 'vendor_payment' AND payment_id IS NOT NULL) OR
    (kind <> 'vendor_payment' AND payment_id IS NULL)
  )
);
CREATE INDEX IF NOT EXISTS idx_wedding_cash_entries_wedding_date
  ON wedding_cash_entries(wedding_id,happened_on DESC,created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_wedding_cash_payment_active
  ON wedding_cash_entries(payment_id) WHERE payment_id IS NOT NULL AND voided_at IS NULL;
