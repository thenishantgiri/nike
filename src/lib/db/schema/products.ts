import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { brands } from "./brands";
import { categories } from "./categories";
import { rooms } from "./rooms";
import { materials } from "./materials";
import { finishes } from "./finishes";
import { styles } from "./styles";
import { productCollections } from "./product-collections";
import { productImages } from "./product-images";
import { reviews } from "./reviews";
import { productVariants } from "./variants";
import { wishlists } from "./wishlists";

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id),
    roomId: uuid("room_id").references(() => rooms.id),
    materialId: uuid("material_id").references(() => materials.id),
    finishId: uuid("finish_id").references(() => finishes.id),
    styleId: uuid("style_id").references(() => styles.id),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id),
    isPublished: boolean("is_published").notNull().default(false),
    defaultVariantId: uuid("default_variant_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    brandPublishedIdx: index("idx_products_brand_published").on(t.brandId, t.isPublished),
    categoryPublishedIdx: index("idx_products_category_published").on(t.categoryId, t.isPublished),
    roomPublishedIdx: index("idx_products_room_published").on(t.roomId, t.isPublished),
    materialPublishedIdx: index("idx_products_material_published").on(t.materialId, t.isPublished),
    finishPublishedIdx: index("idx_products_finish_published").on(t.finishId, t.isPublished),
  })
);

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  room: one(rooms, {
    fields: [products.roomId],
    references: [rooms.id],
  }),
  material: one(materials, {
    fields: [products.materialId],
    references: [materials.id],
  }),
  finish: one(finishes, {
    fields: [products.finishId],
    references: [finishes.id],
  }),
  style: one(styles, {
    fields: [products.styleId],
    references: [styles.id],
  }),
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  defaultVariant: one(productVariants, {
    fields: [products.defaultVariantId],
    references: [productVariants.id],
    relationName: "defaultVariant",
  }),
  variants: many(productVariants),
  images: many(productImages),
  reviews: many(reviews),
  wishlists: many(wishlists),
  productCollections: many(productCollections),
}));

export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
