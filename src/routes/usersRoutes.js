import express from "express";
import UsersController from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validate.js";
import { updateUserSchema } from "../utils/userValidator.js";
import uploadProfile from "../middlewares/uploadProfile.js";

const router = express.Router();

// semua endpoint butuh login
router.get("/profile", authMiddleware, UsersController.profile);

router.put(
  "/profile",
  authMiddleware,
  validate(updateUserSchema),
  UsersController.update,
);

router.patch(
  "/profile/photo",
  authMiddleware,
  uploadProfile.single("photo"),
  UsersController.uploadProfilePhoto,
);

router.delete("/profile", authMiddleware, UsersController.destroy);

export default router;
