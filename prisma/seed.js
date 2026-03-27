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
];

const products = [
  {
    slug: "saga-modular-sofa",
    name: "Saga Modular Sofa",
    subCategory: "Sofa",
    price: "3200.00",
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80&fit=crop&crop=left",
    imageAlt: "Saga modular sofa",
    rating: "4.8",
    reviewCount: 128,
    isNew: false,
    stockQuantity: 12,
    categorySlug: "living-room",
  },
  {
    slug: "fjord-lounge-chair",
    name: "Fjord Lounge Chair",
    subCategory: "Armchair",
    price: "1290.00",
    imageUrl: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&q=80&fit=crop",
    imageAlt: "Fjord lounge chair",
    rating: "4.6",
    reviewCount: 93,
    isNew: true,
    stockQuantity: 18,
    categorySlug: "living-room",
  },
  {
    slug: "lund-bed-frame",
    name: "Lund Bed Frame",
    subCategory: "Bed",
    price: "1890.00",
    imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80&fit=crop",
    imageAlt: "Lund bed frame",
    rating: "4.7",
    reviewCount: 77,
    isNew: true,
    stockQuantity: 9,
    categorySlug: "bedroom",
  },
  {
    slug: "holm-dining-table",
    name: "Holm Dining Table",
    subCategory: "Table",
    price: "2450.00",
    imageUrl: "https://images.unsplash.com/photo-1549497538-303791108f95?w=600&q=80&fit=crop",
    imageAlt: "Holm dining table",
    rating: "4.9",
    reviewCount: 51,
    isNew: false,
    stockQuantity: 7,
    categorySlug: "dining",
  },
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

    if (!categoryId) {
      continue;
    }

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        subCategory: product.subCategory,
        price: product.price,
        imageUrl: product.imageUrl,
        imageAlt: product.imageAlt,
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
        imageUrl: product.imageUrl,
        imageAlt: product.imageAlt,
        rating: product.rating,
        reviewCount: product.reviewCount,
        isNew: product.isNew,
        stockQuantity: product.stockQuantity,
        categoryId,
      },
    });
  }
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
