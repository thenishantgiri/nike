import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { productVariants } from '../variants';

export const colors = pgTable('colors', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  hexCode: text('hex_code').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const colorsRelations = relations(colors, ({ many }) => ({
  productVariants: many(productVariants),
}));

export const insertColorSchema = createInsertSchema(colors);
export const selectColorSchema = createSelectSchema(colors);

export type Color = typeof colors.$inferSelect;
export type NewColor = typeof colors.$inferInsert;
