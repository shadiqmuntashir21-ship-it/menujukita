-- Personalized wedding cover
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS cover_object_key text;
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS cover_position_x numeric(5,2) NOT NULL DEFAULT 50;
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS cover_position_y numeric(5,2) NOT NULL DEFAULT 50;
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS cover_overlay numeric(4,2) NOT NULL DEFAULT 0.48;
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS cover_style text NOT NULL DEFAULT 'full';

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='weddings_cover_position_x_check') THEN
  ALTER TABLE weddings ADD CONSTRAINT weddings_cover_position_x_check CHECK(cover_position_x>=0 AND cover_position_x<=100);
 END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='weddings_cover_position_y_check') THEN
  ALTER TABLE weddings ADD CONSTRAINT weddings_cover_position_y_check CHECK(cover_position_y>=0 AND cover_position_y<=100);
 END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='weddings_cover_overlay_check') THEN
  ALTER TABLE weddings ADD CONSTRAINT weddings_cover_overlay_check CHECK(cover_overlay>=0.18 AND cover_overlay<=0.78);
 END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='weddings_cover_style_check') THEN
  ALTER TABLE weddings ADD CONSTRAINT weddings_cover_style_check CHECK(cover_style IN('full','soft','minimal'));
 END IF;
END $$;
