// src/controllers/productController.js
import { prisma } from "../config/index.js";

const mapProductForCatalog = (product) => {
    const primaryImage = product.images.length > 0 ? product.images[0] : null;

    return {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        category: product.subCategory,
        imageUrl: primaryImage ? primaryImage.imageUrl : "",
        imageAlt: primaryImage ? primaryImage.imageAlt : "",
        rating: Number(product.rating),
        reviewCount: product.reviewCount,
        isNew: product.isNew,
        slug: product.slug,
    };
};

const mapProductForAdmin = (product) => {
    const baseProduct = mapProductForCatalog(product);

    return {
        ...baseProduct,
        categoryId: product.categoryId,
        stockQuantity: product.stockQuantity,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        images: product.images,
    };
};

export const createProduct = async (req, res) => {
    try {
        const {
            categoryId,
            slug,
            name,
            subCategory,
            price,
            rating,
            reviewCount,
            isNew,
            stockQuantity,
            images,
        } = req.body;

        if (!slug || !name || price === undefined || stockQuantity === undefined) {
            return res.status(400).json({
                success: false,
                message: "Field wajib: slug, name, price, stockQuantity",
            });
        }

        if (categoryId) {
            const category = await prisma.category.findUnique({ where: { id: categoryId } });
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: "Category tidak ditemukan",
                });
            }
        }

        const createdProduct = await prisma.product.create({
            data: {
                categoryId: categoryId || null,
                slug,
                name,
                subCategory: subCategory || null,
                price,
                rating: rating ?? 0,
                reviewCount: reviewCount ?? 0,
                isNew: isNew ?? false,
                stockQuantity,
                images: Array.isArray(images) && images.length > 0
                    ? {
                        create: images.map((img, index) => ({
                            imageUrl: img.imageUrl,
                            imageAlt: img.imageAlt || null,
                            isPrimary: img.isPrimary ?? index === 0,
                            sortOrder: img.sortOrder ?? index,
                        })),
                    }
                    : undefined,
            },
            include: {
                images: true,
            },
        });

        return res.status(201).json({
            success: true,
            message: "Product berhasil dibuat",
            data: mapProductForAdmin(createdProduct),
        });
    } catch (error) {
        console.error("Error creating product:", error);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server",
        });
    }
};

export const getAllProductsAdmin = async (_req, res) => {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                images: {
                    orderBy: { sortOrder: "asc" },
                },
            },
        });

        return res.json({
            success: true,
            data: products.map(mapProductForAdmin),
        });
    } catch (error) {
        console.error("Error fetching admin product list:", error);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server",
        });
    }
};

export const getProductByIdAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                images: {
                    orderBy: { sortOrder: "asc" },
                },
            },
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product tidak ditemukan",
            });
        }

        return res.json({
            success: true,
            data: mapProductForAdmin(product),
        });
    } catch (error) {
        console.error("Error fetching product detail:", error);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server",
        });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            categoryId,
            slug,
            name,
            subCategory,
            price,
            rating,
            reviewCount,
            isNew,
            stockQuantity,
            images,
        } = req.body;

        const existingProduct = await prisma.product.findUnique({ where: { id } });
        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: "Product tidak ditemukan",
            });
        }

        if (categoryId) {
            const category = await prisma.category.findUnique({ where: { id: categoryId } });
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: "Category tidak ditemukan",
                });
            }
        }

        const updatedProduct = await prisma.$transaction(async (tx) => {
            const product = await tx.product.update({
                where: { id },
                data: {
                    categoryId: categoryId === undefined ? undefined : categoryId,
                    slug,
                    name,
                    subCategory,
                    price,
                    rating,
                    reviewCount,
                    isNew,
                    stockQuantity,
                },
            });

            if (Array.isArray(images)) {
                await tx.productImage.deleteMany({ where: { productId: id } });

                if (images.length > 0) {
                    await tx.productImage.createMany({
                        data: images.map((img, index) => ({
                            productId: id,
                            imageUrl: img.imageUrl,
                            imageAlt: img.imageAlt || null,
                            isPrimary: img.isPrimary ?? index === 0,
                            sortOrder: img.sortOrder ?? index,
                        })),
                    });
                }
            }

            return tx.product.findUnique({
                where: { id: product.id },
                include: {
                    images: {
                        orderBy: { sortOrder: "asc" },
                    },
                },
            });
        });

        return res.json({
            success: true,
            message: "Product berhasil diupdate",
            data: mapProductForAdmin(updatedProduct),
        });
    } catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server",
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const existingProduct = await prisma.product.findUnique({ where: { id } });
        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: "Product tidak ditemukan",
            });
        }

        await prisma.product.delete({ where: { id } });

        return res.json({
            success: true,
            message: "Product berhasil dihapus",
        });
    } catch (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server",
        });
    }
};

