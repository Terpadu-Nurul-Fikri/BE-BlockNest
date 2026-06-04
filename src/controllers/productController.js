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
