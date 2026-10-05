-- MenujuKita application schema
-- Neon project currently used by pilot: steep-forest-69917879
-- Pilot capacity: 250 active wedding licenses
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS app_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id=1),
  max_active_weddings integer NOT NULL DEFAULT 250 CHECK (max_active_weddings>0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO app_settings(id,max_active_weddings) VALUES(1,250)
ON CONFLICT(id) DO UPDATE SET max_active_weddings=EXCLUDED.max_active_weddings,updated_at=now();

CREATE TABLE IF NOT EXISTS weddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_auth_user_id text NOT NULL,
  couple_one_name text NOT NULL,
  couple_two_name text NOT NULL,
  wedding_date date,
  estimated_month date,
  city text,
  cover_object_key text,
  cover_position_x numeric(5,2) NOT NULL DEFAULT 50 CHECK(cover_position_x>=0 AND cover_position_x<=100),
  cover_position_y numeric(5,2) NOT NULL DEFAULT 50 CHECK(cover_position_y>=0 AND cover_position_y<=100),
  cover_overlay numeric(4,2) NOT NULL DEFAULT 0.48 CHECK(cover_overlay>=0.18 AND cover_overlay<=0.78),
  cover_style text NOT NULL DEFAULT 'full' CHECK(cover_style IN('full','soft','minimal')),
  guest_target integer NOT NULL DEFAULT 0 CHECK(guest_target>=0 AND guest_target<=5000),
  budget_total numeric(14,2) NOT NULL DEFAULT 0 CHECK(budget_total>=0),
  available_funds numeric(14,2) NOT NULL DEFAULT 0 CHECK(available_funds>=0),
  reserve_buffer numeric(14,2) NOT NULL DEFAULT 0 CHECK(reserve_buffer>=0),
  planning_style text NOT NULL DEFAULT 'couple' CHECK(planning_style IN('couple','family','couple_wo','wo')),
  slug text UNIQUE,
  status text NOT NULL DEFAULT 'active' CHECK(status IN('active','archived','deleted')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_hash text NOT NULL UNIQUE,
  code_hint text NOT NULL,
  status text NOT NULL DEFAULT 'unused' CHECK(status IN('unused','active','suspended','expired','revoked')),
  wedding_id uuid UNIQUE REFERENCES weddings(id) ON DELETE SET NULL,
  activated_by_auth_user_id text,
  activated_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wedding_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  auth_user_id text,
  invited_email text,
  display_name text,
  role text NOT NULL DEFAULT 'viewer' CHECK(role IN('owner','partner','collaborator','viewer')),
  can_view_budget boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active' CHECK(status IN('invited','active','revoked')),
  joined_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(wedding_id,auth_user_id)
);

CREATE TABLE IF NOT EXISTS member_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  invited_email text,
  role text NOT NULL DEFAULT 'collaborator' CHECK(role IN('partner','collaborator','viewer')),
  can_view_budget boolean NOT NULL DEFAULT false,
  token_hash text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK(status IN('pending','accepted','revoked','expired')),
  expires_at timestamptz NOT NULL DEFAULT(now()+interval '14 days'),
  created_by_auth_user_id text NOT NULL,
  accepted_by_auth_user_id text,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wedding_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  name text NOT NULL,
  event_date date,
  start_time time,
  end_time time,
  location text,
  map_url text,
  is_public boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  event_id uuid REFERENCES wedding_events(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  due_date date,
  priority text NOT NULL DEFAULT 'medium' CHECK(priority IN('low','medium','high','critical')),
  status text NOT NULL DEFAULT 'todo' CHECK(status IN('todo','in_progress','done','skipped')),
  assignee_member_id uuid REFERENCES wedding_members(id) ON DELETE SET NULL,
  related_vendor_id uuid,
  related_budget_item_id uuid,
  completed_at timestamptz,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS budget_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name text NOT NULL,
  planned_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK(planned_amount>=0),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  category text NOT NULL,
  name text NOT NULL,
  pic_name text,
  phone text,
  whatsapp text,
  instagram text,
  email text,
  quoted_price numeric(14,2) NOT NULL DEFAULT 0 CHECK(quoted_price>=0),
  agreed_price numeric(14,2) NOT NULL DEFAULT 0 CHECK(agreed_price>=0),
  status text NOT NULL DEFAULT 'searching' CHECK(status IN('searching','shortlisted','contacted','negotiating','booked','completed','cancelled')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS budget_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  category_id uuid REFERENCES budget_categories(id) ON DELETE SET NULL,
  vendor_id uuid REFERENCES vendors(id) ON DELETE SET NULL,
  name text NOT NULL,
  planned_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK(planned_amount>=0),
  actual_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK(actual_amount>=0),
  paid_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK(paid_amount>=0),
  due_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_related_vendor_id_fkey;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_related_budget_item_id_fkey;
ALTER TABLE tasks ADD CONSTRAINT tasks_related_vendor_id_fkey FOREIGN KEY(related_vendor_id) REFERENCES vendors(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD CONSTRAINT tasks_related_budget_item_id_fkey FOREIGN KEY(related_budget_item_id) REFERENCES budget_items(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  vendor_id uuid REFERENCES vendors(id) ON DELETE SET NULL,
  budget_item_id uuid REFERENCES budget_items(id) ON DELETE SET NULL,
  description text NOT NULL,
  amount numeric(14,2) NOT NULL CHECK(amount>0),
  due_date date,
  status text NOT NULL DEFAULT 'upcoming' CHECK(status IN('upcoming','paid','overdue','cancelled')),
  paid_at timestamptz,
  payment_method text,
  receipt_object_key text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS guest_parties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  party_name text NOT NULL,
  side text NOT NULL DEFAULT 'other' CHECK(side IN('partner_one','partner_two','shared','other')),
  group_name text NOT NULL DEFAULT 'Other',
  max_pax integer NOT NULL DEFAULT 1 CHECK(max_pax>0 AND max_pax<=20),
  rsvp_token_hash text UNIQUE,
  token_hint text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  party_id uuid REFERENCES guest_parties(id) ON DELETE SET NULL,
  name text NOT NULL,
  phone text,
  email text,
  invitation_quantity integer NOT NULL DEFAULT 1 CHECK(invitation_quantity>0 AND invitation_quantity<=20),
  expected_pax integer NOT NULL DEFAULT 1 CHECK(expected_pax>=0 AND expected_pax<=20),
  rsvp_status text NOT NULL DEFAULT 'not_sent' CHECK(rsvp_status IN('not_sent','waiting','attending','not_attending','maybe')),
  actual_pax integer CHECK(actual_pax>=0 AND actual_pax<=20),
  dietary_note text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  guest_id uuid REFERENCES guests(id) ON DELETE CASCADE,
  party_id uuid REFERENCES guest_parties(id) ON DELETE CASCADE,
  event_id uuid REFERENCES wedding_events(id) ON DELETE CASCADE,
  status text NOT NULL CHECK(status IN('attending','not_attending','maybe')),
  pax integer NOT NULL DEFAULT 1 CHECK(pax>=0 AND pax<=20),
  dietary_note text,
  responded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(guest_id,event_id)
);

CREATE TABLE IF NOT EXISTS seating_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  event_id uuid REFERENCES wedding_events(id) ON DELETE CASCADE,
  name text NOT NULL,
  capacity integer NOT NULL DEFAULT 10 CHECK(capacity>0 AND capacity<=100),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seating_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  table_id uuid NOT NULL REFERENCES seating_tables(id) ON DELETE CASCADE,
  guest_id uuid NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  seats integer NOT NULL DEFAULT 1 CHECK(seats>0 AND seats<=20),
  UNIQUE(table_id,guest_id)
);

CREATE TABLE IF NOT EXISTS rundown_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  event_id uuid REFERENCES wedding_events(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  activity text NOT NULL,
  location text,
  pic_member_id uuid REFERENCES wedding_members(id) ON DELETE SET NULL,
  vendor_id uuid REFERENCES vendors(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'upcoming' CHECK(status IN('upcoming','ready','in_progress','done','delayed','cancelled')),
  notes text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  vendor_id uuid REFERENCES vendors(id) ON DELETE SET NULL,
  payment_id uuid REFERENCES payments(id) ON DELETE SET NULL,
  category text NOT NULL DEFAULT 'other',
  name text NOT NULL,
  object_key text NOT NULL,
  content_type text,
  size_bytes bigint NOT NULL DEFAULT 0 CHECK(size_bytes>=0),
  uploaded_by_auth_user_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  auth_user_id text,
  type text NOT NULL,
  priority text NOT NULL DEFAULT 'info' CHECK(priority IN('info','important','critical')),
  title text NOT NULL,
  body text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public_rate_limits (
  rate_key text PRIMARY KEY,
  hit_count integer NOT NULL DEFAULT 0,
  window_start timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_public_rate_limits_window ON public_rate_limits(window_start);

CREATE TABLE IF NOT EXISTS activity_logs (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  wedding_id uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  auth_user_id text,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_members_user ON wedding_members(auth_user_id,wedding_id);
CREATE INDEX IF NOT EXISTS idx_member_invites_wedding_status ON member_invites(wedding_id,status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_wedding_status_due ON tasks(wedding_id,status,due_date);
CREATE INDEX IF NOT EXISTS idx_budget_items_wedding ON budget_items(wedding_id);
CREATE INDEX IF NOT EXISTS idx_vendors_wedding_category_status ON vendors(wedding_id,category,status);
CREATE INDEX IF NOT EXISTS idx_payments_wedding_status_due ON payments(wedding_id,status,due_date);
CREATE INDEX IF NOT EXISTS idx_guests_wedding_status ON guests(wedding_id,rsvp_status);
CREATE INDEX IF NOT EXISTS idx_rsvps_wedding_event ON rsvps(wedding_id,event_id);
CREATE INDEX IF NOT EXISTS idx_rundown_wedding_time ON rundown_items(wedding_id,starts_at);
CREATE INDEX IF NOT EXISTS idx_activity_wedding_created ON activity_logs(wedding_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(auth_user_id,read_at);
CREATE INDEX IF NOT EXISTS idx_documents_wedding_created ON documents(wedding_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seating_tables_wedding_event ON seating_tables(wedding_id,event_id);
CREATE INDEX IF NOT EXISTS idx_seating_assignments_wedding_table ON seating_assignments(wedding_id,table_id);
CREATE INDEX IF NOT EXISTS idx_wedding_events_wedding_date ON wedding_events(wedding_id,event_date,sort_order);
CREATE INDEX IF NOT EXISTS idx_licenses_status_wedding ON licenses(status,wedding_id);
CREATE INDEX IF NOT EXISTS idx_member_invites_token_status ON member_invites(token_hash,status,expires_at);

CREATE UNIQUE INDEX IF NOT EXISTS uq_active_owner_per_wedding ON wedding_members(wedding_id) WHERE role='owner' AND status='active';

CREATE OR REPLACE FUNCTION enforce_same_wedding_references()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_TABLE_NAME='seating_assignments' THEN
    IF NOT EXISTS(SELECT 1 FROM seating_tables x WHERE x.id=NEW.table_id AND x.wedding_id=NEW.wedding_id) THEN RAISE EXCEPTION 'Cross-wedding seating table reference'; END IF;
    IF NOT EXISTS(SELECT 1 FROM guests x WHERE x.id=NEW.guest_id AND x.wedding_id=NEW.wedding_id) THEN RAISE EXCEPTION 'Cross-wedding seating guest reference'; END IF;
  ELSIF TG_TABLE_NAME='payments' THEN
    IF NEW.vendor_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM vendors x WHERE x.id=NEW.vendor_id AND x.wedding_id=NEW.wedding_id) THEN RAISE EXCEPTION 'Cross-wedding payment vendor reference'; END IF;
    IF NEW.budget_item_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM budget_items x WHERE x.id=NEW.budget_item_id AND x.wedding_id=NEW.wedding_id) THEN RAISE EXCEPTION 'Cross-wedding payment budget reference'; END IF;
  ELSIF TG_TABLE_NAME='documents' THEN
    IF NEW.vendor_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM vendors x WHERE x.id=NEW.vendor_id AND x.wedding_id=NEW.wedding_id) THEN RAISE EXCEPTION 'Cross-wedding document vendor reference'; END IF;
    IF NEW.payment_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM payments x WHERE x.id=NEW.payment_id AND x.wedding_id=NEW.wedding_id) THEN RAISE EXCEPTION 'Cross-wedding document payment reference'; END IF;
  ELSIF TG_TABLE_NAME='rundown_items' THEN
    IF NEW.event_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM wedding_events x WHERE x.id=NEW.event_id AND x.wedding_id=NEW.wedding_id) THEN RAISE EXCEPTION 'Cross-wedding rundown event reference'; END IF;
    IF NEW.pic_member_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM wedding_members x WHERE x.id=NEW.pic_member_id AND x.wedding_id=NEW.wedding_id) THEN RAISE EXCEPTION 'Cross-wedding rundown member reference'; END IF;
    IF NEW.vendor_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM vendors x WHERE x.id=NEW.vendor_id AND x.wedding_id=NEW.wedding_id) THEN RAISE EXCEPTION 'Cross-wedding rundown vendor reference'; END IF;
  ELSIF TG_TABLE_NAME='tasks' THEN
    IF NEW.event_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM wedding_events x WHERE x.id=NEW.event_id AND x.wedding_id=NEW.wedding_id) THEN RAISE EXCEPTION 'Cross-wedding task event reference'; END IF;
    IF NEW.assignee_member_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM wedding_members x WHERE x.id=NEW.assignee_member_id AND x.wedding_id=NEW.wedding_id) THEN RAISE EXCEPTION 'Cross-wedding task member reference'; END IF;
    IF NEW.related_vendor_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM vendors x WHERE x.id=NEW.related_vendor_id AND x.wedding_id=NEW.wedding_id) THEN RAISE EXCEPTION 'Cross-wedding task vendor reference'; END IF;
    IF NEW.related_budget_item_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM budget_items x WHERE x.id=NEW.related_budget_item_id AND x.wedding_id=NEW.wedding_id) THEN RAISE EXCEPTION 'Cross-wedding task budget reference'; END IF;
  ELSIF TG_TABLE_NAME='rsvps' THEN
    IF NEW.guest_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM guests x WHERE x.id=NEW.guest_id AND x.wedding_id=NEW.wedding_id) THEN RAISE EXCEPTION 'Cross-wedding RSVP guest reference'; END IF;
    IF NEW.party_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM guest_parties x WHERE x.id=NEW.party_id AND x.wedding_id=NEW.wedding_id) THEN RAISE EXCEPTION 'Cross-wedding RSVP party reference'; END IF;
    IF NEW.event_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM wedding_events x WHERE x.id=NEW.event_id AND x.wedding_id=NEW.wedding_id) THEN RAISE EXCEPTION 'Cross-wedding RSVP event reference'; END IF;
  END IF;
  RETURN NEW;
