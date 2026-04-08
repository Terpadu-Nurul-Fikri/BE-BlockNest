import express from "express";
import { handlePaymentWebhook } from "../controllers/paymentWebhookController.js";

const router = express.Router();

router.post("/payment", handlePaymentWebhook);

export default router;
