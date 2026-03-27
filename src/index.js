import "dotenv/config";
import express from "express";
import authRouters from "./routes/authRoutes.js";
import productRouters from "./routes/productRoutes.js";
import categoryRouters from "./routes/categoryRoutes.js";
import { connectDB, disconnectDB } from "./config/index.js";

import cors from "cors";

const app = express();
const port = 3000;


app.use(cors()); // <--- 2. Izinkan React mengambil data API
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// connection database
await connectDB();

// routes
app.use("/api", productRouters);
app.use("/api/category", categoryRouters)
app.use("/api", authRouters)

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