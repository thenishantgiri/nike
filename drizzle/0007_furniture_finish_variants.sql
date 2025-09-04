-- Add hex code to finishes for swatches
ALTER TABLE "finishes" ADD COLUMN IF NOT EXISTS "hex_code" text;

-- Add finish_id to product_variants and backfill from colors by matching slug
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "finish_id" uuid;

UPDATE "product_variants" pv
SET "finish_id" = f."id"
FROM "finishes" f
JOIN "colors" c ON c."id" = pv."color_id"
WHERE f."slug" = c."slug" AND pv."finish_id" IS NULL;

-- Make size optional for furniture
ALTER TABLE "product_variants" ALTER COLUMN "size_id" DROP NOT NULL;

-- Add FK and index for finish_id
DO $$ BEGIN
  ALTER TABLE "product_variants"
  ADD CONSTRAINT IF NOT EXISTS "product_variants_finish_id_fkey" FOREIGN KEY ("finish_id") REFERENCES "finishes"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "idx_variants_finish_product" ON "product_variants" ("finish_id", "product_id");

-- Drop old color index and column if present
DO $$ BEGIN
  DROP INDEX IF EXISTS "idx_variants_color_product";
EXCEPTION WHEN undefined_table THEN NULL; END $$;

ALTER TABLE "product_variants" DROP COLUMN IF EXISTS "color_id";

-- Ensure finish_id is not null after backfill
ALTER TABLE "product_variants" ALTER COLUMN "finish_id" SET NOT NULL;

