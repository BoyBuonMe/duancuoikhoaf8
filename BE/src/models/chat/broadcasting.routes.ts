import { Router } from "express";
import { requireAuth } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import * as chatController from "@/models/chat/chat.controller";
import { broadcastingAuthBodySchema } from "@/models/chat/chat.validation";

const router = Router();

router.post(
  "/auth",
  requireAuth,
  validate(broadcastingAuthBodySchema),
  chatController.broadcastingAuth,
);

export default router;
