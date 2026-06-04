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
  authMiddleware,
  authorizeRoles,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

const adminOnly = [authMiddleware, authorizeRoles("ADMIN")];
const customerOrAdmin = [authMiddleware, authorizeRoles("CUSTOMER", "ADMIN")];

router.get("/admin/products", ...adminOnly, getAllProductsAdmin);
router.get("/admin/products/:id", ...adminOnly, getProductByIdAdmin);
router.post("/admin/products", ...adminOnly, createProduct);
router.put("/admin/products/:id", ...adminOnly, updateProduct);
router.delete("/admin/products/:id", ...adminOnly, deleteProduct);

router.get("/category/:slug", ...customerOrAdmin, getProductsByCategory);

export default router;
