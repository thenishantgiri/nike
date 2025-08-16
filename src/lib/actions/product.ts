"use server";

import { db } from "@/lib/db";
import {
  brands,
  categories,
  colors,
  genders,
  productImages,
  products,
  productVariants,
  sizes,
} from "@/lib/db/schema";
import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

export type ProductListItem = {
  id: string;
  name: string;
  brand: { id: string; name: string; slug: string };
  category: { id: string; name: string; slug: string };
  gender: { id: string; label: string; slug: string };
  minPrice: number;
  maxPrice: number;
  colorCount: number;
  imageUrl: string | null;
};

export type ProductWithAggregates = ProductListItem;

export type GetAllProductsResult = {
  products: ProductWithAggregates[];
  totalCount: number;
};

export type ProductFiltersInput = {
  search?: string;
  category?: string;
  brand?: string;
  gender?: string;
  colors?: string[];
  sizes?: string[];
  priceMin?: number;
  priceMax?: number;
  sortBy?: "price_asc" | "price_desc" | "latest" | "oldest";
  page?: number;
  limit?: number;
};

export async function getAllProducts(
  filters: ProductFiltersInput
): Promise<GetAllProductsResult> {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.max(1, Math.min(60, filters.limit ?? 12));
  const offset = (page - 1) * limit;

  const whereAnd: SQL<unknown>[] = [eq(products.isPublished, true)];

  if (filters.search && filters.search.trim()) {
    const term = `%${filters.search.trim()}%`;
    const searchCond = or(
      ilike(products.name, term),
      ilike(products.description, term),
      ilike(brands.name, term)
    );
    whereAnd.push(searchCond as SQL<unknown>);
  }

  const isUuid = (v?: string) =>
    !!v &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      v
    );

  const matchIdOrSlug = (
    idCol: AnyPgColumn,
    slugCol: AnyPgColumn,
    value?: string
  ): SQL<unknown> | undefined => {
    if (!value) return undefined;
    if (isUuid(value)) return eq(idCol, value) as unknown as SQL<unknown>;
    return eq(slugCol, value) as unknown as SQL<unknown>;
  };

  if (filters.category) {
    whereAnd.push(
      matchIdOrSlug(products.categoryId, categories.slug, filters.category)!
    );
  }
  if (filters.brand) {
    whereAnd.push(matchIdOrSlug(products.brandId, brands.slug, filters.brand)!);
  }
  if (filters.gender) {
    whereAnd.push(
      matchIdOrSlug(products.genderId, genders.slug, filters.gender)!
    );
  }

  const priceExpr = sql<number>`coalesce(${productVariants.salePrice}, ${productVariants.price})`;

  if (filters.priceMin != null) {
    whereAnd.push(sql`${priceExpr} >= ${filters.priceMin}`);
  }
  if (filters.priceMax != null) {
    whereAnd.push(sql`${priceExpr} <= ${filters.priceMax}`);
  }

  if (filters.colors && filters.colors.length) {
    const uuids = filters.colors.filter(isUuid);
    const slugs = filters.colors.filter((v) => !isUuid(v));
    const parts: SQL<unknown>[] = [];
    if (uuids.length) parts.push(inArray(productVariants.colorId, uuids));
    if (slugs.length) parts.push(inArray(colors.slug, slugs));
    if (parts.length)
      whereAnd.push(or(...(parts as SQL<unknown>[])) as SQL<unknown>);
  }

  if (filters.sizes && filters.sizes.length) {
    const uuids = filters.sizes.filter(isUuid);
    const slugs = filters.sizes.filter((v) => !isUuid(v));
    const parts: SQL<unknown>[] = [];
    if (uuids.length) parts.push(inArray(productVariants.sizeId, uuids));
    if (slugs.length) parts.push(inArray(sizes.slug, slugs));
    if (parts.length)
      whereAnd.push(or(...(parts as SQL<unknown>[])) as SQL<unknown>);
  }

  const orderByExpr =
    filters.sortBy === "price_asc"
      ? asc(sql`min(${priceExpr})`)
      : filters.sortBy === "price_desc"
      ? desc(sql`min(${priceExpr})`)
      : filters.sortBy === "oldest"
      ? asc(products.createdAt)
      : desc(products.createdAt);

  const imageExprWhenColor = sql<string | null>`
    coalesce(
      nullif(
        max(case when ${productImages.variantId} is not null then ${productImages.url} end),
        ''
      ),
      max(case when ${productImages.isPrimary} = true then ${productImages.url} end),
      max(${productImages.url})
    )
  `;
  const imageExprDefault = sql<string | null>`
    coalesce(
      max(case when ${productImages.isPrimary} = true then ${productImages.url} end),
      max(${productImages.url})
    )
  `;

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      brandId: brands.id,
      brandName: brands.name,
      brandSlug: brands.slug,
      categoryId: categories.id,
      categoryName: categories.name,
      categorySlug: categories.slug,
      genderId: genders.id,
      genderLabel: genders.label,
      genderSlug: genders.slug,
      minPrice: sql<number>`min(${priceExpr})`,
      maxPrice: sql<number>`max(${priceExpr})`,
      colorCount: sql<number>`count(distinct ${productVariants.colorId})`,
      imageUrl:
        filters.colors && filters.colors.length
          ? imageExprWhenColor
          : imageExprDefault,
    })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(genders, eq(products.genderId, genders.id))
    .leftJoin(productVariants, eq(productVariants.productId, products.id))
    .leftJoin(colors, eq(colors.id, productVariants.colorId))
    .leftJoin(sizes, eq(sizes.id, productVariants.sizeId))
    .leftJoin(
      productImages,
      or(
        eq(productImages.productId, products.id),
        eq(productImages.variantId, productVariants.id)
      )
    )
    .where(and(...whereAnd))
    .groupBy(
      products.id,
      products.name,
      brands.id,
      brands.name,
      brands.slug,
      categories.id,
      categories.name,
      categories.slug,
      genders.id,
      genders.label,
      genders.slug
    )
    .orderBy(orderByExpr)
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({
      count: sql<number>`count(distinct ${products.id})`,
    })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(genders, eq(products.genderId, genders.id))
    .leftJoin(productVariants, eq(productVariants.productId, products.id))
    .leftJoin(colors, eq(colors.id, productVariants.colorId))
    .leftJoin(sizes, eq(sizes.id, productVariants.sizeId))
    .where(and(...whereAnd));

  const mapped: ProductWithAggregates[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    brand: { id: r.brandId!, name: r.brandName!, slug: r.brandSlug! },
    category: {
      id: r.categoryId!,
      name: r.categoryName!,
      slug: r.categorySlug!,
    },
    gender: { id: r.genderId!, label: r.genderLabel!, slug: r.genderSlug! },
    minPrice: Number(r.minPrice ?? 0),
    maxPrice: Number(r.maxPrice ?? 0),
    colorCount: Number(r.colorCount ?? 0),
    imageUrl: r.imageUrl ?? null,
  }));

  return { products: mapped, totalCount: Number(count) };
}