END;$$;

DROP TRIGGER IF EXISTS trg_tenant_seating ON seating_assignments;
CREATE TRIGGER trg_tenant_seating BEFORE INSERT OR UPDATE ON seating_assignments FOR EACH ROW EXECUTE FUNCTION enforce_same_wedding_references();
DROP TRIGGER IF EXISTS trg_tenant_payments ON payments;
CREATE TRIGGER trg_tenant_payments BEFORE INSERT OR UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION enforce_same_wedding_references();
DROP TRIGGER IF EXISTS trg_tenant_documents ON documents;
CREATE TRIGGER trg_tenant_documents BEFORE INSERT OR UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION enforce_same_wedding_references();
DROP TRIGGER IF EXISTS trg_tenant_rundown ON rundown_items;
CREATE TRIGGER trg_tenant_rundown BEFORE INSERT OR UPDATE ON rundown_items FOR EACH ROW EXECUTE FUNCTION enforce_same_wedding_references();
DROP TRIGGER IF EXISTS trg_tenant_tasks ON tasks;
CREATE TRIGGER trg_tenant_tasks BEFORE INSERT OR UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION enforce_same_wedding_references();
DROP TRIGGER IF EXISTS trg_tenant_rsvps ON rsvps;
CREATE TRIGGER trg_tenant_rsvps BEFORE INSERT OR UPDATE ON rsvps FOR EACH ROW EXECUTE FUNCTION enforce_same_wedding_references();

