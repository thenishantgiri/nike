CREATE INDEX "idx_variants_color_product" ON "product_variants" USING btree ("color_id","product_id");--> statement-breakpoint
CREATE INDEX "idx_products_brand_published" ON "products" USING btree ("brand_id","is_published");--> statement-breakpoint
CREATE INDEX "idx_products_category_published" ON "products" USING btree ("category_id","is_published");