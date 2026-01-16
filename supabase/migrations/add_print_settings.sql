-- Add print settings columns to uploads table
ALTER TABLE uploads ADD COLUMN IF NOT EXISTS print_color VARCHAR(10) DEFAULT 'bw';
ALTER TABLE uploads ADD COLUMN IF NOT EXISTS print_sides VARCHAR(10) DEFAULT 'single';
ALTER TABLE uploads ADD COLUMN IF NOT EXISTS print_copies INTEGER DEFAULT 1;
ALTER TABLE uploads ADD COLUMN IF NOT EXISTS print_binding VARCHAR(10) DEFAULT 'none';
ALTER TABLE uploads ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES shops(id);

-- Create index for shop_id for faster queries
CREATE INDEX IF NOT EXISTS idx_uploads_shop_id ON uploads(shop_id);
