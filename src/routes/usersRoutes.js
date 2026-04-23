import express from "express";
import UsersController from "../controllers/UsersController.js";
import validate from "../middlewares/validate.js";
import { updateUserSchema, idParamSchema } from "../utils/userValidator.js";

const router = express.Router();

// routes
router.get("/", UsersController.index);

router.get("/:id", validate(idParamSchema, "params"), UsersController.show);

router.put(
  "/:id",
  validate(idParamSchema, "params"),
  validate(updateUserSchema, "body"),
  UsersController.update,
);

router.delete(
  "/:id",
  validate(idParamSchema, "params"),
  UsersController.destroy,
);

export default router;