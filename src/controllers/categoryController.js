// src/controllers/categoryController.js
import { prisma } from "../config/index.js"; // Pastikan pakai .js

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