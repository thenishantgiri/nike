import { relations } from "drizzle-orm";
import {
  integer,
  jsonb,
  numeric,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { cartItems } from "./carts";
import { finishes } from "./finishes";
import { sizes } from "./filters/sizes";
import { orderItems } from "./orders";
import { productImages } from "./product-images";
import { products } from "./products";

export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id").notNull(),
    sku: text("sku").notNull().unique(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    salePrice: numeric("sale_price", { precision: 10, scale: 2 }),
    finishId: uuid("finish_id")
      .notNull()
      .references(() => finishes.id),
    sizeId: uuid("size_id").references(() => sizes.id),
    inStock: integer("in_stock").notNull().default(0),
    weight: real("weight"),
    dimensions: jsonb("dimensions").$type<{
      length: number;
      width: number;
      height: number;
    }>(),
    shippingClass: text("shipping_class", {
      enum: ["parcel", "ltl", "white_glove"],
    })
      .notNull()
      .default("parcel"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    finishProductIdx: index("idx_variants_finish_product").on(t.finishId, t.productId),
    shippingClassIdx: index("idx_variants_shipping_class").on(t.shippingClass),
  })
);

export const productVariantsRelations = relations(
  productVariants,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
    finish: one(finishes, {
      fields: [productVariants.finishId],
      references: [finishes.id],
    }),
    size: one(sizes, {
      fields: [productVariants.sizeId],
      references: [sizes.id],
    }),
    images: many(productImages),
    cartItems: many(cartItems),
    orderItems: many(orderItems),
    defaultForProducts: many(products, { relationName: "defaultVariant" }),
  })
);

export const insertProductVariantSchema = createInsertSchema(productVariants);
export const selectProductVariantSchema = createSelectSchema(productVariants);

export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;
