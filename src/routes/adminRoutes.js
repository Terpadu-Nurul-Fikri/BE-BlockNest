import express from "express";
import AdminController from "../controllers/adminController.js";
import {
  authMiddleware,
  authorizeRoles,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get(
  "/users",
  authMiddleware,
  authorizeRoles("ADMIN"),
  AdminController.getAllUsers,
);

export default router;
