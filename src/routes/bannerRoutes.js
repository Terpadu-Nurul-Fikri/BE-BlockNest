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

const router = express.Router();

// PUBLIC (frontend)
router.get("/banners/active", getActiveBanners);

// ADMIN
router.get("/banners", getAllBanners);
router.get("/banners/:id", getBannerById);
router.post("/banners", createBanner);
router.put("/banners/:id", updateBanner);
router.delete("/banners/:id", deleteBanner);

export default router;