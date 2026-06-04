import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const categories = [
  {
    slug: "living-room",
    label: "Living Room",
    headline: "Comfort for everyday living",
    description: "Sofas, armchairs, and coffee tables for modern homes.",
    seoDescription: "Explore living room furniture from BlockNest.",
    heroImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1400&q=85&fit=crop",
    heroAlt: "Modern living room furniture",
    ogImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80&fit=crop",
  },
  {
    slug: "bedroom",
    label: "Bedroom",
    headline: "Restful and timeless",
    description: "Beds, bedside tables, and storage with calm Scandinavian style.",
    seoDescription: "Discover bedroom furniture from BlockNest.",
    heroImage: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1400&q=85&fit=crop",
    heroAlt: "Minimalist bedroom furniture",
    ogImage: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80&fit=crop",
  },
  {
    slug: "dining",
    label: "Dining",
    headline: "Built for gathering",
    description: "Dining tables and chairs crafted for comfort and durability.",
    seoDescription: "Shop dining furniture from BlockNest.",
    heroImage: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1400&q=85&fit=crop",
    heroAlt: "Dining furniture set",
    ogImage: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1200&q=80&fit=crop",
  },
  {
    slug: "office",
    label: "Office",
    headline: "Home Office Furniture",
    description: "A workspace that helps you focus. Desks, chairs, and storage.",
    seoDescription: "Norr home office furniture — minimalist desks and ergonomic chairs.",
    heroImage: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1400&q=85&fit=crop",
    heroAlt: "Clean Scandinavian home office",
    ogImage: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1200&q=80&fit=crop",
  },
  {
    slug: "outdoor",
    label: "Outdoor",
    headline: "Outdoor Furniture",
    description: "Furniture for outside that feels as considered as inside.",
    seoDescription: "Norr outdoor furniture — teak and steel pieces for garden and terrace.",
    heroImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=85&fit=crop",
    heroAlt: "Sunny garden terrace with outdoor furniture",
    ogImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&fit=crop",
  },
  {
    slug: "sale",
    label: "Sale",
    headline: "Sale — Up to 40% Off",
    description: "End-of-season pieces at reduced prices. Same quality, less cost.",
    seoDescription: "Norr furniture sale — up to 40% off selected pieces.",
    heroImage: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1400&q=85&fit=crop",
    heroAlt: "Sale furniture pieces",
    ogImage: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80&fit=crop",
  },
];

