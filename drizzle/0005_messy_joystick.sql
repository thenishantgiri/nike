CREATE TABLE "finishes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "finishes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "materials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "materials_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "rooms_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "styles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "styles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "gender_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "shipping_class" text DEFAULT 'parcel' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "room_id" uuid;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "material_id" uuid;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "finish_id" uuid;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "style_id" uuid;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_finish_id_finishes_id_fk" FOREIGN KEY ("finish_id") REFERENCES "public"."finishes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_style_id_styles_id_fk" FOREIGN KEY ("style_id") REFERENCES "public"."styles"("id") ON DELETE no action ON UPDATE no action;