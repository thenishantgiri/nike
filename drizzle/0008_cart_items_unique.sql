-- Ensure one row per (cart_id, product_variant_id)
ALTER TABLE "cart_items"
  ADD CONSTRAINT IF NOT EXISTS "uniq_cart_item" UNIQUE ("cart_id", "product_variant_id");

