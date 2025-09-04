ALTER TABLE "product_variants" DROP CONSTRAINT "product_variants_color_id_colors_id_fk";
--> statement-breakpoint
DROP INDEX "idx_variants_color_product";--> statement-breakpoint
ALTER TABLE "product_variants" ALTER COLUMN "size_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "finishes" ADD COLUMN "hex_code" text;--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "finish_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_finish_id_finishes_id_fk" FOREIGN KEY ("finish_id") REFERENCES "public"."finishes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_variants_finish_product" ON "product_variants" USING btree ("finish_id","product_id");--> statement-breakpoint
ALTER TABLE "product_variants" DROP COLUMN "color_id";