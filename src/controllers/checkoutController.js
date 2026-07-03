import { prisma } from "../config/index.js";
import { getServiceCost } from "../services/shippingService.js";

const INVOICE_INCLUDE = {
  user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
  orderItems: { include: { product: { include: { images: true } } } },
  payments: true,
};

function mapInvoice(order) {
  if (!order) return null;
  const { orderItems = [], payments = [], totalAmount, shippingCost, adminFee, grandTotal, ...rest } = order;
  const payment = payments?.[0] || null;

  return {
    ...rest,
    totalAmount: totalAmount?.toString?.() ?? totalAmount,
    shippingCost: shippingCost?.toString?.() ?? shippingCost,
    adminFee: adminFee?.toString?.() ?? adminFee,
    grandTotal: grandTotal?.toString?.() ?? grandTotal,
    items: orderItems.map(({ priceAtTime, ...item }) => ({
      ...item,
      price: priceAtTime?.toString?.() ?? priceAtTime,
    })),
    payment: payment
      ? {
          id: payment.id,
          paymentMethod: payment.paymentMethod,
          paymentStatus: payment.paymentStatus,
          amount: payment.amount?.toString?.() ?? payment.amount,
          paidAt: payment.paidAt,
          transactionId: payment.transactionId,
        }
      : null,
  };
}

function generateInvoiceNumber() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `INV-${y}${m}${d}-${rand}`;
}

export async function createCheckout(req, res) {
  try {
    const userId = req.user.id;
    const {
      items,
      shippingName,
      shippingPhone,
      shippingAddress,
      shippingCity,
      shippingProvince,
      shippingZip,
      shippingCourier,
      shippingService,
      shippingCost,
      paymentMethod,
      notes,
    } = req.body;

    if (!items?.length || !shippingAddress) {
      return res.status(400).json({ error: "Item dan alamat pengiriman wajib diisi" });
    }

    if (!shippingCourier || !shippingService || !shippingCost) {
      return res.status(400).json({ error: "Pilih kurir dan layanan pengiriman" });
    }

    if (!paymentMethod) {
      return res.status(400).json({ error: "Pilih metode pembayaran" });
    }

    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    if (products.length !== productIds.length) {
      return res.status(400).json({ error: "Satu atau lebih produk tidak ditemukan" });
    }

    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

    const subtotal = items.reduce((sum, item) => {
      return sum + parseFloat(productMap[item.productId].price) * item.quantity;
    }, 0);

    const shippingCostNum = parseFloat(shippingCost) || 0;
    const adminFeeNum = parseFloat(paymentMethod === "cod" ? "2000" : "1000");
    const grandTotalNum = subtotal + shippingCostNum + adminFeeNum;

    const order = await prisma.order.create({
      data: {
        userId,
        status: "PENDING",
        shippingName,
        shippingPhone,
        shippingAddress,
        shippingCity,
        shippingProvince,
        shippingZip,
        shippingCourier,
        shippingService,
        shippingCost: shippingCostNum,
        paymentMethod,
        totalAmount: subtotal,
        adminFee: adminFeeNum,
        grandTotal: grandTotalNum,
        notes: notes || null,
        orderItems: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtTime: productMap[item.productId].price,
          })),
        },
        payments: {
          create: {
            paymentMethod,
            paymentStatus: "PENDING",
            amount: grandTotalNum,
            transactionId: generateInvoiceNumber(),
          },
        },
      },
      include: INVOICE_INCLUDE,
    });

    res.status(201).json({ success: true, data: mapInvoice(order) });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ error: "Gagal memproses checkout" });
  }
}

export async function simulatePayment(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === "ADMIN";

    const order = await prisma.order.findFirst({
      where: { id, ...(isAdmin ? {} : { userId }) },
      include: { payments: true },
    });

    if (!order) {
      return res.status(404).json({ error: "Order tidak ditemukan" });
    }

    if (order.status !== "PENDING") {
      return res.status(400).json({ error: "Order ini tidak dalam status menunggu pembayaran" });
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.payment.updateMany({
        where: { orderId: id, paymentStatus: "PENDING" },
        data: {
          paymentStatus: "SUCCESS",
          paidAt: new Date(),
        },
      });

      return tx.order.update({
        where: { id },
        data: { status: "PAID" },
        include: INVOICE_INCLUDE,
      });
    });

    res.json({ success: true, message: "Pembayaran berhasil", data: mapInvoice(updated) });
  } catch (error) {
    console.error("Simulate payment error:", error);
    res.status(500).json({ error: "Gagal memproses pembayaran" });
  }
}

export async function getInvoice(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === "ADMIN";

    const order = await prisma.order.findFirst({
      where: { id, ...(isAdmin ? {} : { userId }) },
      include: INVOICE_INCLUDE,
    });

    if (!order) {
      return res.status(404).json({ error: "Invoice tidak ditemukan" });
    }

    res.json({ success: true, data: mapInvoice(order) });
  } catch (error) {
    console.error("Get invoice error:", error);
    res.status(500).json({ error: "Gagal mengambil invoice" });
  }
}
