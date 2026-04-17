import "dotenv/config";
import express from "express";

// import routes
import authRouters from "./routes/authRoutes.js";
import productRouters from "./routes/productRoutes.js";
import categoryRouters from "./routes/categoryRoutes.js";
import bannerRouters from "./routes/bannerRoutes.js";
import webhookRouters from "./routes/webhookRoutes.js";
import reviewRouters from "./routes/reviewRoutes.js";
import usersRouters from "./routes/usersRoutes.js";
import { errorHandler, notFound } from "./utils/errorHandling.js";

// import database connection functions
import { connectDB, disconnectDB } from "./config/index.js";

import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
const port = Number(process.env.PORT) || 3000;

app.set("trust proxy", 1);

app.use(cors()); // <--- 2. Izinkan React mengambil data API
app.use(cookieParser());
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf.toString("utf8");
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// connection database
await connectDB();

// routes
app.use("/api", productRouters);
app.use("/api/category", categoryRouters)
app.use("/api/banners", bannerRouters);
app.use("/api/auth", authRouters);
app.use("/api/webhooks", webhookRouters);
app.use("/api/reviews", reviewRouters);
app.use("/api/users", usersRouters);

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.json("Halo! Server Express ini menggunakan ES Modules.");
});

app.use(notFound);
app.use(errorHandler);

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