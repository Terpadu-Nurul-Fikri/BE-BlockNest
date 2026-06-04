// src/controllers/bannerController.js
import { prisma } from "../config/index.js";

const sendError = (res, status, message, detail) => {
  return res.status(status).json({
    success: false,
    message,
    detail: process.env.NODE_ENV === "development" ? detail : undefined,
  });
};

const buildBannerPayload = (body, isUpdate = false) => {
  const payload = {};

  const assignIfDefined = (key, value) => {
    if (value !== undefined) {
      payload[key] = value;
    }
  };

  assignIfDefined("title", body.title);
  assignIfDefined("type", body.type);
  assignIfDefined("imageUrl", body.imageUrl);
  assignIfDefined("imageAlt", body.imageAlt);
  assignIfDefined("content", body.content);
  assignIfDefined("linkUrl", body.linkUrl);
  assignIfDefined("isActive", body.isActive);

  if (body.startDate !== undefined) {
    payload.startDate = body.startDate ? new Date(body.startDate) : null;
  } else if (!isUpdate) {
    payload.startDate = null;
  }

  if (body.endDate !== undefined) {
    payload.endDate = body.endDate ? new Date(body.endDate) : null;
  } else if (!isUpdate) {
    payload.endDate = null;
  }

  return payload;
};

const validateBannerPayload = (body, isUpdate = false) => {
  if (!isUpdate) {
    if (!body.title || !body.type) {
      return "Field wajib: title dan type";
    }
  }

  if (body.startDate && Number.isNaN(new Date(body.startDate).getTime())) {
    return "Format startDate tidak valid";
  }

  if (body.endDate && Number.isNaN(new Date(body.endDate).getTime())) {
    return "Format endDate tidak valid";
  }

  if (body.startDate && body.endDate) {
    const start = new Date(body.startDate);
    const end = new Date(body.endDate);

    if (start > end) {
      return "startDate tidak boleh lebih besar dari endDate";
    }
  }

  return null;
};

// CREATE Banner
export const createBanner = async (req, res) => {
  try {
    const validationError = validateBannerPayload(req.body);
    if (validationError) {
      return sendError(res, 400, validationError);
    }

    const banner = await prisma.banner.create({
      data: buildBannerPayload(req.body, false),
    });

    return res.status(201).json({
      success: true,
      message: "Banner berhasil dibuat",
      data: banner,
    });
  } catch (error) {
    return sendError(res, 500, "Gagal membuat banner", error.message);
  }
};

// GET ALL (Admin)
export const getAllBanners = async (req, res) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      data: banners,
    });
  } catch (error) {
    return sendError(res, 500, "Gagal mengambil data banner", error.message);
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

    return res.json({
      success: true,
      data: banners,
    });
  } catch (error) {
    return sendError(res, 500, "Gagal mengambil banner aktif", error.message);
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
      return sendError(res, 404, "Banner tidak ditemukan");
    }

    return res.json({
      success: true,
      data: banner,
    });
  } catch (error) {
    return sendError(res, 500, "Gagal mengambil detail banner", error.message);
  }
};

// UPDATE
export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const validationError = validateBannerPayload(req.body, true);
    if (validationError) {
      return sendError(res, 400, validationError);
    }

    const existingBanner = await prisma.banner.findUnique({ where: { id } });
    if (!existingBanner) {
      return sendError(res, 404, "Banner tidak ditemukan");
    }

    const banner = await prisma.banner.update({
      where: { id },
      data: buildBannerPayload(req.body, true),
    });

    return res.json({
      success: true,
      message: "Banner berhasil diperbarui",
      data: banner,
    });
  } catch (error) {
    return sendError(res, 500, "Gagal memperbarui banner", error.message);
  }
};

// DELETE
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const existingBanner = await prisma.banner.findUnique({ where: { id } });
    if (!existingBanner) {
      return sendError(res, 404, "Banner tidak ditemukan");
    }

    await prisma.banner.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Banner berhasil dihapus",
    });
  } catch (error) {
    return sendError(res, 500, "Gagal menghapus banner", error.message);
  }
};