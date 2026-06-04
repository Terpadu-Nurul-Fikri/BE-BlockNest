// src/controllers/categoryController.js
import { prisma } from "../config/index.js"; // Pastikan pakai .js

export const createCategory = async (req, res) => {
    try {
        const {
            slug,
            label,
            headline,
            description,
            seoDescription,
            heroImage,
            heroAlt,
            ogImage,
        } = req.body;

        if (!slug || !label) {
            return res.status(400).json({
                success: false,
                message: "Field wajib: slug dan label",
            });
        }

        const category = await prisma.category.create({
            data: {
                slug,
                label,
                headline,
                description,
                seoDescription,
                heroImage,
                heroAlt,
                ogImage,
            },
        });

        return res.status(201).json({
            success: true,
            message: "Category berhasil dibuat",
            data: category,
        });
    } catch (error) {
        console.error("Error creating category:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getAllCategoriesAdmin = async (_req, res) => {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });

        return res.json({
            success: true,
            data: categories,
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getCategoryByIdAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                products: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        stockQuantity: true,
                        price: true,
                    },
                },
            },
        });

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        return res.json({
            success: true,
            data: category,
        });
    } catch (error) {
        console.error("Error fetching category detail:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const existingCategory = await prisma.category.findUnique({ where: { id } });
        if (!existingCategory) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        const {
            slug,
            label,
            headline,
            description,
            seoDescription,
            heroImage,
            heroAlt,
            ogImage,
        } = req.body;

        const category = await prisma.category.update({
            where: { id },
            data: {
                slug,
                label,
                headline,
                description,
                seoDescription,
                heroImage,
                heroAlt,
                ogImage,
            },
        });

        return res.json({
            success: true,
            message: "Category berhasil diupdate",
            data: category,
        });
    } catch (error) {
        console.error("Error updating category:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const existingCategory = await prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { products: true },
                },
            },
        });

        if (!existingCategory) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        if (existingCategory._count.products > 0) {
            return res.status(400).json({
                success: false,
                message: "Category tidak bisa dihapus karena masih memiliki produk",
            });
        }

        await prisma.category.delete({ where: { id } });

        return res.json({
            success: true,
            message: "Category berhasil dihapus",
        });
    } catch (error) {
        console.error("Error deleting category:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getCategoryData = async (req, res) => {
    try {
        const { slug } = req.params;

        // Ambil data kategori, produk, sekaligus gambar utama produknya
        const categoryData = await prisma.category.findUnique({
            where: { slug: slug },
            include: {
                products: {
                    include: {
                        images: {
                            where: { isPrimary: true }, // Hanya ambil thumbnail
                            take: 1
                        }
                    }
                },
            },
        });

        // 1. CEK DULU DI SINI: Jika kategori tidak ada, langsung stop
        if (!categoryData) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        // 2. Format data kategori (Meta)
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

        // 3. Format data produk
        const formattedProducts = categoryData.products.map((product) => {
            // Ambil gambar pertama dari relasi tabel ProductImage
            const primaryImage = product.images.length > 0 ? product.images[0] : null;

            return {
                id: product.id,
                name: product.name,
                price: Number(product.price),
                category: product.subCategory,
                imageUrl: primaryImage ? primaryImage.imageUrl : "", // Map url gambar
                imageAlt: primaryImage ? primaryImage.imageAlt : "", // Map alt gambar
                rating: Number(product.rating),
                reviewCount: product.reviewCount,
                isNew: product.isNew,
                slug: product.slug,
            };
        });

        // 4. Kirim response JSON ke React
        res.json({
            success: true,
            data: {
                meta,
                products: formattedProducts,
            },
        });

    } catch (error) {
        console.error('Error fetching category data:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};