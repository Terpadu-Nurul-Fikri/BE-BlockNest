import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import authRouters from "./routes/authRoutes.js";
import productRouters from "./routes/productRoutes.js";
import categoryRouters from "./routes/categoryRoutes.js";
import bannerRouters from "./routes/bannerRoutes.js";
import webhookRouters from "./routes/webhookRoutes.js";
import reviewRouters from "./routes/reviewRoutes.js";
import orderRouters from "./routes/orderRoutes.js";
import cartRouters from "./routes/cartRoutes.js";
import usersRouters from "./routes/usersRoutes.js";
import adminRouters from "./routes/adminRoutes.js";
import { connectDB, disconnectDB } from "./config/index.js";
import { errorHandler, notFound } from "./utils/errorHandling.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173,http://localhost:5174")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.set("trust proxy", 1);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} tidak diizinkan oleh CORS`));
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf.toString("utf8");
    },
  })
);
app.use(express.urlencoded({ extended: true }));

await connectDB();

app.use("/api/category", categoryRouters);
app.use("/api", productRouters);
app.use("/api/banners", bannerRouters);
app.use("/api/auth", authRouters);
app.use("/api/webhooks", webhookRouters);
app.use("/api/reviews", reviewRouters);
app.use("/api/orders", orderRouters);
app.use("/api/cart", cartRouters);
app.use("/api/users", usersRouters);
app.use("/api/admin", adminRouters);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (_req, res) => {
  res.json({
    message: "BlockNest API running",
    endpoints: {
      products: "/api",
      register: "/api/auth/register",
      login: "/api/auth/login",
      forgotPassword: "/api/auth/forgot-password",
      orders: "/api/orders",
      cart: "/api/cart",
      users: "/api/users",
      admin: "/api/admin",
    },
  });
});

app.use(notFound);
app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

process.on("SIGINT", async () => {
  console.log("SIGINT received. Shutting down gracefully...");
  await disconnectDB();
  process.exit(0);
});
