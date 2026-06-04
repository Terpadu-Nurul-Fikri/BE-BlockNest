// src/routes/productRoutes.js
import express from "express";
import {
    createProduct,
    deleteProduct,
    getAllProductsAdmin,
    getProductByIdAdmin,
    getProductsByCategory,
    updateProduct,
} from "../controllers/productController.js";
import {
    authorizeRoles,
    redirectGuestToLogin,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

const adminOnly = [redirectGuestToLogin, authorizeRoles("ADMIN")];

// Endpoint admin product CRUD
router.get("/admin/products", ...adminOnly, getAllProductsAdmin);
router.get("/admin/products/:id", ...adminOnly, getProductByIdAdmin);
router.post("/admin/products", ...adminOnly, createProduct);
router.put("/admin/products/:id", ...adminOnly, updateProduct);
router.delete("/admin/products/:id", ...adminOnly, deleteProduct);

// Endpoint: GET /product/category/:slug
router.get(
    "/category/:slug",
    redirectGuestToLogin,
    authorizeRoles("CUSTOMER", "ADMIN"),
    getProductsByCategory
);

export default router;