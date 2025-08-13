import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { productVariants } from '../variants';

export const sizes = pgTable('sizes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sizesRelations = relations(sizes, ({ many }) => ({
  productVariants: many(productVariants),
}));

export const insertSizeSchema = createInsertSchema(sizes);
export const selectSizeSchema = createSelectSchema(sizes);

export type Size = typeof sizes.$inferSelect;
export type NewSize = typeof sizes.$inferInsert;
