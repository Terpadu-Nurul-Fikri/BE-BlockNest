// src/controllers/bannerController.js
import { prisma } from "../config/index.js";

// CREATE Banner
export const createBanner = async (req, res) => {
  try {
    const data = req.body;

    const banner = await prisma.banner.create({
      data,
    });

    res.status(201).json({
      message: "Banner created successfully",
      data: banner,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL (Admin)
export const getAllBanners = async (req, res) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ACTIVE BANNERS (Frontend)
export const getActiveBanners = async (req, res) => {
  try {
    const now = new Date();

    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
        OR: [
          {
            startDate: null,
            endDate: null,
          },
          {
            startDate: { lte: now },
            endDate: { gte: now },
          },
          {
            startDate: { lte: now },
            endDate: null,
          },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET BY ID
export const getBannerById = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await prisma.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE
export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await prisma.banner.update({
      where: { id },
      data: req.body,
    });

    res.json({
      message: "Banner updated successfully",
      data: banner,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.banner.delete({
      where: { id },
    });

    res.json({ message: "Banner deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};