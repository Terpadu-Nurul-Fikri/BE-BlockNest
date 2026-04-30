import { prisma } from "../config/index.js";
import bcrypt from "bcryptjs";

class UsersController {
  async profile(req, res) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          userName: true,
          phone: true,
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
      console.error("profile error:", error);
      res.status(500).json({
        status: "error",
        message: "Gagal ambil profile",
      });
    }
  }

  // ✏️ UPDATE PROFILE (hanya diri sendiri)
  async update(req, res) {
    try {
      const { firstName, name, lastName, username, phone, email, password } = req.body;

      const dataToUpdate = {};
      const resolvedFirstName = firstName === undefined ? name : firstName;

      if (resolvedFirstName !== undefined) dataToUpdate.firstName = resolvedFirstName;
      if (lastName !== undefined) dataToUpdate.lastName = lastName || null;
      if (username !== undefined) dataToUpdate.username = username;
      if (phone !== undefined) dataToUpdate.phone = phone || null;
      if (email !== undefined) dataToUpdate.email = email;

      // update password jika ada
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
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          phone: user.phone,
        },
      });
    } catch (error) {
      console.error("update error:", error);
      res.status(500).json({
        status: "error",
        message: "Gagal update profile",
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
      console.error("destroy error:", error);
      res.status(500).json({
        status: "error",
        message: "Gagal hapus akun",
      });
    }
  }
}

export default new UsersController();
