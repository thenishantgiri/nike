import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const finishes = pgTable("finishes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  hexCode: text("hex_code"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertFinishSchema = createInsertSchema(finishes);
export const selectFinishSchema = createSelectSchema(finishes);

export type Finish = typeof finishes.$inferSelect;
export type NewFinish = typeof finishes.$inferInsert;
