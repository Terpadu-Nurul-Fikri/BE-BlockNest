import { prisma } from "../config/index.js";

const isAdmin = (req) => req.user?.role === "ADMIN";

const parseRating = (rating) => {
    const parsed = Number(rating);
    if (!Number.isInteger(parsed)) {
        return null;
    }
    if (parsed < 1 || parsed > 5) {
        return null;
    }
    return parsed;
};

const mapReview = (review) => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    user: review.user,
    product: review.product,
});

const sendServerError = (res, message, error) => {
    console.error(message, error);
    return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan pada server",
    });
};

export const createReview = async (req, res) => {
    try {
        const { productId, rating, comment, userId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Field wajib: productId",
            });
        }

        const parsedRating = parseRating(rating);
        if (parsedRating === null) {
            return res.status(400).json({
                success: false,
                message: "Rating harus berupa angka 1 sampai 5",
            });
        }

        const targetUserId = isAdmin(req) && userId ? userId : req.user.id;

        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Produk tidak ditemukan",
            });
        }

        const review = await prisma.review.create({
            data: {
                userId: targetUserId,
                productId,
                rating: parsedRating,
                comment: comment || null,
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
                product: { select: { id: true, name: true, slug: true } },
            },
        });

        return res.status(201).json({
            success: true,
            message: "Review berhasil dibuat",
            data: mapReview(review),
        });
    } catch (error) {
        if (error.code === "P2002") {
            return res.status(409).json({
                success: false,
                message: "User sudah pernah memberikan review untuk produk ini",
            });
        }

        return sendServerError(res, "Error creating review:", error);
    }
};

export const getAllReviewsAdmin = async (_req, res) => {
    try {
        const reviews = await prisma.review.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { id: true, name: true, email: true } },
                product: { select: { id: true, name: true, slug: true } },
            },
        });

        return res.json({
            success: true,
            data: reviews.map(mapReview),
        });
    } catch (error) {
        return sendServerError(res, "Error fetching all reviews:", error);
    }
};

export const getReviewsByProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { id: true, name: true, slug: true },
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Produk tidak ditemukan",
            });
        }

        const reviews = await prisma.review.findMany({
            where: { productId },
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { id: true, name: true } },
            },
        });

        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(2))
            : 0;

        return res.json({
            success: true,
            data: {
                product,
                summary: {
                    totalReviews,
                    averageRating,
                },
                reviews,
            },
        });
    } catch (error) {
        return sendServerError(res, "Error fetching reviews by product:", error);
    }
};

export const getReviewById = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await prisma.review.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, email: true } },
                product: { select: { id: true, name: true, slug: true } },
            },
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review tidak ditemukan",
            });
        }

        if (!isAdmin(req) && review.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Anda tidak memiliki akses ke review ini",
            });
        }

        return res.json({
            success: true,
            data: mapReview(review),
        });
    } catch (error) {
        return sendServerError(res, "Error fetching review detail:", error);
    }
};

export const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;

        const review = await prisma.review.findUnique({ where: { id } });
        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review tidak ditemukan",
            });
        }

        if (!isAdmin(req) && review.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Anda tidak memiliki akses untuk update review ini",
            });
        }

        const payload = {};

        if (rating !== undefined) {
            const parsedRating = parseRating(rating);
            if (parsedRating === null) {
                return res.status(400).json({
                    success: false,
                    message: "Rating harus berupa angka 1 sampai 5",
                });
            }

            payload.rating = parsedRating;
        }

        if (comment !== undefined) {
            payload.comment = comment || null;
        }

        const updatedReview = await prisma.review.update({
            where: { id },
            data: payload,
            include: {
                user: { select: { id: true, name: true, email: true } },
                product: { select: { id: true, name: true, slug: true } },
            },
        });

        return res.json({
            success: true,
            message: "Review berhasil diupdate",
            data: mapReview(updatedReview),
        });
    } catch (error) {
        return sendServerError(res, "Error updating review:", error);
    }
};

export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await prisma.review.findUnique({ where: { id } });
        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review tidak ditemukan",
            });
        }

        if (!isAdmin(req) && review.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Anda tidak memiliki akses untuk menghapus review ini",
            });
        }

        await prisma.review.delete({ where: { id } });

        return res.json({
            success: true,
            message: "Review berhasil dihapus",
        });
    } catch (error) {
        return sendServerError(res, "Error deleting review:", error);
    }
};
