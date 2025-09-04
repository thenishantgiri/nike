import { eq } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import { db } from "./index";
import {
  brands,
  categories,
  collections,
  finishes,
  materials,
  productCollections,
  productImages,
  products,
  productVariants,
  rooms,
  sizes,
} from "./schema";

const STATIC_UPLOADS_DIR = path.join(process.cwd(), "static", "uploads");

function ensureStaticUploadsDir() {
  if (!fs.existsSync(STATIC_UPLOADS_DIR)) {
    fs.mkdirSync(STATIC_UPLOADS_DIR, { recursive: true });
    console.log("Created static/uploads directory");
  }
}

function copyImageToStatic(sourceImagePath: string, fileName: string): string {
  // Read directly from /public (no shoe subfolder). If the file doesn't
  // exist, fall back to /feature.png in /public.
  const sourcePath = path.join(process.cwd(), "public", sourceImagePath);
  const destPath = path.join(STATIC_UPLOADS_DIR, fileName);
  try {
    fs.copyFileSync(sourcePath, destPath);
    return `/static/uploads/${fileName}`;
  } catch {
    // Fallback to a generic furniture placeholder
    const fallback = path.join(process.cwd(), "public", "feature.png");
    try {
      fs.copyFileSync(fallback, destPath);
      return `/static/uploads/${fileName}`;
    } catch {
      return `/feature.png`;
    }
  }
}

