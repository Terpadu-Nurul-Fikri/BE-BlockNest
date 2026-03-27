const { prisma } = require("../config/db");

/**
 * Get products with advanced filtering, sorting, and pagination
 */
const getProducts = async (filters) => {
  const {
    page = 1,
    limit = 12,
    search,
    categoryId,
    categorySlug,
    minPrice,
    maxPrice,
    sortBy = "createdAt",
    order = "desc",
  } = filters;

  const skip = (page - 1) * limit;
  const safeOrder = order === "asc" ? "asc" : "desc";
  const sortableFields = ["createdAt", "price", "name", "salesCount", "viewCount"];

  let orderBy = { createdAt: "desc" };
  if (sortBy === "rating") {
    orderBy = [{ reviews: { _count: safeOrder } }, { salesCount: safeOrder }];
  } else if (sortableFields.includes(sortBy)) {
    orderBy = { [sortBy]: safeOrder };
  }

  // Build where clause
  const where = {
    isActive: true,
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { subCategory: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(categoryId && { categoryId }),
    ...(categorySlug && {
      category: {
        slug: categorySlug,
      },
    }),
    ...(minPrice || maxPrice
      ? {
          price: {
            ...(minPrice && { gte: minPrice }),
            ...(maxPrice && { lte: maxPrice }),
          },
        }
      : {}),
  };

  try {
    // Execute queries
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: {
            where: { isPrimary: true },
            take: 1,
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Calculate average rating for each product
    const productsWithRating = products.map((product) => {
      const avgRating =
        product.reviews.length > 0 ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length : 0;

      return {
        ...product,
        averageRating: avgRating.toFixed(1),
        reviewCount: product.reviews.length,
      };
    });

    return {
      products: productsWithRating,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Product service error:", error);
    throw error;
  }
};

/**
 * Get product recommendations based on category
 */
const getRecommendedProducts = async (productId, limit = 4) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true },
    });

    if (!product) {
      return [];
    }

    const products = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        isActive: true,
        NOT: { id: productId },
      },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
      take: limit,
      orderBy: { salesCount: "desc" },
    });

    return products;
  } catch (error) {
    console.error("Get recommended products error:", error);
    throw error;
  }
};

/**
 * Search products with autocomplete
 */
const searchProducts = async (query, limit = 5) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: {
          where: { isPrimary: true },
          take: 1,
          select: {
            url: true,
          },
        },
      },
      take: limit,
    });

    return products;
  } catch (error) {
    console.error("Search products error:", error);
    throw error;
  }
};

module.exports = {
  getProducts,
  getRecommendedProducts,
  searchProducts,
};
