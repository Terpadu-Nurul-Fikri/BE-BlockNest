import { prisma } from "../config/index.js";

class AdminController {
  async getAllUsers(req, res) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      res.status(200).json({
        status: "success",
        message: "Berhasil mengambil data semua user",
        total: users.length,
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
}

export default new AdminController();