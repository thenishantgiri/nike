import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { orders } from './orders';

export const paymentMethodEnum = ['stripe', 'paypal', 'cod'] as const;
export const paymentStatusEnum = ['initiated', 'completed', 'failed'] as const;

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  method: text('method', { enum: paymentMethodEnum }).notNull(),
  status: text('status', { enum: paymentStatusEnum }).notNull().default('initiated'),
  paidAt: timestamp('paid_at'),
  transactionId: text('transaction_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

export const insertPaymentSchema = createInsertSchema(payments);
export const selectPaymentSchema = createSelectSchema(payments);

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
