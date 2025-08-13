import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { categories } from './categories';
import { brands } from './brands';
import { genders } from './filters/genders';
import { productVariants } from './variants';
import { productImages } from './product-images';
import { reviews } from './reviews';
import { wishlists } from './wishlists';
import { productCollections } from './product-collections';

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  categoryId: uuid('category_id').notNull().references(() => categories.id),
  genderId: uuid('gender_id').notNull().references(() => genders.id),
  brandId: uuid('brand_id').notNull().references(() => brands.id),
  isPublished: boolean('is_published').notNull().default(false),
  defaultVariantId: uuid('default_variant_id').references(() => productVariants.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  gender: one(genders, {
    fields: [products.genderId],
    references: [genders.id],
  }),
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  defaultVariant: one(productVariants, {
    fields: [products.defaultVariantId],
    references: [productVariants.id],
    relationName: 'defaultVariant',
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