CREATE OR REPLACE FUNCTION enforce_active_license_limit()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE max_allowed integer; active_count integer;
BEGIN
  IF NEW.status='active' AND (TG_OP='INSERT' OR OLD.status IS DISTINCT FROM 'active') THEN
    SELECT max_active_weddings INTO max_allowed FROM app_settings WHERE id=1;
    SELECT count(*) INTO active_count FROM licenses WHERE status='active';
    IF active_count>=max_allowed THEN
      RAISE EXCEPTION 'Pilot capacity reached: % active weddings',max_allowed USING ERRCODE='check_violation';
    END IF;
  END IF;
  RETURN NEW;
END;$$;
DROP TRIGGER IF EXISTS trg_enforce_active_license_limit ON licenses;
CREATE TRIGGER trg_enforce_active_license_limit
BEFORE INSERT OR UPDATE OF status ON licenses
FOR EACH ROW EXECUTE FUNCTION enforce_active_license_limit();


-- MenujuKita commerce / order system
CREATE TABLE IF NOT EXISTS payment_methods(
  code text PRIMARY KEY,
  label text NOT NULL,
  type text NOT NULL CHECK(type IN('bank','ewallet','qris')),
  account_no text,
  account_name text,
  merchant_id text,
  instructions text,
  qr_image_path text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_token text NOT NULL UNIQUE,
  order_no text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_whatsapp text NOT NULL,
  couple_names text,
  wedding_date date,
  product text NOT NULL DEFAULT 'MenujuKita',
  amount numeric(14,2) NOT NULL DEFAULT 49000,
  payment_method_code text REFERENCES payment_methods(code),
  payment_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending_payment' CHECK(status IN('pending_payment','awaiting_verification','needs_confirmation','payment_rejected','payment_verified','access_sent','completed','cancelled')),
  claimed_at timestamptz,
  verified_at timestamptz,
  access_sent_at timestamptz,
  completed_at timestamptz,
  license_id uuid UNIQUE REFERENCES licenses(id) ON DELETE SET NULL,
  license_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_claims(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  method_code text NOT NULL,
  claimed_at timestamptz NOT NULL DEFAULT now(),
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_events(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  kind text NOT NULL,
  recipient text NOT NULL,
  status text NOT NULL CHECK(status IN('sent','failed')),
  provider_id text,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_activity(
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  event text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_order_activity_order_created ON order_activity(order_id,created_at);

INSERT INTO payment_methods(code,label,type,account_no,account_name,merchant_id,instructions,qr_image_path,sort_order,is_active) VALUES
('bri','BRI','bank','518301014886532','Muhammad Shadiq Muntashir',NULL,'Transfer sesuai total order ke rekening BRI ini.',NULL,1,true),
('mandiri','Mandiri','bank','1510018726163','Muhammad Shadiq',NULL,'Transfer sesuai total order ke rekening Mandiri ini.',NULL,2,true),
('bsi','BSI','bank','7273584344','Muhammad Shadiq Muntashir',NULL,'Transfer sesuai total order ke rekening Bank Syariah Indonesia ini.',NULL,3,true),
('bank-sulteng','Bank Sulteng','bank','0010201272944','Muhammad Shadiq Muntashir',NULL,'Transfer sesuai total order ke rekening Bank Sulteng ini.',NULL,4,true),
('gopay','GoPay','ewallet','082258687238','Muhammad Shadiq Muntashir',NULL,'Kirim sesuai total order ke nomor GoPay ini.',NULL,5,true),
('qris','QRIS','qris','ID1026601784022','TEMAN DIGITAL','ID1026601784022','Sebelum melakukan pembayaran, pastikan nama merchant yang muncul adalah TEMAN DIGITAL.','/qris-teman-digital.svg',6,true)
ON CONFLICT(code) DO NOTHING;
