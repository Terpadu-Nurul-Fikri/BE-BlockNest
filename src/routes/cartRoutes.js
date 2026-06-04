import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";
import {
  redirectGuestToLogin,
  authorizeRoles,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Semua endpoint cart butuh login (CUSTOMER atau ADMIN)
const authenticated = [redirectGuestToLogin, authorizeRoles("CUSTOMER", "ADMIN")];

router.get("/", ...authenticated, getCart);
router.post("/", ...authenticated, addToCart);
router.put("/:productId", ...authenticated, updateCartItem);
router.delete("/clear", ...authenticated, clearCart);
router.delete("/:productId", ...authenticated, removeFromCart);

export default router;
