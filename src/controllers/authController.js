import { prisma } from "../config/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const getFrontendUrl = () => {
  const configured = process.env.FRONTEND_URL || "http://localhost:5173";
  return configured.split(",")[0].trim().replace(/\/$/, "");
};

const buildUserName = (email, firstName) => {
  return (firstName || email.split("@")[0]).trim().toLowerCase().replace(/\s+/g, ".");
};

const mapAuthUser = (user) => {
  const name = user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim();

  return {
    id: user.id,
    email: user.email,
    name,
    firstName: user.firstName || name.split(" ")[0] || "",
    lastName: user.lastName || name.split(" ").slice(1).join(" ") || undefined,
    phone: user.phone,
    role: user.role,
    userName: user.userName,
    photoUrl: user.photoUrl,
  };
};

const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, userName } = req.body;

    if (!email || !password || !firstName) {
      return res.status(400).json({
        success: false,
        message: "email, password, dan firstName wajib diisi",
      });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User dengan email ini sudah ada",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const name = `${firstName} ${lastName || ""}`.trim();

    const user = await prisma.user.create({
      data: {
        name,
        firstName,
        lastName: lastName || null,
        userName: userName || buildUserName(email, firstName),
        email,
        password: hashedPassword,
        phone,
      },
    });

    res.status(201).json({
      success: true,
      data: mapAuthUser(user),
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email dan password wajib diisi" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ success: false, message: "Email atau password salah" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Email atau password salah" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login berhasil",
      token,
      data: mapAuthUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email wajib diisi" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "Jika email terdaftar, link reset password akan dikirim",
      });
    }

    const resetToken = jwt.sign(
      {
        id: user.id,
        purpose: "password-reset",
        passwordHash: user.password,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.PASSWORD_RESET_EXPIRE || "15m" }
    );
    const resetUrl = `${getFrontendUrl()}/reset-password?token=${resetToken}`;

    return res.status(200).json({
      success: true,
      message: "Jika email terdaftar, link reset password akan dikirim",
      ...(process.env.NODE_ENV !== "production" ? { resetToken, resetUrl } : {}),
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, message: "Token dan password wajib diisi" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password minimal 6 karakter" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.purpose !== "password-reset") {
      return res.status(400).json({ success: false, message: "Token reset password tidak valid" });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || user.password !== decoded.passwordHash) {
      return res.status(400).json({ success: false, message: "Token reset password tidak valid atau sudah dipakai" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return res.status(200).json({
      success: true,
      message: "Password berhasil direset. Silakan login dengan password baru",
    });
  } catch (error) {
    console.error("Reset password error:", error.message);
    return res.status(400).json({ success: false, message: "Token reset password tidak valid atau expired" });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        userName: true,
        email: true,
        phone: true,
        role: true,
        photoUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan" });
    }

    res.status(200).json({
      success: true,
      data: mapAuthUser(user),
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan" });
    }

    const updateData = {};

    if (firstName) {
      updateData.firstName = firstName;
      updateData.lastName = lastName || null;
      updateData.name = `${firstName} ${lastName || ""}`.trim();
    }
    if (phone !== undefined) {
      updateData.phone = phone;
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: "Password lama wajib diisi" });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Password lama salah" });
      }
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(newPassword, salt);
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        userName: true,
        email: true,
        phone: true,
        role: true,
        photoUrl: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Profil berhasil diperbarui",
      data: mapAuthUser(updated),
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export { register, login, forgotPassword, resetPassword, getProfile, updateProfile };
