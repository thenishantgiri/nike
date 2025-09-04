CREATE INDEX "idx_variants_shipping_class" ON "product_variants" USING btree ("shipping_class");--> statement-breakpoint
CREATE INDEX "idx_products_room_published" ON "products" USING btree ("room_id","is_published");--> statement-breakpoint
CREATE INDEX "idx_products_material_published" ON "products" USING btree ("material_id","is_published");--> statement-breakpoint
CREATE INDEX "idx_products_finish_published" ON "products" USING btree ("finish_id","is_published");