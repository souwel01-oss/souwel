import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

/**
 * Seeds the four fixed categories, a sample product catalog, and the test
 * accounts described in specs/001-b2b-textile-portal-crm/quickstart.md.
 *
 * Idempotent — safe to re-run. Uses upsert keyed on natural unique fields.
 *
 * NOTE: user records here are created WITHOUT credentials. Better Auth owns
 * password hashing (Phase 4, T045). Until then these exist so CRM/portal work
 * has customers to attach to; set passwords via the Better Auth sign-up flow.
 */

const CATEGORIES = [
  {
    slug: "hospitality",
    name: "Hospitality",
    description:
      "Bed linen, towels, and table textiles engineered for hotels, resorts, and food service.",
    sortOrder: 1,
  },
  {
    slug: "health-care",
    name: "Health-Care",
    description:
      "Medical-grade textiles for hospitals and clinics, built for repeated high-temperature laundering.",
    sortOrder: 2,
  },
  {
    slug: "institutional-laundry",
    name: "Institutional/Laundry",
    description:
      "High-durability textiles specified for industrial laundry cycles and institutional volume.",
    sortOrder: 3,
  },
  {
    slug: "commercial-automotive",
    name: "Commercial/Automotive",
    description:
      "Technical fabrics and upholstery textiles for commercial fit-out and automotive interiors.",
    sortOrder: 4,
  },
];

const PRODUCTS = [
  {
    slug: "percale-hotel-bed-linen",
    name: "Percale Hotel Bed Linen",
    categorySlug: "hospitality",
    shortDescription: "300TC cotton percale sheeting with reinforced hems.",
    description:
      "A crisp, breathable percale weave built for high-turnover hospitality laundering. Reinforced double-stitched hems resist fraying through industrial wash cycles, and the long-staple cotton retains hand-feel well beyond typical replacement intervals.",
    specifications: {
      Composition: "100% long-staple cotton",
      "Thread Count": "300TC percale",
      Weight: "125 gsm",
      Finish: "Mercerised, pre-shrunk",
      "Wash Cycles": "200+ industrial",
    },
  },
  {
    slug: "terry-bath-towel-collection",
    name: "Terry Bath Towel Collection",
    categorySlug: "hospitality",
    shortDescription: "600 gsm ring-spun terry with dobby border.",
    description:
      "Dense ring-spun terry engineered for absorbency and drying speed in commercial settings. The woven dobby border holds shape under repeated tumble-drying.",
    specifications: {
      Composition: "100% ring-spun cotton",
      Weight: "600 gsm",
      Border: "Woven dobby",
      Sizes: "Face, hand, bath, bath sheet",
    },
  },
  {
    slug: "banquet-table-linen",
    name: "Banquet Table Linen",
    categorySlug: "hospitality",
    shortDescription: "Stain-resistant poly-cotton banqueting cloth.",
    description:
      "A poly-cotton blend balancing drape with soil release, specified for banqueting and conference service where fast turnaround matters.",
    specifications: {
      Composition: "55% polyester / 45% cotton",
      Weight: "220 gsm",
      Finish: "Soil-release treated",
    },
  },
  {
    slug: "antimicrobial-patient-gown",
    name: "Antimicrobial Patient Gown",
    categorySlug: "health-care",
    shortDescription: "Barrier-treated gown fabric for clinical use.",
    description:
      "Woven poly-cotton with a durable antimicrobial finish retained across high-temperature laundering, specified for inpatient and day-surgery environments.",
    specifications: {
      Composition: "65% polyester / 35% cotton",
      Weight: "150 gsm",
      Treatment: "Durable antimicrobial finish",
      "Wash Temperature": "Up to 90°C",
    },
  },
  {
    slug: "healthcare-bed-sheeting",
    name: "Health-Care Bed Sheeting",
    categorySlug: "health-care",
    shortDescription: "Thermal-stable sheeting for clinical laundering.",
    description:
      "Dimensionally stable sheeting that resists shrinkage through repeated thermal disinfection cycles required in clinical settings.",
    specifications: {
      Composition: "50% polyester / 50% cotton",
      Weight: "145 gsm",
      Shrinkage: "< 2% after 50 cycles",
    },
  },
  {
    slug: "industrial-laundry-bag",
    name: "Industrial Laundry Bag",
    categorySlug: "institutional-laundry",
    shortDescription: "Heavy-duty tunnel-washer-rated bagging.",
    description:
      "Reinforced bagging engineered for continuous batch tunnel washers, with seam construction rated for full-load lifting.",
    specifications: {
      Composition: "100% polyester",
      Weight: "200 gsm",
      Seams: "Bar-tacked, load-rated",
    },
  },
  {
    slug: "institutional-blanket",
    name: "Institutional Blanket",
    categorySlug: "institutional-laundry",
    shortDescription: "Flame-retardant institutional blanket.",
    description:
      "A flame-retardant blanket meeting institutional safety specification, with a napped finish that survives industrial laundering without matting.",
    specifications: {
      Composition: "100% modacrylic",
      Weight: "450 gsm",
      Certification: "Flame-retardant to institutional spec",
    },
  },
  {
    slug: "automotive-upholstery-fabric",
    name: "Automotive Upholstery Fabric",
    categorySlug: "commercial-automotive",
    shortDescription: "Abrasion-rated upholstery for vehicle interiors.",
    description:
      "A high-abrasion woven upholstery textile with UV stability, specified for commercial vehicle and fleet interior applications.",
    specifications: {
      Composition: "100% solution-dyed polyester",
      Weight: "320 gsm",
      Abrasion: "100,000+ Martindale cycles",
      "UV Stability": "Grade 7",
    },
  },
];

const TEST_USERS = [
  { email: "admin@example.test", name: "Admin User", role: Role.ADMIN },
  { email: "sales@example.test", name: "Sales User", role: Role.SALES },
  {
    email: "customer-a@example.test",
    name: "Customer A",
    role: Role.CUSTOMER,
    profile: {
      companyName: "Northgate Hotels Group",
      contactName: "Customer A",
      phone: "+1 555 0100",
    },
  },
  {
    email: "customer-b@example.test",
    name: "Customer B",
    role: Role.CUSTOMER,
    profile: {
      companyName: "Meridian Health Trust",
      contactName: "Customer B",
      phone: "+1 555 0200",
    },
  },
];

// Placeholder image until real Cloudinary assets are uploaded (T084).
const PLACEHOLDER_IMAGE = "/placeholder-product.svg";

async function main() {
  console.log("Seeding categories...");
  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  console.log("Seeding products...");
  for (const [index, product] of PRODUCTS.entries()) {
    const { categorySlug, ...rest } = product;
    const category = await prisma.category.findUniqueOrThrow({ where: { slug: categorySlug } });

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        ...rest,
        categoryId: category.id,
        isPublished: true,
        sortOrder: index,
        heroImageUrl: PLACEHOLDER_IMAGE,
      },
      create: {
        ...rest,
        categoryId: category.id,
        isPublished: true,
        sortOrder: index,
        heroImageUrl: PLACEHOLDER_IMAGE,
      },
    });
  }

  console.log("Seeding test users...");
  for (const user of TEST_USERS) {
    const { profile, ...userData } = user;

    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: { name: userData.name, role: userData.role },
      create: { ...userData, emailVerified: true },
    });

    if (profile) {
      await prisma.customerProfile.upsert({
        where: { userId: created.id },
        update: profile,
        create: { ...profile, userId: created.id },
      });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
