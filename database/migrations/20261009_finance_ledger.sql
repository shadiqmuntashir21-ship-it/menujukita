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

-- Synchronize payment cash movements *inside the same DB transaction* as payment changes.
-- Keep voided entries for auditing and avoid silently recording a second payment.
CREATE OR REPLACE FUNCTION mk_sync_vendor_cash_entry() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'UPDATE'
     AND NEW.status IS NOT DISTINCT FROM OLD.status
     AND NEW.amount IS NOT DISTINCT FROM OLD.amount
     AND NEW.paid_at IS NOT DISTINCT FROM OLD.paid_at THEN
    RETURN NEW;
  END IF;
  UPDATE wedding_cash_entries SET voided_at=now(),voided_by='system:payment',void_reason='payment_revised'
  WHERE payment_id=NEW.id AND voided_at IS NULL;
  IF NEW.status='paid' THEN
    INSERT INTO wedding_cash_entries(wedding_id,payment_id,kind,contributor,amount,happened_on,note,created_by)
    VALUES(NEW.wedding_id,NEW.id,'vendor_payment','shared',NEW.amount,COALESCE(NEW.paid_at::date,CURRENT_DATE),'Pembayaran vendor','system:payment');
  END IF;
  RETURN NEW;
END;
$$;
CREATE OR REPLACE TRIGGER trg_mk_sync_vendor_cash_update
AFTER UPDATE OF status,amount,paid_at ON payments
FOR EACH ROW EXECUTE FUNCTION mk_sync_vendor_cash_entry();
CREATE OR REPLACE TRIGGER trg_mk_sync_vendor_cash_insert
AFTER INSERT ON payments
FOR EACH ROW EXECUTE FUNCTION mk_sync_vendor_cash_entry();
