import { prisma } from "../config/index.js";

// GET /api/cart — ambil cart milik user yang login
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const items = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const total = items.reduce(
      (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
      0
    );

    res.json({ success: true, data: { items, total, itemCount: items.length } });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ error: "Gagal mengambil cart" });
  }
};

// POST /api/cart — tambah item ke cart (atau increment qty jika sudah ada)
// Accepts: { productId: "uuid" } OR { slug: "product-slug" }
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, slug, quantity = 1 } = req.body;

    if (!productId && !slug) {
      return res.status(400).json({ error: "productId atau slug wajib diisi" });
    }

    // Cari produk by UUID atau by slug
    let product;
    if (productId) {
      product = await prisma.product.findUnique({ where: { id: productId } });
    } else {
      product = await prisma.product.findUnique({ where: { slug } });
    }

    if (!product) {
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }
    if (product.stockQuantity < 1) {
      return res.status(400).json({ error: "Stok produk habis" });
    }

    const actualProductId = product.id;

    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId: actualProductId } },
    });

    let item;

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > product.stockQuantity) {
        return res.status(400).json({ error: "Melebihi stok yang tersedia" });
      }
      item = await prisma.cartItem.update({
        where: { userId_productId: { userId, productId: actualProductId } },
        data: { quantity: newQty },
        include: {
          product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
        },
      });
    } else {
      if (quantity > product.stockQuantity) {
        return res.status(400).json({ error: "Melebihi stok yang tersedia" });
      }
      item = await prisma.cartItem.create({
        data: { userId, productId: actualProductId, quantity },
        include: {
          product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
        },
      });
    }

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ error: "Gagal menambah ke cart" });
  }
};

// PUT /api/cart/:productId — update quantity item
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: "Quantity minimal 1" });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }
    if (quantity > product.stockQuantity) {
      return res.status(400).json({ error: "Melebihi stok yang tersedia" });
    }

    const item = await prisma.cartItem.update({
      where: { userId_productId: { userId, productId } },
      data: { quantity },
      include: {
        product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
      },
    });

    res.json({ success: true, data: item });
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({ error: "Gagal update cart" });
  }
};

// DELETE /api/cart/clear — kosongkan seluruh cart user
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    await prisma.cartItem.deleteMany({ where: { userId } });
    res.json({ success: true, message: "Cart dikosongkan" });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ error: "Gagal mengosongkan cart" });
  }
};

// DELETE /api/cart/:productId — hapus satu item dari cart
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    await prisma.cartItem.delete({
      where: { userId_productId: { userId, productId } },
    });

    res.json({ success: true, message: "Item dihapus dari cart" });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ error: "Gagal menghapus item dari cart" });
  }
};