export const getProductsByCategory = async (req, res) => {
    try {
        const role = req.user?.role;

        if (!["CUSTOMER", "ADMIN"].includes(role)) {
            return res.status(403).json({
                success: false,
                message: "Role tidak diizinkan untuk mengakses data produk"
            });
        }

        const { slug } = req.params;

        // Cari kategori berdasarkan slug dan JOIN dengan products, 
        // lalu JOIN lagi dari products ke images (ambil gambar utamanya saja)
        const categoryData = await prisma.category.findUnique({
            where: { slug: slug },
            include: {
                products: {
                    include: {
                        images: {
                            where: { isPrimary: true }, // Hanya ambil gambar thumbnail
                            take: 1 // Ambil 1 saja untuk ditampilkan di grid card
                        }
                    }
                },
            },
        });

        // Jika kategori tidak ditemukan di database
        if (!categoryData) {
            return res.status(404).json({
                success: false,
                message: "Kategori tidak ditemukan"
            });
        }

        // Format data meta (informasi kategori) agar sesuai interface CategoryMeta di React
        const meta = {
            label: categoryData.label,
            slug: categoryData.slug,
            headline: categoryData.headline,
            description: categoryData.description,
            seoDescription: categoryData.seoDescription,
            heroImage: categoryData.heroImage,
            heroAlt: categoryData.heroAlt,
            ogImage: categoryData.ogImage,
        };

        // Format data produk agar sesuai interface Product di React
        const formattedProducts = categoryData.products.map((product) => {
            const baseProduct = mapProductForCatalog(product);

            // Admin mendapatkan data lebih detail untuk kebutuhan manajemen.
            if (role === "ADMIN") {
                return {
                    ...baseProduct,
                    categoryId: product.categoryId,
                    stockQuantity: product.stockQuantity,
                    createdAt: product.createdAt,
                    updatedAt: product.updatedAt,
                };
            }

            // Customer hanya menerima data produk untuk tampilan katalog.
            return baseProduct;
        });

        // Kirim response JSON ke frontend
        res.json({
            success: true,
            data: {
                meta,
                products: formattedProducts,
            },
        });

    } catch (error) {
        console.error("Error fetching products by category:", error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server"
        });
    }
};

export const getProductBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const userId = req.user?.id;

        // Fetch product details
        const product = await prisma.product.findUnique({
            where: { slug },
            include: {
                images: {
                    orderBy: { sortOrder: "asc" },
                },
                category: true,
            },
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Produk tidak ditemukan",
            });
        }

        // Fetch reviews associated with product
        const reviews = await prisma.review.findMany({
            where: { productId: product.id },
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        photoUrl: true,
                    },
                },
            },
        });

        // Map reviews name dynamically
        const formattedReviews = reviews.map((r) => ({
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
            user: {
                id: r.user.id,
                name: `${r.user.firstName || ""} ${r.user.lastName || ""}`.trim(),
                photoUrl: r.user.photoUrl,
            },
        }));

        // Determine if current user can review the product
        let isEligibleToReview = false;
        let hasReviewed = false;

        if (userId) {
            // Check if they purchased the product
            const orderItem = await prisma.orderItem.findFirst({
                where: {
                    productId: product.id,
                    order: {
                        userId,
                        status: { in: ["PAID", "SHIPPED", "COMPLETED"] },
                    },
                },
            });
            isEligibleToReview = Boolean(orderItem);

            // Check if they already reviewed the product
            const existingReview = await prisma.review.findFirst({
                where: {
                    userId,
                    productId: product.id,
                },
            });
            hasReviewed = Boolean(existingReview);
        }

        return res.json({
            success: true,
            data: {
                product: {
                    ...mapProductForCatalog(product),
                    categoryId: product.categoryId,
                    stockQuantity: product.stockQuantity,
                    images: product.images,
                    categoryDetail: product.category
                        ? {
                            id: product.category.id,
                            label: product.category.label,
                            slug: product.category.slug,
                          }
                        : null,
                },
                reviews: formattedReviews,
                eligibility: {
                    isEligibleToReview,
                    hasReviewed,
                },
            },
        });
    } catch (error) {
        console.error("Error fetching product detail by slug:", error);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server",
        });
    }
};

// ── Search Products ─────────────────────────────────────────────────────────
export const searchProducts = async (req, res) => {
    try {
        const q = (req.query.q || "").toString().trim();
        const limit = Math.min(Number(req.query.limit) || 10, 30);

        if (!q) {
            return res.json({ success: true, data: [] });
        }

        const products = await prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: q, mode: "insensitive" } },
                    { subCategory: { contains: q, mode: "insensitive" } },
                    { slug: { contains: q, mode: "insensitive" } },
                ],
            },
            include: {
                images: {
                    where: { isPrimary: true },
                    take: 1,
                },
            },
            take: limit,
            orderBy: { rating: "desc" },
        });

        return res.json({
            success: true,
            data: products.map(mapProductForCatalog),
        });
    } catch (error) {
        console.error("Error searching products:", error);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server",
        });
    }
};

// ── Get Featured/All Products (for Home page) ────────────────────────────────
export const getFeaturedProducts = async (req, res) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Number(req.query.limit) || 8, 48);
        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                orderBy: [
                    { isNew: "desc" },
                    { rating: "desc" },
                    { createdAt: "desc" },
                ],
                include: {
                    images: {
                        where: { isPrimary: true },
                        take: 1,
                    },
                },
                skip,
                take: limit,
            }),
            prisma.product.count(),
        ]);

        return res.json({
            success: true,
            data: {
                products: products.map(mapProductForCatalog),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasMore: skip + limit < total,
                },
            },
        });
    } catch (error) {
        console.error("Error fetching featured products:", error);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server",
        });
    }
};
