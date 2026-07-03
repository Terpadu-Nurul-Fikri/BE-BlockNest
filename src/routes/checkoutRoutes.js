import express from "express";
import {
  createCheckout,
  simulatePayment,
  getInvoice,
} from "../controllers/checkoutController.js";
import { getCouriers, getServices } from "../services/shippingService.js";
import {
  redirectGuestToLogin,
  authorizeRoles,
} from "../middlewares/authMiddleware.js";

const router = express.Router();
const customerOrAdmin = [redirectGuestToLogin, authorizeRoles("CUSTOMER", "ADMIN")];

// Shipping
router.get("/shipping/couriers", (_req, res) => {
  res.json({ success: true, data: getCouriers() });
});

router.get("/shipping/services/:courier", (req, res) => {
  const { courier } = req.params;
  const services = getServices(courier);
  res.json({ success: true, data: services });
});

// Checkout
router.post("/checkout", ...customerOrAdmin, createCheckout);
router.post("/checkout/:id/pay", ...customerOrAdmin, simulatePayment);
router.get("/checkout/:id/invoice", ...customerOrAdmin, getInvoice);

export default router;
