import "dotenv/config";
import express from "express";
import cors from "cors";
import productRouters from "./routes/productRoutes.js";
import authRouters from "./routes/authRoutes.js";
import { connectDB, disconnectDB } from "./config/index.js";

const app = express();
const port = process.env.PORT || 3000;

// connect DB dulu
await connectDB();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

// routes
app.use("/product", productRouters);
app.use("/api/auth", authRouters);

app.get("/", (req, res) => {
  res.json({
    message: "BlockNest API running",
    endpoints: {
      products: "/product",
      register: "/api/auth/register",
      login: "/api/auth/login",
    },
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
