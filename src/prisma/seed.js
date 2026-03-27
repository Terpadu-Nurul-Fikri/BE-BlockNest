const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Start seeding...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@blocknest.com" },
    update: {},
    create: {
      email: "admin@blocknest.com",
      password: adminPassword,
      name: "Admin BlockNest",
      phone: "081234567890",
      role: "ADMIN",
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Create regular user
  const userPassword = await bcrypt.hash("user123", 10);
  const user = await prisma.user.upsert({
    where: { email: "user@blocknest.com" },
    update: {},
    create: {
      email: "user@blocknest.com",
      password: userPassword,
      name: "Test User",
      phone: "081234567891",
      role: "USER",
    },
  });
  console.log("✅ Regular user created:", user.email);

  // Create categories aligned with FE slugs
  const categorySeeds = [
    {
      name: "Living Room",
      slug: "living-room",
      description: "Sofas, armchairs, coffee tables, and shelving for daily living.",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1400&q=85&fit=crop",
    },
    {
      name: "Bedroom",
      slug: "bedroom",
      description: "Low-profile beds, minimal wardrobes, and bedside tables.",
      image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1400&q=85&fit=crop",
    },
    {
      name: "Dining",
      slug: "dining",
      description: "Dining tables and chairs crafted for comfort and durability.",
      image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1400&q=85&fit=crop",
    },
    {
      name: "Office",
      slug: "office",
      description: "Home office desks, chairs, and storage solutions.",
      image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1400&q=85&fit=crop",
    },
    {
      name: "Outdoor",
      slug: "outdoor",
      description: "Weather-ready furniture for terrace, balcony, and garden.",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=85&fit=crop",
    },
    {
      name: "Sale",
      slug: "sale",
      description: "Selected end-of-season pieces at reduced prices.",
      image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1400&q=85&fit=crop",
    },
  ];

  const categoryBySlug = {};
  for (const categorySeed of categorySeeds) {
    const category = await prisma.category.upsert({
      where: { slug: categorySeed.slug },
      update: {
        name: categorySeed.name,
        description: categorySeed.description,
        image: categorySeed.image,
      },
      create: categorySeed,
    });

    categoryBySlug[category.slug] = category;
  }
  console.log("✅ Categories created");

  // Create sample products aligned with FE display cards
  const productSeeds = [
    {
      name: "Saga Modular Sofa",
      slug: "saga-modular-sofa",
      description: "Reconfigurable 3-piece modular sofa in natural linen.",
      subCategory: "Sofas",
      price: 3200,
      stock: 12,
      sku: "LR-SOFA-001",
      categorySlug: "living-room",
      isFeatured: true,
      isNew: false,
      imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80&fit=crop&crop=left",
      imageAlt: "Saga modular sofa in natural linen with chaise",
    },
    {
      name: "Fjord Lounge Chair",
      slug: "fjord-lounge-chair",
      description: "Curved silhouette with walnut legs and boucle upholstery.",
      subCategory: "Armchairs",
      price: 1290,
      stock: 18,
      sku: "LR-ARM-001",
      categorySlug: "living-room",
      isFeatured: true,
      isNew: true,
      imageUrl: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&q=80&fit=crop",
      imageAlt: "Fjord lounge chair with walnut legs",
    },
    {
      name: "Lund Bed Frame",
      slug: "lund-bed-frame",
      description: "Low-profile platform frame in smoked oak.",
      subCategory: "Beds",
      price: 1890,
      stock: 9,
      sku: "BR-BED-001",
      categorySlug: "bedroom",
      isFeatured: true,
      isNew: true,
      imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80&fit=crop",
      imageAlt: "Lund platform bed frame in smoked oak",
    },
    {
      name: "Hagen Bedside Table",
      slug: "hagen-bedside-table",
      description: "Compact bedside table in natural oak.",
      subCategory: "Bedside Tables",
      price: 310,
      stock: 25,
      sku: "BR-BST-001",
      categorySlug: "bedroom",
      isFeatured: false,
      isNew: false,
      imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80&fit=crop&crop=right",
      imageAlt: "Hagen bedside table in natural oak",
    },
    {
      name: "Holm Dining Table",
      slug: "holm-dining-table",
      description: "Solid white oak top on tapered legs. Seats 6 comfortably.",
      subCategory: "Dining",
      price: 2450,
      stock: 7,
      sku: "DN-TBL-001",
      categorySlug: "dining",
      isFeatured: true,
      isNew: false,
      imageUrl: "https://images.unsplash.com/photo-1549497538-303791108f95?w=600&q=80&fit=crop",
      imageAlt: "Holm dining table in solid white oak",
    },
    {
      name: "Ris Dining Chair",
      slug: "ris-dining-chair",
      description: "Upholstered dining chair in stone linen.",
      subCategory: "Chairs",
      price: 380,
      stock: 20,
      sku: "DN-CHR-001",
      categorySlug: "dining",
      isFeatured: false,
      isNew: false,
      imageUrl: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&q=80&fit=crop",
      imageAlt: "Ris dining chair in upholstered stone linen",
    },
    {
      name: "Birk Desk Chair",
      slug: "birk-desk-chair",
      description: "Ergonomic molded plywood chair for focused work.",
      subCategory: "Chairs",
      price: 640,
      stock: 16,
      sku: "OF-CHR-001",
      categorySlug: "office",
      isFeatured: true,
      isNew: false,
      imageUrl: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&q=80&fit=crop&crop=right",
      imageAlt: "Birk ergonomic desk chair in molded plywood",
    },
    {
      name: "Verk Standing Desk",
      slug: "verk-standing-desk",
      description: "Height-adjustable standing desk in solid ash.",
      subCategory: "Desks",
      price: 1850,
      stock: 6,
      sku: "OF-DSK-001",
      categorySlug: "office",
      isFeatured: false,
      isNew: true,
      imageUrl: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80&fit=crop",
      imageAlt: "Verk standing desk in solid ash",
    },
    {
      name: "Skov Outdoor Dining Set",
      slug: "skov-outdoor-dining-set",
      description: "Teak outdoor table set for six people.",
      subCategory: "Dining Sets",
      price: 2890,
      stock: 5,
      sku: "OT-SET-001",
      categorySlug: "outdoor",
      isFeatured: false,
      isNew: true,
      imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80&fit=crop",
      imageAlt: "Outdoor teak dining table set in a sunny garden",
    },
    {
      name: "Lova Lounge Chair",
      slug: "lova-lounge-chair",
      description: "Powder-coated steel frame with weather-resistant fabric.",
      subCategory: "Lounge Chairs",
      price: 980,
      stock: 11,
      sku: "OT-CHR-001",
      categorySlug: "outdoor",
      isFeatured: false,
      isNew: false,
      imageUrl: "https://images.unsplash.com/photo-1493666438817-866a91353ca9?w=600&q=80&fit=crop",
      imageAlt: "Outdoor lounge chair with weather-resistant cushion",
    },
    {
      name: "Tove Pendant Light",
      slug: "tove-pendant-light-sale",
      description: "Hand-blown opal glass globe on matte black canopy.",
      subCategory: "Lighting",
      price: 199,
      stock: 14,
      sku: "SL-LGT-001",
      categorySlug: "sale",
      isFeatured: false,
      isNew: false,
      imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80&fit=crop",
      imageAlt: "Tove pendant light on sale",
    },
    {
      name: "Alva Side Table",
      slug: "alva-side-table-sale",
      description: "Compact side table in solid ash wood.",
      subCategory: "Tables",
      price: 169,
      stock: 22,
      sku: "SL-TBL-001",
      categorySlug: "sale",
      isFeatured: false,
      isNew: false,
      imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80&fit=crop&crop=bottom",
      imageAlt: "Alva side table sale price",
    },
  ];

  for (const seed of productSeeds) {
    const category = categoryBySlug[seed.categorySlug];

    if (!category) {
      console.warn(`⚠️ Skip product ${seed.name}: category ${seed.categorySlug} not found`);
      continue;
    }

    const product = await prisma.product.upsert({
      where: { slug: seed.slug },
      update: {
        name: seed.name,
        description: seed.description,
        subCategory: seed.subCategory,
        price: seed.price,
        stock: seed.stock,
        sku: seed.sku,
        categoryId: category.id,
        isFeatured: seed.isFeatured,
        isNew: seed.isNew,
      },
      create: {
        name: seed.name,
        slug: seed.slug,
        description: seed.description,
        subCategory: seed.subCategory,
        price: seed.price,
        stock: seed.stock,
        sku: seed.sku,
        categoryId: category.id,
        isFeatured: seed.isFeatured,
        isNew: seed.isNew,
      },
    });

    await prisma.productImage.deleteMany({
      where: { productId: product.id },
    });

    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: seed.imageUrl,
        alt: seed.imageAlt,
        isPrimary: true,
        order: 0,
      },
    });

    console.log(`✅ Product created: ${product.name}`);
  }

  // Create cart for regular user
  await prisma.cart.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
    },
  });
  console.log("✅ Cart created for user");

  console.log("🎉 Seeding completed!");
  console.log("\n📧 Login credentials:");
  console.log("Admin: admin@blocknest.com / admin123");
  console.log("User: user@blocknest.com / user123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
