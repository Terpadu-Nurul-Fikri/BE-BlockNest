const { prisma } = require("../config/db");
const productService = require("../services/productService");
const { mapProductToCard } = require("../utils/productMappers");

/**
 * Get all products with filters & pagination
 */
const getAllProducts = async (req, res) => {
  try {
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
    } = req.query;

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      categoryId,
      categorySlug,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sortBy,
      order,
    };

    const result = await productService.getProducts(filters);
    const cards = result.products.map(mapProductToCard);

    res.json({
      ...result,
      cards,
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      error: "Failed to get products",
    });
  }
};

/**
 * Get single product by ID
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: {
          orderBy: { order: "asc" },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    // Increment view count
    await prisma.product.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    // Calculate average rating
    const avgRating =
      product.reviews.length > 0 ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length : 0;

    res.json({
      ...product,
      averageRating: avgRating.toFixed(1),
      reviewCount: product.reviews.length,
      card: mapProductToCard({
        ...product,
        averageRating: avgRating,
        reviewCount: product.reviews.length,
      }),
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      error: "Failed to get product",
    });
  }
};

/**
 * Create new product (Admin only)
 */
const createProduct = async (req, res) => {
  try {
    const { name, slug, description, subCategory, price, stock, sku, categoryId, isNew, images } = req.body;

    // Validation
    if (!name || !slug || !description || !price || !sku || !categoryId) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        subCategory: subCategory || null,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        sku,
        categoryId,
        isNew: isNew === true,
        images: images
          ? {
              create: images.map((img, index) => ({
                url: img.url,
                alt: img.alt || name,
                isPrimary: index === 0,
                order: index,
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        images: true,
      },
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({
      error: "Failed to create product",
    });
  }
};

/**
 * Update product (Admin only)
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, subCategory, price, stock, sku, categoryId, isActive, isFeatured, isNew } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: name || undefined,
        slug: slug || undefined,
        description: description || undefined,
        subCategory: subCategory || undefined,
        price: price ? parseFloat(price) : undefined,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        sku: sku || undefined,
        categoryId: categoryId || undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        isFeatured: isFeatured !== undefined ? isFeatured : undefined,
        isNew: isNew !== undefined ? isNew : undefined,
      },
      include: {
        category: true,
        images: true,
      },
    });

    res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({
      error: "Failed to update product",
    });
  }
};

/**
 * Delete product (Admin only)
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id },
    });

    res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      error: "Failed to delete product",
    });
  }
};

/**
 * Get featured products
 */
const getFeaturedProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isFeatured: true,
        isActive: true,
      },
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
      take: 8,
      orderBy: { salesCount: "desc" },
    });

    const cards = products.map(mapProductToCard);

    res.json({
      products,
      cards,
    });
  } catch (error) {
    console.error("Get featured products error:", error);
    res.status(500).json({
      error: "Failed to get featured products",
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
};
