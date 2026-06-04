import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// import routes
import authRouters from "./routes/authRoutes.js";
import productRouters from "./routes/productRoutes.js";
import categoryRouters from "./routes/categoryRoutes.js";
import bannerRouters from "./routes/bannerRoutes.js";
import webhookRouters from "./routes/webhookRoutes.js";
import reviewRouters from "./routes/reviewRoutes.js";
import orderRouters from "./routes/orderRoutes.js";
import cartRouters from "./routes/cartRoutes.js";

// import database connection functions
import { connectDB, disconnectDB } from "./config/index.js";

const app = express();
const port = process.env.PORT || 3000;
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173,http://localhost:5174")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// middleware
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

// connect database
await connectDB();

// routes
app.use("/api", productRouters);
app.use("/api/category", categoryRouters);
app.use("/api/banners", bannerRouters);
app.use("/api/auth", authRouters);
app.use("/api/webhooks", webhookRouters);
app.use("/api/reviews", reviewRouters);
app.use("/api/orders", orderRouters);
app.use("/api/cart", cartRouters);

// health check
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "BlockNest API running",
    endpoints: {
      products: "/api",
      register: "/api/auth/register",
      login: "/api/auth/login",
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint tidak ditemukan: ${req.method} ${req.originalUrl}`,
  });
});

// start server
const server = app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

// Handle unhandled promise rejections
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

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("SIGINT received. Shutting down gracefully...");
  await disconnectDB();
  process.exit(0);
});
