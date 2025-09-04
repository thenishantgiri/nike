"use server";

import { db } from "@/lib/db";
import {
  brands,
  categories,
  productImages,
  products,
  productVariants,
  reviews,
  sizes,
  rooms,
  materials,
  finishes,
  collections,
  productCollections,
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

// ProductListItem used by PLP and latest products widgets
// finishCount: how many distinct finishes exist across variants for the product
export type ProductListItem = {
  id: string;
  name: string;
  brand: { id: string; name: string; slug: string };
  category: { id: string; name: string; slug: string };
  room?: { id: string; name: string; slug: string } | null;
  minPrice: number;
  maxPrice: number;
  finishCount: number;
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
  room?: string;
  materials?: string[];
  finishes?: string[];
  collections?: string[];
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
  finish: { id: string; name: string; slug: string; hexCode?: string | null };
  size?: { id: string; name: string; slug: string; sortOrder?: number | null } | null;
  price: number;
  salePrice?: number | null;
  inStock: number;
  weight?: number | null;
  dimensions?: { length: number; width: number; height: number } | null;
  images: PDPImage[];
};
export type PDPProduct = {
  id: string;
  name: string;
  description?: string | null;
  priceRange: { min: number; max: number };
  brand: { id: string; name: string; slug: string };
  category: { id: string; name: string; slug: string };
  room?: { id: string; name: string; slug: string } | null;
  material?: { id: string; name: string; slug: string } | null;
  finish?: { id: string; name: string; slug: string } | null;
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
  if (filters.room) {
    whereAnd.push(
      matchIdOrSlug(products.roomId as unknown as AnyPgColumn, rooms.slug as unknown as AnyPgColumn, filters.room)!
    );
  }

  const priceExpr = sql<number>`coalesce(${productVariants.salePrice}, ${productVariants.price})`;

  if (filters.priceMin != null) {
    whereAnd.push(sql`${priceExpr} >= ${filters.priceMin}`);
  }
  if (filters.priceMax != null) {
    whereAnd.push(sql`${priceExpr} <= ${filters.priceMax}`);
  }

  // no color filter — finishes replace colors in furniture domain

  if (filters.materials && filters.materials.length) {
    const uuids = filters.materials.filter(isUuid);
    const slugs = filters.materials.filter((v) => !isUuid(v));
    const parts: SQL<unknown>[] = [];
    if (uuids.length) parts.push(inArray(products.materialId as unknown as AnyPgColumn, uuids));
    if (slugs.length) parts.push(inArray(materials.slug as unknown as AnyPgColumn, slugs));
    if (parts.length) whereAnd.push(or(...(parts as SQL<unknown>[])) as SQL<unknown>);
  }
  if (filters.finishes && filters.finishes.length) {
    const uuids = filters.finishes.filter(isUuid);
    const slugs = filters.finishes.filter((v) => !isUuid(v));
    const parts: SQL<unknown>[] = [];
    if (uuids.length) parts.push(inArray(products.finishId as unknown as AnyPgColumn, uuids));
    if (slugs.length) parts.push(inArray(finishes.slug as unknown as AnyPgColumn, slugs));
    if (parts.length) whereAnd.push(or(...(parts as SQL<unknown>[])) as SQL<unknown>);
  }
  if (filters.collections && filters.collections.length) {
    const uuids = filters.collections.filter(isUuid);
    const slugs = filters.collections.filter((v) => !isUuid(v));
    const parts: SQL<unknown>[] = [];
    if (uuids.length) parts.push(inArray(productCollections.collectionId as unknown as AnyPgColumn, uuids));
    if (slugs.length) parts.push(inArray(collections.slug as unknown as AnyPgColumn, slugs));
    if (parts.length) whereAnd.push(or(...(parts as SQL<unknown>[])) as SQL<unknown>);
  }

  const orderByExpr =
    filters.sortBy === "price_asc"
      ? asc(sql`min(${priceExpr})`)
      : filters.sortBy === "price_desc"
      ? desc(sql`min(${priceExpr})`)
      : filters.sortBy === "oldest"
      ? asc(products.createdAt)
      : desc(products.createdAt);

  const imageExprWhenFinish = sql<string | null>`
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
      roomId: rooms.id,
      roomName: rooms.name,
      roomSlug: rooms.slug,
      minPrice: sql<number>`min(${priceExpr})`,
      maxPrice: sql<number>`max(${priceExpr})`,
      finishCount: sql<number>`count(distinct ${productVariants.finishId})`,
      imageUrl:
        filters.finishes && filters.finishes.length
          ? imageExprWhenFinish
          : imageExprDefault,
    })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(rooms, eq(products.roomId, rooms.id))
    .leftJoin(materials, eq(products.materialId as unknown as AnyPgColumn, materials.id as unknown as AnyPgColumn))
    .leftJoin(productVariants, eq(productVariants.productId, products.id))
    .leftJoin(productCollections, eq(productCollections.productId, products.id))
    .leftJoin(collections, eq(productCollections.collectionId, collections.id))
    .leftJoin(finishes, eq(finishes.id, productVariants.finishId))
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
      rooms.id,
      rooms.name,
      rooms.slug
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
    .leftJoin(rooms, eq(products.roomId, rooms.id))
    .leftJoin(materials, eq(products.materialId as unknown as AnyPgColumn, materials.id as unknown as AnyPgColumn))
    .leftJoin(productVariants, eq(productVariants.productId, products.id))
    .leftJoin(productCollections, eq(productCollections.productId, products.id))
    .leftJoin(collections, eq(productCollections.collectionId, collections.id))
    .leftJoin(finishes, eq(finishes.id, productVariants.finishId))
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
    room: r.roomId ? { id: r.roomId!, name: r.roomName!, slug: r.roomSlug! } : null,
    minPrice: Number(r.minPrice ?? 0),
    maxPrice: Number(r.maxPrice ?? 0),
    finishCount: Number(r.finishCount ?? 0),
    imageUrl: r.imageUrl ?? null,
  }));

  return { products: mapped, totalCount: Number(count) };
}

export async function getProduct(
  productId: string
): Promise<PDPProduct | null> {
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
      roomId: rooms.id,
      roomName: rooms.name,
      roomSlug: rooms.slug,
      materialId: materials.id,
      materialName: materials.name,
      materialSlug: materials.slug,
      finishId: finishes.id,
      finishName: finishes.name,
      finishSlug: finishes.slug,
    })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(rooms, eq(products.roomId, rooms.id))
    .leftJoin(materials, eq(products.materialId as unknown as AnyPgColumn, materials.id as unknown as AnyPgColumn))
    .leftJoin(finishes, eq(products.finishId as unknown as AnyPgColumn, finishes.id as unknown as AnyPgColumn))
    .where(eq(products.id, productId));

  if (!row) return null;

  const variantRows = await db
    .select({
      id: productVariants.id,
      sku: productVariants.sku,
      price: productVariants.price,
      salePrice: productVariants.salePrice,
      inStock: productVariants.inStock,
      weight: productVariants.weight,
      dimensions: productVariants.dimensions,
      finishId: finishes.id,
      finishName: finishes.name,
      finishSlug: finishes.slug,
      finishHex: finishes.hexCode,
      sizeId: sizes.id,
      sizeName: sizes.name,
      sizeSlug: sizes.slug,
      sizeOrder: sizes.sortOrder,
    })
    .from(productVariants)
    .leftJoin(finishes, eq(finishes.id, productVariants.finishId))
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
    .map((im) => ({
      url: im.url,
      isPrimary: im.isPrimary,
      sortOrder: im.sortOrder,
    }));

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
    weight: (v.weight as number | null) ?? null,
    dimensions: (v.dimensions as { length: number; width: number; height: number } | null) ?? null,
    finish: {
      id: v.finishId!,
      name: v.finishName!,
      slug: v.finishSlug!,
      hexCode: (v.finishHex as string | null) ?? undefined,
    },
    size: v.sizeId
      ? {
          id: v.sizeId,
          name: v.sizeName!,
          slug: v.sizeSlug!,
          sortOrder: v.sizeOrder ?? undefined,
        }
      : null,
    images: imagesByVariant.get(v.id) || [],
  }));

  const allPrices = variants
    .map((v) => Number(v.salePrice ?? v.price))
    .filter((n) => !Number.isNaN(n));
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
    category: {
      id: row.categoryId!,
      name: row.categoryName!,
      slug: row.categorySlug!,
    },
    room: row.roomId ? { id: row.roomId!, name: row.roomName!, slug: row.roomSlug! } : null,
    material: row.materialId ? { id: row.materialId!, name: row.materialName!, slug: row.materialSlug! } : null,
    finish: row.finishId ? { id: row.finishId!, name: row.finishName!, slug: row.finishSlug! } : null,
    variants,
    images: productImagesAll,
    defaultVariantId: row.defaultVariantId,
  };
}

export async function getProductReviews(
  productId: string
): Promise<ReviewDTO[]> {
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
    createdAt:
      (r.createdAt as unknown as Date)?.toISOString?.() ??
      new Date(r.createdAt as unknown as string).toISOString(),
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

export async function getRecommendedProducts(
  productId: string
): Promise<RecommendedProduct[]> {
  const [p] = await db
    .select({
      id: products.id,
      categoryId: products.categoryId,
      brandId: products.brandId,
      roomId: products.roomId,
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

  const whereConds: SQL[] = [
    eq(products.isPublished, true),
    eq(products.categoryId, p.categoryId),
    eq(products.brandId, p.brandId),
    sql`${products.id} != ${p.id}`,
  ];
  if (p.roomId) {
    whereConds.push(eq(products.roomId, p.roomId));
  }

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
    .where(and(...whereConds))
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
    .filter(
      (r) =>
        !r.image || (typeof r.image === "string" && r.image.trim().length > 0)
    )
    .slice(0, 6);
}

export async function getLatestProducts(): Promise<ProductWithAggregates[]> {
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
      minPrice: sql<number>`min(${productVariants.salePrice}, ${productVariants.price})`,
      maxPrice: sql<number>`max(${productVariants.salePrice}, ${productVariants.price})`,
      finishCount: sql<number>`count(distinct ${productVariants.finishId})`,
      imageUrl: sql<string | null>`
        coalesce(
          max(case when ${productImages.isPrimary} = true then ${productImages.url} end),
          max(${productImages.url})
        )
      `,
    })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(productVariants, eq(productVariants.productId, products.id))
    .leftJoin(productCollections, eq(productCollections.productId, products.id))
    .leftJoin(collections, eq(productCollections.collectionId, collections.id))
    .leftJoin(finishes, eq(finishes.id, productVariants.finishId))
    .leftJoin(sizes, eq(sizes.id, productVariants.sizeId))
    .leftJoin(productImages, eq(productImages.productId, products.id))
    .where(eq(products.isPublished, true))
    .orderBy(desc(products.createdAt))
    .limit(6);

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    brand: { id: r.brandId!, name: r.brandName!, slug: r.brandSlug! },
    category: {
      id: r.categoryId!,
      name: r.categoryName!,
      slug: r.categorySlug!,
    },
    minPrice: Number(r.minPrice ?? 0),
    maxPrice: Number(r.maxPrice ?? 0),
    finishCount: Number(r.finishCount ?? 0),
    imageUrl: r.imageUrl ?? null,
  }));
}
