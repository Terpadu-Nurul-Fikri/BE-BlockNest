import jwt from "jsonwebtoken";
import { prisma } from "../config/index.js";

/**
 * Auth middleware
 * Protect routes by verifying JWT token
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // Ambil token dari header Authorization atau cookie
    const token =
      req.headers.authorization?.startsWith("Bearer")
        ? req.headers.authorization.split(" ")[1]
        : req.cookies?.jwt;

    if (!token) {
      return res.status(401).json({ error: "Not authorized, no token provided" });
    }

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Cari user di database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({ error: "User no longer exists" });
    }

    // Inject user ke request object
    req.user = user;

    // Lanjut ke route handler berikutnya
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    return res.status(401).json({ error: "Not authorized, token failed" });
  }
};