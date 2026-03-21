import express from "express";
import { prisma } from "../config/index.js";

const router = express.Router();

// GET semua produk
router.get("/", async (req, res) => {
  try {
    const products = await prisma.product.findMany();

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal ambil data produk",
    });
  }
});

export default router;