const products = [
  // ── Living Room ──
  { slug: "saga-modular-sofa", name: "Saga Modular Sofa", subCategory: "Sofa", price: "3200.00", rating: "4.60", reviewCount: 142, isNew: false, stockQuantity: 12, categorySlug: "living-room", image: { imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80&fit=crop", imageAlt: "Saga modular sofa in natural linen" } },
  { slug: "fjord-lounge-chair", name: "Fjord Lounge Chair", subCategory: "Armchair", price: "1290.00", rating: "4.80", reviewCount: 124, isNew: true, stockQuantity: 18, categorySlug: "living-room", image: { imageUrl: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&q=80&fit=crop", imageAlt: "Fjord lounge chair with walnut legs" } },
  { slug: "eken-coffee-table", name: "Eken Coffee Table", subCategory: "Table", price: "590.00", rating: "4.80", reviewCount: 67, isNew: true, stockQuantity: 15, categorySlug: "living-room", image: { imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80&fit=crop&crop=bottom", imageAlt: "Eken coffee table with travertine top" } },
  { slug: "nord-bookshelf", name: "Nord Bookshelf", subCategory: "Storage", price: "780.00", rating: "4.50", reviewCount: 98, isNew: false, stockQuantity: 10, categorySlug: "living-room", image: { imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80&fit=crop", imageAlt: "Nord open-back bookshelf in birch plywood" } },
  { slug: "tove-pendant-light", name: "Tove Pendant Light", subCategory: "Lighting", price: "320.00", rating: "4.70", reviewCount: 203, isNew: false, stockQuantity: 25, categorySlug: "living-room", image: { imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80&fit=crop", imageAlt: "Tove pendant light with opal glass globe" } },
  { slug: "alva-side-table", name: "Alva Side Table", subCategory: "Table", price: "280.00", rating: "4.40", reviewCount: 55, isNew: false, stockQuantity: 20, categorySlug: "living-room", image: { imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80&fit=crop&crop=right", imageAlt: "Alva side table in solid ash wood" } },

  // ── Bedroom ──
  { slug: "lund-bed-frame", name: "Lund Bed Frame", subCategory: "Bed", price: "1890.00", rating: "4.90", reviewCount: 56, isNew: true, stockQuantity: 9, categorySlug: "bedroom", image: { imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80&fit=crop", imageAlt: "Lund low-profile platform bed in smoked oak" } },
  { slug: "hagen-bedside-table", name: "Hagen Bedside Table", subCategory: "Bedside Table", price: "310.00", rating: "4.60", reviewCount: 89, isNew: false, stockQuantity: 22, categorySlug: "bedroom", image: { imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80&fit=crop&crop=right", imageAlt: "Hagen bedside table in natural oak" } },
  { slug: "nora-wardrobe", name: "Nora Wardrobe", subCategory: "Storage", price: "2100.00", rating: "4.70", reviewCount: 41, isNew: false, stockQuantity: 5, categorySlug: "bedroom", image: { imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80&fit=crop", imageAlt: "Nora two-door wardrobe in white lacquer" } },
  { slug: "berg-blanket-chest", name: "Berg Blanket Chest", subCategory: "Storage", price: "490.00", rating: "4.50", reviewCount: 32, isNew: true, stockQuantity: 14, categorySlug: "bedroom", image: { imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80&fit=crop&crop=bottom", imageAlt: "Berg blanket chest in natural linen finish" } },

  // ── Dining ──
  { slug: "holm-dining-table", name: "Holm Dining Table", subCategory: "Table", price: "2450.00", rating: "4.90", reviewCount: 87, isNew: false, stockQuantity: 7, categorySlug: "dining", image: { imageUrl: "https://images.unsplash.com/photo-1549497538-303791108f95?w=600&q=80&fit=crop", imageAlt: "Holm dining table in solid white oak" } },
  { slug: "ris-dining-chair", name: "Ris Dining Chair", subCategory: "Chair", price: "380.00", rating: "4.70", reviewCount: 116, isNew: false, stockQuantity: 30, categorySlug: "dining", image: { imageUrl: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&q=80&fit=crop", imageAlt: "Ris dining chair in upholstered stone linen" } },
  { slug: "sel-bar-stool", name: "Sel Bar Stool", subCategory: "Stool", price: "260.00", rating: "4.50", reviewCount: 63, isNew: true, stockQuantity: 24, categorySlug: "dining", image: { imageUrl: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&q=80&fit=crop&crop=right", imageAlt: "Sel bar stool in natural ash with footrest" } },
  { slug: "klar-sideboard", name: "Klar Sideboard", subCategory: "Storage", price: "1640.00", rating: "4.80", reviewCount: 49, isNew: false, stockQuantity: 6, categorySlug: "dining", image: { imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80&fit=crop", imageAlt: "Klar low sideboard in oiled walnut" } },

  // ── Office ──
  { slug: "birk-desk-chair", name: "Birk Desk Chair", subCategory: "Chair", price: "640.00", rating: "4.70", reviewCount: 211, isNew: false, stockQuantity: 16, categorySlug: "office", image: { imageUrl: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&q=80&fit=crop&crop=right", imageAlt: "Birk ergonomic desk chair in molded plywood" } },
  { slug: "verk-standing-desk", name: "Verk Standing Desk", subCategory: "Desk", price: "1850.00", rating: "4.80", reviewCount: 77, isNew: true, stockQuantity: 8, categorySlug: "office", image: { imageUrl: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80&fit=crop", imageAlt: "Verk height-adjustable desk in solid ash" } },
  { slug: "pin-monitor-shelf", name: "Pin Monitor Shelf", subCategory: "Accessory", price: "180.00", rating: "4.40", reviewCount: 139, isNew: false, stockQuantity: 35, categorySlug: "office", image: { imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80&fit=crop", imageAlt: "Pin bamboo monitor shelf with cable slot" } },
  { slug: "ark-filing-cabinet", name: "Ark Filing Cabinet", subCategory: "Storage", price: "560.00", rating: "4.30", reviewCount: 44, isNew: false, stockQuantity: 11, categorySlug: "office", image: { imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80&fit=crop&crop=left", imageAlt: "Ark two-drawer filing cabinet in white lacquer" } },

  // ── Outdoor ──
  { slug: "sol-outdoor-sofa", name: "Sol Outdoor Sofa", subCategory: "Sofa", price: "2800.00", rating: "4.80", reviewCount: 38, isNew: true, stockQuantity: 6, categorySlug: "outdoor", image: { imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80&fit=crop", imageAlt: "Sol outdoor sofa in teak and all-weather canvas" } },
  { slug: "teak-dining-set", name: "Teak Dining Set", subCategory: "Dining", price: "3400.00", rating: "4.90", reviewCount: 22, isNew: false, stockQuantity: 4, categorySlug: "outdoor", image: { imageUrl: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&q=80&fit=crop", imageAlt: "Outdoor teak dining table with four chairs" } },
  { slug: "kust-lounger", name: "Kust Lounger", subCategory: "Lounger", price: "890.00", rating: "4.60", reviewCount: 57, isNew: false, stockQuantity: 10, categorySlug: "outdoor", image: { imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80&fit=crop&crop=right", imageAlt: "Kust teak sun lounger with adjustable back" } },
  { slug: "lykt-outdoor-lantern", name: "Lykt Outdoor Lantern", subCategory: "Lighting", price: "140.00", rating: "4.50", reviewCount: 93, isNew: false, stockQuantity: 40, categorySlug: "outdoor", image: { imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80&fit=crop", imageAlt: "Lykt matte black outdoor lantern" } },

  // ── Sale ──
  { slug: "fjord-lounge-chair-sale", name: "Fjord Lounge Chair", subCategory: "Armchair", price: "849.00", rating: "4.80", reviewCount: 124, isNew: false, stockQuantity: 5, categorySlug: "sale", image: { imageUrl: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&q=80&fit=crop", imageAlt: "Fjord lounge chair — sale price" } },
  { slug: "nord-bookshelf-sale", name: "Nord Bookshelf", subCategory: "Storage", price: "490.00", rating: "4.50", reviewCount: 98, isNew: false, stockQuantity: 3, categorySlug: "sale", image: { imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80&fit=crop", imageAlt: "Nord bookshelf — sale price" } },
  { slug: "ris-dining-chair-sale", name: "Ris Dining Chair", subCategory: "Chair", price: "220.00", rating: "4.70", reviewCount: 116, isNew: false, stockQuantity: 8, categorySlug: "sale", image: { imageUrl: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&q=80&fit=crop&crop=right", imageAlt: "Ris dining chair — sale price" } },
  { slug: "sel-bar-stool-sale", name: "Sel Bar Stool", subCategory: "Stool", price: "170.00", rating: "4.50", reviewCount: 63, isNew: false, stockQuantity: 10, categorySlug: "sale", image: { imageUrl: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&q=80&fit=crop", imageAlt: "Sel bar stool — sale price" } },
  { slug: "tove-pendant-light-sale", name: "Tove Pendant Light", subCategory: "Lighting", price: "199.00", rating: "4.70", reviewCount: 203, isNew: false, stockQuantity: 7, categorySlug: "sale", image: { imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80&fit=crop", imageAlt: "Tove pendant light — sale price" } },
  { slug: "alva-side-table-sale", name: "Alva Side Table", subCategory: "Table", price: "169.00", rating: "4.40", reviewCount: 55, isNew: false, stockQuantity: 12, categorySlug: "sale", image: { imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80&fit=crop&crop=bottom", imageAlt: "Alva side table — sale price" } },
];

async function main() {
  const categoryBySlug = new Map();

  for (const category of categories) {
    const saved = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        label: category.label,
        headline: category.headline,
        description: category.description,
        seoDescription: category.seoDescription,
        heroImage: category.heroImage,
        heroAlt: category.heroAlt,
        ogImage: category.ogImage,
      },
      create: category,
    });
    categoryBySlug.set(saved.slug, saved.id);
  }

  for (const product of products) {
    const categoryId = categoryBySlug.get(product.categorySlug);
    if (!categoryId) continue;

    const saved = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        subCategory: product.subCategory,
        price: product.price,
        rating: product.rating,
        reviewCount: product.reviewCount,
        isNew: product.isNew,
        stockQuantity: product.stockQuantity,
        categoryId,
      },
      create: {
        slug: product.slug,
        name: product.name,
        subCategory: product.subCategory,
        price: product.price,
        rating: product.rating,
        reviewCount: product.reviewCount,
        isNew: product.isNew,
        stockQuantity: product.stockQuantity,
        categoryId,
      },
    });

    // Upsert primary image
    const existingImage = await prisma.productImage.findFirst({
      where: { productId: saved.id, isPrimary: true },
    });
    if (!existingImage) {
      await prisma.productImage.create({
        data: {
          productId: saved.id,
          imageUrl: product.image.imageUrl,
          imageAlt: product.image.imageAlt,
          isPrimary: true,
          sortOrder: 1,
        },
      });
    }
  }

  console.log(`Seeded ${categories.length} categories, ${products.length} products`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed completed");
  })
  .catch(async (error) => {
    console.error("Seed failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
