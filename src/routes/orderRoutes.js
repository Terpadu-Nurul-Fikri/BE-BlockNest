import express from "express";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  approveOrder,
  updateOrder,
  deleteOrder,
  getAllOrders,
} from "../controllers/orderController.js";
import {
  redirectGuestToLogin,
  authorizeRoles,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

const customerOrAdmin = [redirectGuestToLogin, authorizeRoles("CUSTOMER", "ADMIN")];
const adminOnly = [redirectGuestToLogin, authorizeRoles("ADMIN")];

router.post("/", ...customerOrAdmin, createOrder);
router.get("/", ...customerOrAdmin, getUserOrders);
router.get("/admin/all", ...adminOnly, getAllOrders);
router.patch("/admin/:id/approve", ...adminOnly, approveOrder);
router.patch("/admin/:id/status", ...adminOnly, updateOrderStatus);
router.put("/admin/:id", ...adminOnly, updateOrder);
router.delete("/admin/:id", ...adminOnly, deleteOrder);
router.get("/:id", ...customerOrAdmin, getOrderById);
router.patch("/:id/cancel", ...customerOrAdmin, cancelOrder);

export default router;
