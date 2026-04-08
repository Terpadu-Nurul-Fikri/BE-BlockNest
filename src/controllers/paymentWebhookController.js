import crypto from "node:crypto";
import { prisma } from "../config/index.js";

const mapGatewayStatus = (transactionStatus, fraudStatus) => {
  if (["settlement", "capture"].includes(transactionStatus)) {
    if (transactionStatus === "capture" && fraudStatus && fraudStatus !== "accept") {
      return "PENDING";
    }
    return "SUCCESS";
  }

  if (["deny", "cancel", "expire", "failure"].includes(transactionStatus)) {
    return "FAILED";
  }

  return "PENDING";
};

const mapOrderStatus = (transactionStatus, paymentStatus) => {
  if (paymentStatus === "SUCCESS") {
    return "PAID";
  }

  if (["deny", "cancel", "expire", "failure"].includes(transactionStatus)) {
    return "CANCELLED";
  }

  return "PENDING";
};

const validateSignature = (req) => {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret) {
    return true;
  }

  const incomingSignature = req.headers["x-webhook-signature"] || req.body.signature;
  if (!incomingSignature) {
    return false;
  }

  const rawBody = req.rawBody || JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (expectedSignature.length !== String(incomingSignature).length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(String(incomingSignature))
  );
};

export const handlePaymentWebhook = async (req, res) => {
  try {
    if (!validateSignature(req)) {
      return res.status(401).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    const {
      order_id: orderId,
      transaction_id: transactionId,
      payment_type: paymentMethod,
      transaction_status: transactionStatus,
      fraud_status: fraudStatus,
      gross_amount: grossAmount,
    } = req.body;

    if (!orderId || !transactionStatus) {
      return res.status(400).json({
        success: false,
        message: "Payload webhook tidak lengkap",
      });
    }

    const paymentStatus = mapGatewayStatus(transactionStatus, fraudStatus);
    const orderStatus = mapOrderStatus(transactionStatus, paymentStatus);
    const amount = grossAmount === undefined ? 0 : Number(grossAmount);

    const result = await prisma.$transaction(async (tx) => {
      let payment = null;

      if (transactionId) {
        payment = await tx.payment.findUnique({
          where: { transactionId },
        });
      }

      if (!payment) {
        payment = await tx.payment.findFirst({
          where: { orderId },
        });
      }

      if (payment) {
        payment = await tx.payment.update({
          where: { id: payment.id },
          data: {
            paymentMethod: paymentMethod || payment.paymentMethod,
            paymentStatus,
            transactionId: transactionId || payment.transactionId,
            amount,
            paidAt: paymentStatus === "SUCCESS" ? new Date() : payment.paidAt,
          },
        });
      } else {
        payment = await tx.payment.create({
          data: {
            orderId,
            paymentMethod: paymentMethod || "unknown",
            paymentStatus,
            transactionId: transactionId || null,
            amount,
            paidAt: paymentStatus === "SUCCESS" ? new Date() : null,
          },
        });
      }

      const order = await tx.order.update({
        where: { id: orderId },
        data: { status: orderStatus },
      });

      return { payment, order };
    });

    return res.status(200).json({
      success: true,
      message: "Webhook payment diproses",
      data: {
        orderId: result.order.id,
        orderStatus: result.order.status,
        paymentStatus: result.payment.paymentStatus,
      },
    });
  } catch (error) {
    console.error("Payment webhook error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memproses webhook",
    });
  }
};
