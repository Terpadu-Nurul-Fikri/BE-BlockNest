const { prisma } = require("../config/db");
const productService = require("../services/productService");
const { getCategoryMeta } = require("../utils/categoryMeta");
const { mapProductToCard } = require("../utils/productMappers");

const mapSortOption = (sortBy) => {
  if (sortBy === "price-asc") {
    return { sortBy: "price", order: "asc" };
  }

  if (sortBy === "price-desc") {
    return { sortBy: "price", order: "desc" };
  }

  if (sortBy === "rating") {
    return { sortBy: "rating", order: "desc" };
  }

  if (sortBy === "newest") {
    return { sortBy: "createdAt", order: "desc" };
  }

  return { sortBy: "salesCount", order: "desc" };
};

const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const normalized = categories.map((category) => {
      const meta = getCategoryMeta(category.slug, category);

      return {
        id: category.id,
        slug: category.slug,
        name: category.name,
        label: meta.label,
        headline: meta.headline,
        description: meta.description,
        seoDescription: meta.seoDescription,
        heroImage: meta.heroImage,
        heroAlt: meta.heroAlt,
        ogImage: meta.ogImage,
        itemCount: category._count.products,
      };
    });

    res.json({ categories: normalized });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ error: "Failed to get categories" });
  }
};

const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            products: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const meta = getCategoryMeta(slug, category);

    res.json({
      category: {
        id: category.id,
        slug: category.slug,
        name: category.name,
        label: meta.label,
        headline: meta.headline,
        description: meta.description,
        seoDescription: meta.seoDescription,
        heroImage: meta.heroImage,
        heroAlt: meta.heroAlt,
        ogImage: meta.ogImage,
        itemCount: category._count.products,
      },
    });
  } catch (error) {
    console.error("Get category detail error:", error);
    res.status(500).json({ error: "Failed to get category" });
  }
};

const getCategoryProducts = async (req, res) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 12, search, minPrice, maxPrice, sortBy = "featured" } = req.query;

    const category = await prisma.category.findUnique({
      where: { slug },
      select: { id: true, slug: true, name: true, description: true, image: true },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const sorting = mapSortOption(sortBy);
    const filters = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      search,
      categoryId: category.id,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sortBy: sorting.sortBy,
      order: sorting.order,
    };

    const result = await productService.getProducts(filters);
    const meta = getCategoryMeta(slug, category);
    const products = result.products.map(mapProductToCard);

    res.json({
      category: {
        id: category.id,
        slug: category.slug,
        name: category.name,
        label: meta.label,
        headline: meta.headline,
        description: meta.description,
        seoDescription: meta.seoDescription,
        heroImage: meta.heroImage,
        heroAlt: meta.heroAlt,
        ogImage: meta.ogImage,
      },
      products,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get category products error:", error);
    res.status(500).json({ error: "Failed to get category products" });
  }
};

module.exports = {
  getCategories,
  getCategoryBySlug,
  getCategoryProducts,
};
