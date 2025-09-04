import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("Missing DATABASE_URL");
    process.exit(1);
  }
  const sql = neon(dbUrl);
  const rows = await sql<{ column_name: string }[]>`
    select column_name from information_schema.columns
    where table_name = 'product_variants'
      and column_name in ('finish_id','color_id')
    order by column_name`;
  console.log(rows.map(r => r.column_name));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

