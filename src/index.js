import "dotenv/config";
import express from "express";
import productRouters from "./routes/productRoutes.js";
import { connectDB, disconnectDB } from "./config/index.js";

const app = express();
const port = 3000;

// connect DB dulu
await connectDB();

// routes
app.use("/product", productRouters);

app.get("/", (req, res) => {
  res.json("Halo! Server Express ini menggunakan ES Modules.");
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