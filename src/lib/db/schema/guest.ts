import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const guest = pgTable('guest', {
  id: text('id').primaryKey(),
  sessionToken: text('sessionToken').notNull().unique(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
});
