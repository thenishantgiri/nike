import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const styles = pgTable("styles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertStyleSchema = createInsertSchema(styles);
export const selectStyleSchema = createSelectSchema(styles);

export type Style = typeof styles.$inferSelect;
export type NewStyle = typeof styles.$inferInsert;

