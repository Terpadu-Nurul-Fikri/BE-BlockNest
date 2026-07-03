import jwt from "jsonwebtoken";
import { prisma } from "../config/index.js";

const getTokenFromRequest = (req) => {
  if (req.headers.authorization?.startsWith("Bearer")) {
    return req.headers.authorization.split(" ")[1];
  }

  return req.cookies?.jwt;
};

const redirectToLogin = (req, res) => {
  return res.status(401).json({
    success: false,
    message: "Not authenticated, please login",
  });
};

const resolveUserFromToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
  });

  return user;
};

/**
 * Auth middleware
 * Protect routes by verifying JWT token
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // Ambil token dari header Authorization atau cookie
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({ error: "Not authorized, no token provided" });
    }

    // Verifikasi token + cari user di database
    const user = await resolveUserFromToken(token);

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

/**
 * Middleware khusus guest.
 * Jika belum login, user diarahkan ke menu login.
 */
export const redirectGuestToLogin = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return redirectToLogin(req, res);
    }

    const user = await resolveUserFromToken(token);

    if (!user) {
      return redirectToLogin(req, res);
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Guest redirect middleware error:", err.message);
    return redirectToLogin(req, res);
  }
};

/**
 * Middleware otorisasi role.
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authorized" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Forbidden: Anda tidak punya akses ke resource ini",
      });
    }

    next();
  };
};

/**
 * Middleware untuk mengambil user jika ada token, tetapi tidak memblokir guest.
 */
export const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (token) {
      const user = await resolveUserFromToken(token);
      if (user) {
        req.user = user;
      }
    }
  } catch (err) {
    console.debug("Optional auth check failed:", err.message);
  }
  next();
};