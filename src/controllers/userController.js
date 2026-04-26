import { prisma } from "../config/index.js";
import bcrypt from "bcryptjs";

class UsersController {
  // 🔍 GET PROFILE (user login)
  async profile(req, res) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
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
        message: "Gagal ambil profile",
        error: error.message,
      });
    }
  }

  // ✏️ UPDATE PROFILE (hanya diri sendiri)
  async update(req, res) {
    try {
      const { name, email, phone, password } = req.body;

      const dataToUpdate = {};

      if (name !== undefined) dataToUpdate.name = name;
      if (email !== undefined) dataToUpdate.email = email;
      if (phone !== undefined) dataToUpdate.phone = phone;

      if (password) {
        const salt = await bcrypt.genSalt(10);
        dataToUpdate.password = await bcrypt.hash(password, salt);
      }

      if (Object.keys(dataToUpdate).length === 0) {
        return res.status(400).json({
          status: "error",
          message: "Tidak ada data yang diupdate",
        });
      }

      const user = await prisma.user.update({
        where: { id: req.user.id },
        data: dataToUpdate,
      });

      res.status(200).json({
        status: "success",
        message: "Berhasil update profile",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Gagal update profile",
        error: error.message,
      });
    }
  }

  // 🗑️ DELETE ACCOUNT (hapus akun sendiri)
  async destroy(req, res) {
    try {
      await prisma.user.delete({
        where: { id: req.user.id },
      });

      res.status(200).json({
        status: "success",
        message: "Akun berhasil dihapus",
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Gagal hapus akun",
        error: error.message,
      });
    }
  }
}

export default new UsersController();
