import { prisma } from "../config/index.js";

class UsersController {
  // 🔍 READ semua user
  async index(req, res) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      res.status(200).json({
        status: "success",
        data: users,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Gagal mengambil data user",
        error: error.message,
      });
    }
  }

  // 🔍 READ by ID
  async show(req, res) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User tidak ditemukan",
        });
      }

      res.status(200).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Gagal mengambil data user",
        error: error.message,
      });
    }
  }

  // ✏️ UPDATE user
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, email } = req.body;

      const user = await prisma.user.update({
        where: {
          id,
        },
        data: {
          name,
          email,
        },
      });

      res.status(200).json({
        status: "success",
        message: "Berhasil update user",
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Gagal update user",
        error: error.message,
      });
    }
  }

  // 🗑️ DELETE user
  async destroy(req, res) {
    try {
      const { id } = req.params;

      await prisma.user.delete({
        where: {
          id,
        },
      });

      res.status(200).json({
        status: "success",
        message: "Berhasil delete user",
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Gagal delete user",
        error: error.message,
      });
    }
  }
}

export default new UsersController();