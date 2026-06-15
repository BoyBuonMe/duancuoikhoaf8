import { Router } from "express";
import { requireAuth } from "@/middlewares/auth.middleware";
import * as userController from "@/models/users/users.controller";

const router = Router();

router.get("/me", requireAuth, userController.me);
router.get("/me/tell", requireAuth, userController.getTell);

export default router;
