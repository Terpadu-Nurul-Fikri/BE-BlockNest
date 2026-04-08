// src/routes/bannerRoutes.js
import express from "express";
import {
    createBanner,
    getAllBanners,
    getActiveBanners,
    getBannerById,
    updateBanner,
    deleteBanner,
} from "../controllers/bannerController.js";
import {
    authorizeRoles,
    redirectGuestToLogin,
} from "../middlewares/authMiddleware.js";

const router = express.Router();
const adminOnly = [redirectGuestToLogin, authorizeRoles("ADMIN")];

// PUBLIC (frontend)
router.get("/active", getActiveBanners);

// ADMIN
router.get("/", ...adminOnly, getAllBanners);
router.get("/:id", ...adminOnly, getBannerById);
router.post("/", ...adminOnly, createBanner);
router.put("/:id", ...adminOnly, updateBanner);
router.delete("/:id", ...adminOnly, deleteBanner);

export default router;