-- 1. Add new columns
ALTER TABLE public."Products"
  ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS specs jsonb DEFAULT '{}';

-- 2. Create GIN index for JSONB queries
CREATE INDEX IF NOT EXISTS products_specs_gin_idx
  ON public."Products" USING GIN (specs);

-- 3. Backfill data for existing products

-- Move existing 'img' to the first element of 'images' array if 'images' is empty
UPDATE public."Products"
SET images = ARRAY[img]
WHERE img IS NOT NULL AND (images IS NULL OR array_length(images, 1) IS NULL);

-- Populate specs based on product names (matching the old frontend logic)
UPDATE public."Products"
SET specs = 
  CASE 
    -- GRAINS
    WHEN upper(name) LIKE '%BASMATI%' THEN
      '{"Origin": "Punjab, India", "Grade": "Premium Long Grain", "Moisture Content": "10-12%", "Purity": "99%"}'::jsonb
    WHEN upper(name) LIKE '%WHEAT%' THEN
      '{"Origin": "Madhya Pradesh, India", "Grade": "Export Quality", "Moisture Content": "10-12%", "Purity": "99%"}'::jsonb
    WHEN upper(name) LIKE '%RICE%' OR upper(name) LIKE '%MAIZE%' OR upper(name) LIKE '%CORN%' THEN
      '{"Origin": "India", "Grade": "Premium", "Moisture Content": "10-12%", "Purity": "99%"}'::jsonb

    -- PULSES
    WHEN upper(name) LIKE '%LENTIL%' OR upper(name) LIKE '%CHICKPEA%' OR upper(name) LIKE '%BEAN%' OR upper(name) LIKE '%PEA%' OR upper(name) LIKE '%DAL%' OR upper(code) LIKE '%PULSE%' THEN
      '{"Origin": "India", "Grade": "Sortex Cleaned", "Moisture Content": "10-11%", "Purity": "99.5%"}'::jsonb

    -- SPICES (Default fallback in old code)
    WHEN upper(name) LIKE '%TURMERIC%' THEN
      '{"Origin": "Salem, India", "Grade": "High Curcumin", "Moisture Content": "8-10%", "Purity": "98%"}'::jsonb
    WHEN upper(name) LIKE '%CARDAMOM%' THEN
      '{"Origin": "Kerala, India", "Grade": "Premium Grade", "Moisture Content": "8-10%", "Purity": "98%"}'::jsonb
    WHEN upper(name) LIKE '%PEPPER%' THEN
      '{"Origin": "Kerala, India", "Grade": "Bold", "Moisture Content": "8-10%", "Purity": "98%"}'::jsonb
    ELSE
      '{"Origin": "India", "Grade": "Premium", "Moisture Content": "8-10%", "Purity": "98%"}'::jsonb
  END
WHERE specs IS NULL OR specs = '{}'::jsonb;
