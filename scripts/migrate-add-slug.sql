-- Add slug column to Package table
ALTER TABLE Package ADD COLUMN slug TEXT;

-- Create index for slug (will be unique after population)
CREATE INDEX idx_package_slug ON Package(slug);
