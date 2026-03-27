// src/routes/productRoutes.js
import express from "express";
import { getProductsByCategory } from "../controllers/productController.js";

const router = express.Router();

// Endpoint: GET /product/category/:slug
router.get("/category/:slug", getProductsByCategory);

export default router;