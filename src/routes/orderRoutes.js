const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/roleMiddleware");

// User routes (authentication required)
router.post("/", authMiddleware, orderController.createOrder);
router.get("/", authMiddleware, orderController.getUserOrders);
router.get("/:id", authMiddleware, orderController.getOrderById);
router.patch("/:id/cancel", authMiddleware, orderController.cancelOrder);

// Admin routes
router.get("/admin/all", authMiddleware, adminOnly, orderController.getAllOrders);
router.patch("/admin/:id/status", authMiddleware, adminOnly, orderController.updateOrderStatus);

module.exports = router;
