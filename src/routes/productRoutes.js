import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProductsAdmin,
  getProductByIdAdmin,
  getProductBySlug,
  getProductsByCategory,
  updateProduct,
  searchProducts,
  getFeaturedProducts,
} from "../controllers/productController.js";
import {
  authMiddleware,
  authorizeRoles,
  optionalAuthMiddleware,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

const adminOnly = [authMiddleware, authorizeRoles("ADMIN")];
const customerOrAdmin = [authMiddleware, authorizeRoles("CUSTOMER", "ADMIN")];

router.get("/admin/products", ...adminOnly, getAllProductsAdmin);
router.get("/admin/products/:id", ...adminOnly, getProductByIdAdmin);
router.post("/admin/products", ...adminOnly, createProduct);
router.put("/admin/products/:id", ...adminOnly, updateProduct);
router.delete("/admin/products/:id", ...adminOnly, deleteProduct);

router.get("/products/:slug", getProductBySlug);

router.get("/category/:slug", ...customerOrAdmin, getProductsByCategory);

// Public routes — no auth needed
router.get("/products/search", searchProducts);
router.get("/products/featured", getFeaturedProducts);
router.get("/products/detail/:slug", optionalAuthMiddleware, getProductBySlug);

export default router;

