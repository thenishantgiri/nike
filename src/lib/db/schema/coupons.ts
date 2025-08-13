import { pgTable, uuid, text, numeric, integer, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const discountTypeEnum = ['percentage', 'fixed'] as const;

export const coupons = pgTable('coupons', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  discountType: text('discount_type', { enum: discountTypeEnum }).notNull(),
  discountValue: numeric('discount_value', { precision: 10, scale: 2 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  maxUsage: integer('max_usage').notNull(),
  usedCount: integer('used_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const insertCouponSchema = createInsertSchema(coupons);
export const selectCouponSchema = createSelectSchema(coupons);

export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;
