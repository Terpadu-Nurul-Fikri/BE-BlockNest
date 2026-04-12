import express from "express";
import UsersController from "../controllers/usersController.js";
import {
  authorizeRoles,
  redirectGuestToLogin,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

const adminOnly = [redirectGuestToLogin, authorizeRoles("ADMIN")];

router.get("/", ...adminOnly, UsersController.index);
router.get("/:id", ...adminOnly, UsersController.show);
router.put("/:id", ...adminOnly, UsersController.update);
router.delete("/:id", ...adminOnly, UsersController.destroy);

export default router;