// controllers/paymentWebhookController.js
import { prisma } from "../config/index.js";
import errorHandler from "../utils/errorHandler.js";
import { validateSignature, validateWebhookPayload } from "../utils/validator.js";

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

export const handlePaymentWebhook = async (req, res) => {
  try {
    // 1. Validasi Keamanan (Signature)
    if (!validateSignature(req)) {
      return errorHandler(res, "Invalid Signature", 401, "Akses ditolak: Invalid webhook signature");
    }

    // 2. Validasi Input Payload
    const validationError = validateWebhookPayload(req.body);
    if (validationError) {
      // Menggunakan status 422 untuk Validation Error sesuai materi PDF
      return errorHandler(res, validationError, 422, "Validasi gagal: Payload tidak lengkap");
    }

    const {
      order_id: orderId,
      transaction_id: transactionId,
      payment_type: paymentMethod,
      transaction_status: transactionStatus,
      fraud_status: fraudStatus,
      gross_amount: grossAmount,
    } = req.body;

    const paymentStatus = mapGatewayStatus(transactionStatus, fraudStatus);
    const orderStatus = mapOrderStatus(transactionStatus, paymentStatus);
    const amount = grossAmount === undefined ? 0 : Number(grossAmount);

    // 3. Logika Bisnis (Database Transaction)
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

    // 4. Response Sukses
    return res.status(200).json({
      success: true,
      message: "Webhook payment berhasil diproses",
      data: {
        orderId: result.order.id,
        orderStatus: result.order.status,
        paymentStatus: result.payment.paymentStatus,
      },
    });

  } catch (error) {
    // 5. Penanganan Unexpected Error (Bug Server / Database) menggunakan status 500
    return errorHandler(res, error, 500, "Terjadi kesalahan sistem saat memproses webhook");
  }
};