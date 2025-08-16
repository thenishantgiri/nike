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
import { reviews } from "@/lib/db/schema";
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

export type PDPImage = { url: string; isPrimary: boolean; sortOrder: number };
export type PDPVariant = {
  id: string;
  sku: string;
  color: { id: string; name: string; slug: string; hexCode?: string | null };
  size: { id: string; name: string; slug: string; sortOrder?: number | null };
  price: number;
  salePrice?: number | null;
  inStock: number;
  images: PDPImage[];
};
export type PDPProduct = {
  id: string;
  name: string;
  description?: string | null;
  priceRange: { min: number; max: number };
  brand: { id: string; name: string; slug: string };
  category: { id: string; name: string; slug: string };
  gender: { id: string; label: string; slug: string };
  variants: PDPVariant[];
  images: PDPImage[];
  defaultVariantId?: string | null;
};
export type ReviewDTO = {
  id: string;
  author: string;
  rating: number;
  title?: string;
  content: string;
  createdAt: string;
};
export type RecommendedProduct = {
  id: string;
  title: string;
  price: number;
  image?: string | null;
  category: string;
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

export async function getProduct(productId: string): Promise<PDPProduct | null> {
  if (!/^[0-9a-fA-F-]{36}$/.test(productId)) return null;
  const [row] = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      defaultVariantId: products.defaultVariantId,
      brandId: brands.id,
      brandName: brands.name,
      brandSlug: brands.slug,
      categoryId: categories.id,
      categoryName: categories.name,
      categorySlug: categories.slug,
      genderId: genders.id,
      genderLabel: genders.label,
      genderSlug: genders.slug,
    })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(genders, eq(products.genderId, genders.id))
    .where(eq(products.id, productId));

  if (!row) return null;

  const variantRows = await db
    .select({
      id: productVariants.id,
      sku: productVariants.sku,
      price: productVariants.price,
      salePrice: productVariants.salePrice,
      inStock: productVariants.inStock,
      colorId: colors.id,
      colorName: colors.name,
      colorSlug: colors.slug,
      colorHex: colors.hexCode,
      sizeId: sizes.id,
      sizeName: sizes.name,
      sizeSlug: sizes.slug,
      sizeOrder: sizes.sortOrder,
    })
    .from(productVariants)
    .leftJoin(colors, eq(colors.id, productVariants.colorId))
    .leftJoin(sizes, eq(sizes.id, productVariants.sizeId))
    .where(eq(productVariants.productId, productId));

  const imageRows = await db
    .select({
      id: productImages.id,
      url: productImages.url,
      sortOrder: productImages.sortOrder,
      isPrimary: productImages.isPrimary,
      variantId: productImages.variantId,
    })
    .from(productImages)
    .where(eq(productImages.productId, productId));

  const productImagesAll = imageRows
    .filter((im) => !im.variantId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((im) => ({ url: im.url, isPrimary: im.isPrimary, sortOrder: im.sortOrder }));

  const imagesByVariant = new Map<string, PDPImage[]>();
  for (const im of imageRows) {
    if (!im.variantId) continue;
    const arr = imagesByVariant.get(im.variantId) || [];
    arr.push({ url: im.url, isPrimary: im.isPrimary, sortOrder: im.sortOrder });
    imagesByVariant.set(im.variantId, arr);
  }
  for (const [k, arr] of imagesByVariant) {
    arr.sort((a, b) => a.sortOrder - b.sortOrder);
    imagesByVariant.set(k, arr);
  }

  const variants: PDPVariant[] = variantRows.map((v) => ({
    id: v.id,
    sku: v.sku,
    price: Number(v.price),
    salePrice: v.salePrice != null ? Number(v.salePrice) : null,
    inStock: v.inStock,
    color: { id: v.colorId!, name: v.colorName!, slug: v.colorSlug!, hexCode: v.colorHex ?? undefined },
    size: { id: v.sizeId!, name: v.sizeName!, slug: v.sizeSlug!, sortOrder: v.sizeOrder ?? undefined },
    images: imagesByVariant.get(v.id) || [],
  }));

  const allPrices = variants.map((v) => Number(v.salePrice ?? v.price)).filter((n) => !Number.isNaN(n));
  const priceRange = {
    min: allPrices.length ? Math.min(...allPrices) : 0,
    max: allPrices.length ? Math.max(...allPrices) : 0,
  };

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    priceRange,
    brand: { id: row.brandId!, name: row.brandName!, slug: row.brandSlug! },
    category: { id: row.categoryId!, name: row.categoryName!, slug: row.categorySlug! },
    gender: { id: row.genderId!, label: row.genderLabel!, slug: row.genderSlug! },
    variants,
    images: productImagesAll,
    defaultVariantId: row.defaultVariantId,
  };
}

export async function getProductReviews(productId: string): Promise<ReviewDTO[]> {
  const rows = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.createdAt));

  const mapped = rows.map((r) => ({
    id: r.id,
    author: "Anonymous",
    rating: r.rating,
    title: undefined,
    content: r.comment || "",
    createdAt: (r.createdAt as unknown as Date)?.toISOString?.() ?? new Date(r.createdAt as unknown as string).toISOString(),
  }));

  if (mapped.length) return mapped;

  return [
    {
      id: "dummy-1",
      author: "Anonymous",
      rating: 5,
      title: "Great quality",
      content: "Comfortable fit and looks amazing.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "dummy-2",
      author: "Anonymous",
      rating: 4,
      title: "Good value",
      content: "Solid shoes, sizing runs a bit small.",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];
}

export async function getRecommendedProducts(productId: string): Promise<RecommendedProduct[]> {
  const [p] = await db
    .select({
      id: products.id,
      categoryId: products.categoryId,
      brandId: products.brandId,
      genderId: products.genderId,
    })
    .from(products)
    .where(eq(products.id, productId));
  if (!p) return [];

  const priceExpr = sql<number>`coalesce(${productVariants.salePrice}, ${productVariants.price})`;
  const imageExpr = sql<string | null>`
    coalesce(
      max(case when ${productImages.isPrimary} = true then ${productImages.url} end),
      max(${productImages.url})
    )
  `;

  const rows = await db
    .select({
      id: products.id,
      title: products.name,
      categoryName: categories.name,
      price: sql<number>`min(${priceExpr})`,
      imageUrl: imageExpr,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(productVariants, eq(productVariants.productId, products.id))
    .leftJoin(productImages, eq(productImages.productId, products.id))
    .where(
      and(
        eq(products.isPublished, true),
        eq(products.categoryId, p.categoryId),
        eq(products.brandId, p.brandId),
        eq(products.genderId, p.genderId),
        sql`${products.id} != ${p.id}`
      )
    )
    .groupBy(products.id, products.name, categories.name)
    .orderBy(desc(products.createdAt))
    .limit(6);

  return rows
    .map((r) => ({
      id: r.id,
      title: r.title,
      price: Number(r.price ?? 0),
      image: r.imageUrl || null,
      category: r.categoryName || "",
    }))
    .filter((r) => !r.image || (typeof r.image === "string" && r.image.trim().length > 0))
    .slice(0, 6);
}
