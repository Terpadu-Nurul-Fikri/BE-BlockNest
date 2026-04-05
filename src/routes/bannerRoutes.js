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
router.get("/active", getActiveBanners);

// ADMIN
router.get("/", getAllBanners);
router.get("/:id", getBannerById);
router.post("/", createBanner);
router.put("/:id", updateBanner);
router.delete("/:id", deleteBanner);

export default router;