// src/controllers/productController.js
import { prisma } from "../config/index.js";

export const getProductsByCategory = async (req, res) => {
    try {
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
            // Cek apakah produk punya gambar, jika ada ambil URL-nya, jika tidak beri string kosong/null
            const primaryImage = product.images.length > 0 ? product.images[0] : null;

            return {
                id: product.id,
                name: product.name,
                price: Number(product.price),
                category: product.subCategory,
                imageUrl: primaryImage ? primaryImage.imageUrl : "", // Ambil dari tabel relasi
                imageAlt: primaryImage ? primaryImage.imageAlt : "",
                rating: Number(product.rating),
                reviewCount: product.reviewCount,
                isNew: product.isNew,
                slug: product.slug,
            };
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


export const deleteProduct = async (req, res) => {
    try {
        
    } catch (error) {
        
    }
}