import express from "express";
import {
    createReview,
    deleteReview,
    getAllReviewsAdmin,
    getReviewById,
    getReviewsByProduct,
    updateReview,
} from "../controllers/reviewController.js";
import {
    authorizeRoles,
    redirectGuestToLogin,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

const customerOrAdmin = [redirectGuestToLogin, authorizeRoles("CUSTOMER", "ADMIN")];
const adminOnly = [redirectGuestToLogin, authorizeRoles("ADMIN")];

router.get("/admin", ...adminOnly, getAllReviewsAdmin);
router.get("/product/:productId", ...customerOrAdmin, getReviewsByProduct);
router.get("/:id", ...customerOrAdmin, getReviewById);
router.post("/", ...customerOrAdmin, createReview);
router.put("/:id", ...customerOrAdmin, updateReview);
router.delete("/:id", ...customerOrAdmin, deleteReview);

export default router;
