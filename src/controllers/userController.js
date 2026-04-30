import { prisma } from "../config/index.js";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

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
          photoUrl: true,
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

  async update(req, res) {
    try {
      const { firstName, name, lastName, username, phone, email, password } =
        req.body;

      const dataToUpdate = {};
      const resolvedFirstName = firstName === undefined ? name : firstName;

      if (resolvedFirstName !== undefined)
        dataToUpdate.firstName = resolvedFirstName;
      if (lastName !== undefined) dataToUpdate.lastName = lastName || null;
      if (username !== undefined) dataToUpdate.userName = username;
      if (phone !== undefined) dataToUpdate.phone = phone || null;
      if (email !== undefined) dataToUpdate.email = email;

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
          userName: user.userName,
          email: user.email,
          phone: user.phone,
          photoUrl: user.photoUrl,
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

  async uploadProfilePhoto(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: "error",
          message: "File foto profil harus diunggah",
        });
      }

      const currentUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { photoUrl: true },
      });

      if (!currentUser) {
        return res.status(404).json({
          status: "error",
          message: "User tidak ditemukan",
        });
      }

      if (currentUser.photoUrl) {
        const oldImagePath = path.join(
          process.cwd(),
          "uploads/profiles",
          currentUser.photoUrl,
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          photoUrl: req.file.filename,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          photoUrl: true,
        },
      });

      res.status(200).json({
        status: "success",
        message: "Foto profil berhasil diperbarui",
        data: {
          ...updatedUser,
          photoUrl: `/uploads/profiles/${updatedUser.photoUrl}`,
        },
      });
    } catch (error) {
      console.error("upload profile photo error:", error);
      res.status(500).json({
        status: "error",
        message: "Gagal upload foto profil",
      });
    }
  }

  async destroy(req, res) {
    try {
      const currentUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { photoUrl: true },
      });

      if (currentUser?.photoUrl) {
        const imagePath = path.join(
          process.cwd(),
          "uploads/profiles",
          currentUser.photoUrl,
        );
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

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