import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const rooms = pgTable("rooms", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertRoomSchema = createInsertSchema(rooms);
export const selectRoomSchema = createSelectSchema(rooms);

export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;