export async function seed() {
  console.log("Starting furniture database seed...");
  ensureStaticUploadsDir();

  try {
    // Brand
    const brandRows = await db
      .insert(brands)
      .values([{ name: "Acme Home", slug: "acme-home", logoUrl: "/logo.svg" }])
      .returning()
      .catch(async () => await db.select().from(brands));
    const brand = brandRows[0]!;

    // No colors table usage; finishes hold swatches

    // Rooms
    const roomRows = await db
      .insert(rooms)
      .values([
        { name: "Living Room", slug: "living-room" },
        { name: "Bedroom", slug: "bedroom" },
        { name: "Dining Room", slug: "dining-room" },
        { name: "Office", slug: "office" },
      ])
      .returning()
      .catch(async () => await db.select().from(rooms));
    const roomBySlug: Record<string, string> = {};
    for (const r of roomRows) roomBySlug[r.slug] = r.id;

    // Materials
    const materialRows = await db
      .insert(materials)
      .values([
        { name: "Solid Wood", slug: "solid-wood" },
        { name: "Metal", slug: "metal" },
        { name: "Glass", slug: "glass" },
        { name: "Fabric", slug: "fabric" },
        { name: "Leather", slug: "leather" },
      ])
      .returning()
      .catch(async () => await db.select().from(materials));
    const materialBySlug: Record<string, string> = {};
    for (const m of materialRows) materialBySlug[m.slug] = m.id;

    // Finishes
    const finishRows = await db
      .insert(finishes)
      .values([
        { name: "Natural Oak", slug: "natural-oak", hexCode: "#D2B48C" },
        { name: "Walnut", slug: "walnut", hexCode: "#5D3A1A" },
        { name: "Matte Black", slug: "matte-black", hexCode: "#222222" },
        { name: "Matte White", slug: "matte-white", hexCode: "#F5F5F5" },
        { name: "Smoked", slug: "smoked", hexCode: "#6B6B6B" },
      ])
      .returning()
      .catch(async () => await db.select().from(finishes));
    const finishBySlug: Record<string, string> = {};
    for (const f of finishRows) finishBySlug[f.slug] = f.id;

    // Categories
    const categoryRows = await db
      .insert(categories)
      .values([
        { name: "Sofas", slug: "sofas" },
        { name: "Tables", slug: "tables" },
        { name: "Chairs", slug: "chairs" },
        { name: "Beds", slug: "beds" },
        { name: "Storage", slug: "storage" },
      ])
      .returning()
      .catch(async () => await db.select().from(categories));
    const categoryBySlug: Record<string, string> = {};
    for (const c of categoryRows) categoryBySlug[c.slug] = c.id;

    // Collections
    const collectionRows = await db
      .insert(collections)
      .values([
        { name: "Modern Living", slug: "modern-living" },
        { name: "Scandinavian", slug: "scandinavian" },
        { name: "New Arrivals", slug: "new-arrivals" },
      ])
      .returning()
      .catch(async () => await db.select().from(collections));
    const collectionBySlug: Record<string, string> = {};
    for (const c of collectionRows) collectionBySlug[c.slug] = c.id;

    // Ensure a compatible size exists (variants support optional size)
    const sizeRows = await db
      .insert(sizes)
      .values([{ name: "Standard", slug: "standard", sortOrder: 1 }])
      .returning()
      .catch(async () => await db.select().from(sizes));
    // Prefer the 'standard' size if present, otherwise fallback to first
    const std = sizeRows.find((s) => (s.slug as string) === "standard");
    const sizeId = (std?.id || sizeRows[0]?.id) as string;

    // Products
    type PInput = {
      name: string;
      description: string;
      categorySlug: string;
      roomSlug: string;
      materialSlug: string;
      finishSlug: string;
      images: string[];
      collectionSlug: string;
      variantFinishSlugs: string[];
    };
    const productsInput: PInput[] = [
      {
        name: "Modern Fabric Sofa",
        description:
          "Comfortable 3-seater sofa with solid wood frame and plush cushions.",
        categorySlug: "sofas",
        roomSlug: "living-room",
        materialSlug: "solid-wood",
        finishSlug: "natural-oak",
        images: ["trending-1.png", "trending-2.png", "trending-3.png"],
        collectionSlug: "modern-living",
        variantFinishSlugs: ["natural-oak", "walnut"],
      },
      {
        name: "Oak Dining Table",
        description: "Rectangular solid oak dining table for six.",
        categorySlug: "tables",
        roomSlug: "dining-room",
        materialSlug: "solid-wood",
        finishSlug: "natural-oak",
        images: ["trending-2.png", "trending-3.png", "feature.png"],
        collectionSlug: "scandinavian",
        variantFinishSlugs: ["natural-oak", "matte-black"],
      },
      {
        name: "Minimalist Armchair",
        description: "Upholstered armchair with powder-coated metal legs.",
        categorySlug: "chairs",
        roomSlug: "living-room",
        materialSlug: "solid-wood",
        finishSlug: "smoked",
        images: ["feature.png", "trending-1.png", "trending-2.png"],
        collectionSlug: "new-arrivals",
        variantFinishSlugs: ["smoked", "matte-white"],
      },
      {
        name: "Walnut Bed Frame",
        description: "Solid walnut platform bed with headboard.",
        categorySlug: "beds",
        roomSlug: "bedroom",
        materialSlug: "solid-wood",
        finishSlug: "walnut",
        images: ["trending-3.png", "trending-2.png", "feature.png"],
        collectionSlug: "modern-living",
        variantFinishSlugs: ["walnut", "matte-white"],
      },
      {
        name: "Oak Sideboard",
        description: "Spacious oak sideboard with soft-close doors.",
        categorySlug: "storage",
        roomSlug: "living-room",
        materialSlug: "solid-wood",
        finishSlug: "natural-oak",
        images: ["feature.png", "trending-1.png", "trending-2.png"],
        collectionSlug: "scandinavian",
        variantFinishSlugs: ["natural-oak", "smoked"],
      },
    ];

    const insertedProducts: Array<{
      id: string;
      name: string;
      images: string[];
      variantFinishSlugs: string[];
      collectionSlug: string;
    }> = [];
    for (const p of productsInput) {
      const [prod] = await db
        .insert(products)
        .values({
          name: p.name,
          description: p.description,
          categoryId: categoryBySlug[p.categorySlug],
          brandId: brand.id,
          isPublished: true,
          roomId: roomBySlug[p.roomSlug],
          materialId: materialBySlug[p.materialSlug],
          finishId: finishBySlug[p.finishSlug],
        })
        .returning();
      insertedProducts.push({
        id: prod.id,
        name: p.name,
        images: p.images,
        variantFinishSlugs: p.variantFinishSlugs,
        collectionSlug: p.collectionSlug,
      });
    }

    // Create variants per product
    const allVariants = [];
    for (const p of insertedProducts) {
      let idx = 0;
      for (const finishSlug of p.variantFinishSlugs) {
        const basePrice = 500 + Math.floor(Math.random() * 800);
        const salePrice =
          Math.random() < 0.3 ? Math.floor(basePrice * 0.9) : null;
        const sku = `${p.name
          .replace(/\s+/g, "-")
          .toLowerCase()}-${finishSlug}`;
        const inserted = await db
          .insert(productVariants)
          .values({
            productId: p.id,
            sku,
            price: String(basePrice),
            salePrice: salePrice ? String(salePrice) : null,
            finishId: finishBySlug[finishSlug],
            sizeId: sizeId,
            inStock: 5 + Math.floor(Math.random() * 12),
            weight: 30 + Math.random() * 70,
            dimensions: {
              length: 60 + Math.random() * 30,
              width: 20 + Math.random() * 20,
              height: 20 + Math.random() * 20,
            },
            shippingClass: idx === 0 ? "ltl" : "parcel",
          })
          // Prevent duplicate variants when reseeding
          .onConflictDoNothing({ target: productVariants.sku })
          .returning();
        const variant = inserted[0]
          ? inserted[0]
          : (
              await db
                .select()
                .from(productVariants)
                .where(eq(productVariants.sku, sku))
                .limit(1)
            )[0];
        if (variant) allVariants.push(variant);
        idx++;
      }
    }

    // Product-level images
    for (const p of insertedProducts) {
      for (let i = 0; i < Math.min(3, p.images.length); i++) {
        const url = copyImageToStatic(
          p.images[i],
          `${p.id}-p-${i}-${p.images[i]}`
        );
        await db.insert(productImages).values({
          productId: p.id,
          variantId: null,
          url,
          sortOrder: i,
          isPrimary: i === 0,
        });
      }
    }

    // Variant-level images: seed 3 images for the first finish of each product, and 2 for others
    const firstVariantByProduct = new Map<string, string>();
    for (const v of allVariants) {
      if (!firstVariantByProduct.has(v.productId as string)) {
        firstVariantByProduct.set(v.productId as string, v.id as string);
      }
    }
    for (const v of allVariants) {
      const firstId = firstVariantByProduct.get(v.productId as string);
      const count = v.id === firstId ? 3 : 2;
      for (let i = 0; i < count; i++) {
        const fname = i % 2 === 0 ? "trending-2.png" : "trending-3.png";
        const url = copyImageToStatic(fname, `${v.id}-v-${i}-${fname}`);
        await db.insert(productImages).values({
          productId: v.productId,
          variantId: v.id,
          url,
          sortOrder: i,
          isPrimary: i === 0,
        });
      }
    }

    // Default variant per product
    for (const p of insertedProducts) {
      const [firstVar] = allVariants.filter((v) => v.productId === p.id);
      if (firstVar) {
        await db
          .update(products)
          .set({ defaultVariantId: firstVar.id })
          .where(eq(products.id, p.id));
      }
    }

    // Collections mapping
    for (const p of insertedProducts) {
      await db.insert(productCollections).values({
        productId: p.id,
        collectionId: collectionBySlug[p.collectionSlug],
      });
    }

    console.log("Furniture seed completed successfully");
  } catch (error) {
    console.error("Seed failed:", error);
    throw error;
  }
}

if (require.main === module) {
  seed()
    .then(() => {
      console.log("Seed script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seed script failed:", error);
      process.exit(1);
    });
}
