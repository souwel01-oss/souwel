import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { CATEGORIES } from "../lib/site-config";
import { PRODUCTS } from "../lib/product-data";

/**
 * Seeds ONLY the catalogue: the four categories and every product that has a
 * public page.
 *
 * WHY THIS EXISTS ALONGSIDE seed.ts. `prisma/seed.ts` is a development
 * fixture — it creates test customers, sample quotes and orders so the CRM has
 * something to render locally. None of that belongs in production: a real
 * pipeline with invented customers in it is worse than an empty one, because
 * staff cannot tell which rows are real.
 *
 * This script creates no users, no quotes and no orders. It is safe to run
 * against production, and it is REQUIRED there: `QuoteItem.productId` is a
 * foreign key to `Product`, so a quote request naming "terry-towels" cannot be
 * written at all until that row exists. Without this the entire request-a-quote
 * flow fails at the database, not in the form.
 *
 * The source of truth is `lib/product-data.ts` — the same file the public
 * product pages render from. Deriving both from one place is the point: a
 * catalogue in the database that disagreed with the catalogue on the site would
 * surface as a quote request for a product the customer never saw.
 *
 * Idempotent. Upserts on the natural unique key (`slug`), so re-running after
 * adding a product adds only that product.
 */

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const categoryIdBySlug = new Map<string, string>();

  for (const [index, category] of CATEGORIES.entries()) {
    const row = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        heroImageUrl: `/images/categories/${category.slug}.jpg`,
        sortOrder: index + 1,
      },
      create: {
        slug: category.slug,
        name: category.name,
        description: category.description,
        heroImageUrl: `/images/categories/${category.slug}.jpg`,
        sortOrder: index + 1,
      },
      select: { id: true },
    });
    categoryIdBySlug.set(category.slug, row.id);
  }
  console.log(`categories: ${categoryIdBySlug.size}`);

  const products = Object.values(PRODUCTS);
  let written = 0;

  for (const [index, product] of products.entries()) {
    const categoryId = categoryIdBySlug.get(product.categorySlug);
    if (!categoryId) {
      // A product pointing at a category that does not exist is a content bug,
      // and skipping it silently would hide it. Fail loudly instead.
      throw new Error(
        `Product "${product.slug}" references unknown category "${product.categorySlug}".`
      );
    }

    const data = {
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription,
      heroImageUrl: product.heroImageUrl,
      galleryImageUrls: product.galleryImageUrls.map((g) => g.src),
      categoryId,
      // Published because the page is already live and linked from the nav.
      isPublished: true,
      sortOrder: index + 1,
    };

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: data,
      create: { slug: product.slug, ...data },
    });
    written += 1;
  }

  console.log(`products: ${written}`);

  /**
   * Retire anything the catalogue no longer lists.
   *
   * UNPUBLISHED, NEVER DELETED. `QuoteItem.productId` is a required foreign key
   * to Product, so deleting a row that any customer has ever asked us to price
   * would either fail or take their quote history with it. Unpublishing keeps
   * the record intact and takes it out of circulation.
   *
   * This exists because the catalogue was replaced wholesale: the twenty-four
   * placeholder products the site launched with are not in the client's real
   * product sheet, and an upsert-only seed leaves them sitting in the database
   * marked published forever.
   */
  const slugs = products.map((p) => p.slug);
  const retired = await prisma.product.updateMany({
    where: { slug: { notIn: slugs }, isPublished: true },
    data: { isPublished: false },
  });
  if (retired.count > 0) {
    console.log(`retired (unpublished, not deleted): ${retired.count}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
