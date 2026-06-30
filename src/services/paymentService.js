import { prisma } from "../config/index.js";

export const DUMMY_PAYMENT_METHOD = "dummy_manual";

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const approveOrderWithDummyPayment = async (orderId, include) => {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.order.findUnique({ where: { id: orderId } });
    if (!existing) {
      throw createHttpError(404, "Order tidak ditemukan");
    }

    if (existing.status !== "PENDING") {
      throw createHttpError(400, "Hanya order PENDING yang bisa di-approve");
    }

    const paidAt = new Date();
    const existingPayment = await tx.payment.findFirst({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    });

    const paymentData = {
      paymentMethod: DUMMY_PAYMENT_METHOD,
      paymentStatus: "SUCCESS",
      amount: existing.totalAmount,
      paidAt,
    };

    const payment = existingPayment
      ? await tx.payment.update({
          where: { id: existingPayment.id },
          data: paymentData,
        })
      : await tx.payment.create({
          data: {
            orderId,
            transactionId: null,
            ...paymentData,
          },
        });

    const order = await tx.order.update({
      where: { id: orderId },
      data: { status: "PAID" },
      include,
    });

    return { order, payment };
  });
};
