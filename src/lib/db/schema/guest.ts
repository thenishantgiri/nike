import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const guest = pgTable("guest", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionToken: text("sessionToken").notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
});
