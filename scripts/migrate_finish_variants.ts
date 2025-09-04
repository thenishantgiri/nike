import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function run() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("Missing DATABASE_URL");
  const sql = neon(dbUrl);

  await sql`ALTER TABLE "finishes" ADD COLUMN IF NOT EXISTS "hex_code" text;`;
  await sql`ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "finish_id" uuid;`;
  await sql`
    UPDATE "product_variants"
    SET "finish_id" = f."id"
    FROM "finishes" f, "colors" c
    WHERE c."id" = "product_variants"."color_id"
      AND f."slug" = c."slug"
      AND "product_variants"."finish_id" IS NULL;
  `;
  await sql`ALTER TABLE "product_variants" ALTER COLUMN "size_id" DROP NOT NULL;`;
  try {
    await sql`ALTER TABLE "product_variants"
      ADD CONSTRAINT "product_variants_finish_id_fkey"
      FOREIGN KEY ("finish_id") REFERENCES "finishes"("id")
      ON DELETE RESTRICT ON UPDATE NO ACTION;`;
  } catch (e) {
    // ignore if it already exists
  }
  await sql`CREATE INDEX IF NOT EXISTS "idx_variants_finish_product" ON "product_variants" ("finish_id", "product_id");`;
  await sql`DROP INDEX IF EXISTS "idx_variants_color_product";`;
  await sql`ALTER TABLE "product_variants" DROP COLUMN IF EXISTS "color_id";`;
  await sql`ALTER TABLE "product_variants" ALTER COLUMN "finish_id" SET NOT NULL;`;

  console.log("Migration complete.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
