import { prisma } from "../config/index.js";
import { approveOrderWithDummyPayment } from "../services/paymentService.js";

const mapOrder = (order) => {
  if (!order) return order;

  const { orderItems = [], totalAmount, ...rest } = order;

  let mappedUser = rest.user;
  if (rest.user) {
    mappedUser = {
      ...rest.user,
      name: `${rest.user.firstName || ""} ${rest.user.lastName || ""}`.trim(),
    };
  }

  return {
    ...rest,
    user: mappedUser,
    totalAmount: totalAmount?.toString?.() ?? totalAmount,
    items: orderItems.map(({ priceAtTime, ...item }) => ({
      ...item,
      price: priceAtTime?.toString?.() ?? priceAtTime,
    })),
  };
};

const ORDER_INCLUDE = {
  user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
  orderItems: { include: { product: { include: { images: true } } } },
};

const ADMIN_ORDER_INCLUDE = {
  user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
  orderItems: { include: { product: true } },
};

/**
 * Create new order
 * Body: { items: [{productId, quantity}], shippingAddress, notes }
 */
export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, notes } = req.body;
    const userId = req.user.id;

    if (!items || items.length === 0 || !shippingAddress) {
      return res.status(400).json({ error: "items dan shippingAddress wajib diisi" });
    }

    // Fetch products to get prices
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({ error: "Satu atau lebih produk tidak ditemukan" });
    }

    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

    const totalAmount = items.reduce((sum, item) => {
      return sum + parseFloat(productMap[item.productId].price) * item.quantity;
    }, 0);

    const order = await prisma.order.create({
      data: {
        userId,
        shippingAddress,
        notes: notes || null,
        totalAmount,
        status: "PENDING",
        orderItems: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtTime: productMap[item.productId].price,
          })),
        },
      },
      include: {
        orderItems: { include: { product: true } },
      },
    });

    res.status(201).json({ success: true, data: mapOrder(order) });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ error: "Gagal membuat order" });
  }
};

/**
 * Get current user's orders
 */
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: {
          orderItems: { include: { product: { include: { images: true } } } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    res.json({
      success: true,
      data: orders.map(mapOrder),
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ error: "Gagal mengambil orders" });
  }
};

/**
 * Get order by ID
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === "ADMIN";

    const order = await prisma.order.findFirst({
      where: { id, ...(isAdmin ? {} : { userId }) },
      include: ORDER_INCLUDE,
    });

    if (!order) return res.status(404).json({ error: "Order tidak ditemukan" });

    res.json({ success: true, data: mapOrder(order) });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ error: "Gagal mengambil order" });
  }
};

/**
 * Cancel order (user only, status PENDING)
 */
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await prisma.order.findFirst({ where: { id, userId } });

    if (!order) return res.status(404).json({ error: "Order tidak ditemukan" });
    if (order.status !== "PENDING") {
      return res.status(400).json({ error: "Hanya order PENDING yang bisa dibatalkan" });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: ORDER_INCLUDE,
    });

    res.json({ success: true, data: mapOrder(updated) });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ error: "Gagal membatalkan order" });
  }
};

/**
 * Update order status (Admin only)
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["PENDING", "PAID", "SHIPPED", "COMPLETED", "CANCELLED"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status tidak valid. Pilihan: ${validStatuses.join(", ")}` });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: ADMIN_ORDER_INCLUDE,
    });

    res.json({ success: true, data: mapOrder(order) });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ error: "Gagal update status order" });
  }
};

/**
 * Approve order (Admin only)
 * Saat ini approval manual berarti status naik dari PENDING ke PAID.
 */
export const approveOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const { order, payment } = await approveOrderWithDummyPayment(id, ADMIN_ORDER_INCLUDE);

    res.json({
      success: true,
      message: "Pesanan berhasil di-approve",
      data: {
        ...mapOrder(order),
        payment: {
          id: payment.id,
          paymentMethod: payment.paymentMethod,
          paymentStatus: payment.paymentStatus,
          amount: payment.amount?.toString?.() ?? payment.amount,
          paidAt: payment.paidAt,
        },
      },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.error("Approve order error:", error);
    res.status(500).json({ error: "Gagal approve pesanan" });
  }
};

/**
 * Update order detail (Admin only)
 */
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { shippingAddress, notes, status } = req.body;
    const validStatuses = ["PENDING", "PAID", "SHIPPED", "COMPLETED", "CANCELLED"];

    const data = {};
    if (shippingAddress !== undefined) {
      if (!shippingAddress.trim()) {
        return res.status(400).json({ error: "Alamat pengiriman tidak boleh kosong" });
      }
      data.shippingAddress = shippingAddress;
    }
    if (notes !== undefined) data.notes = notes || null;
    if (status !== undefined) {
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Status tidak valid. Pilihan: ${validStatuses.join(", ")}` });
      }
      data.status = status;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "Tidak ada data yang diupdate" });
    }

    const order = await prisma.order.update({
      where: { id },
      data,
      include: ADMIN_ORDER_INCLUDE,
    });

    res.json({ success: true, message: "Pesanan berhasil diupdate", data: mapOrder(order) });
  } catch (error) {
    console.error("Update order error:", error);
    res.status(500).json({ error: "Gagal update pesanan" });
  }
};

/**
 * Delete order (Admin only)
 */
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { payments: true },
    });

    if (!order) return res.status(404).json({ error: "Order tidak ditemukan" });
    if (order.payments.length > 0) {
      return res.status(400).json({ error: "Order yang sudah memiliki payment tidak bisa dihapus" });
    }

    await prisma.order.delete({ where: { id } });

    res.json({ success: true, message: "Pesanan berhasil dihapus" });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({ error: "Gagal hapus pesanan" });
  }
};

/**
 * Get all orders (Admin only)
 */
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = status ? { status } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: ADMIN_ORDER_INCLUDE,
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      data: orders.map(mapOrder),
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ error: "Gagal mengambil semua orders" });
  }
};
