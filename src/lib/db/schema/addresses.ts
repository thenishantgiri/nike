import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { user } from './user';
import { orders } from './orders';

export const addressTypeEnum = ['billing', 'shipping'] as const;

export const addresses = pgTable('addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  type: text('type', { enum: addressTypeEnum }).notNull(),
  line1: text('line1').notNull(),
  line2: text('line2'),
  city: text('city').notNull(),
  state: text('state').notNull(),
  country: text('country').notNull(),
  postalCode: text('postal_code').notNull(),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const addressesRelations = relations(addresses, ({ one, many }) => ({
  user: one(user, {
    fields: [addresses.userId],
    references: [user.id],
  }),
  shippingOrders: many(orders, { relationName: 'shippingAddress' }),
  billingOrders: many(orders, { relationName: 'billingAddress' }),
}));

export const insertAddressSchema = createInsertSchema(addresses);
export const selectAddressSchema = createSelectSchema(addresses);

export type Address = typeof addresses.$inferSelect;
export type NewAddress = typeof addresses.$inferInsert;
