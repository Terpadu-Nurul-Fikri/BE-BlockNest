import express from "express";
import UsersController from "../controllers/usersController.js";

const router = express.Router();

router.get("/", UsersController.index);
router.get("/:id", UsersController.show);
router.put("/:id", UsersController.update);
router.delete("/:id", UsersController.destroy);

export default router;