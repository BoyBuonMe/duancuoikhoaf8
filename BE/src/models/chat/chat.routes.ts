import { Router } from "express";
import { requireAuth } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import * as chatController from "@/models/chat/chat.controller";
import {
  conversationIdParamsSchema,
  sendMessageBodySchema,
  supportListQuerySchema,
  updateSupportConversationBodySchema,
} from "@/models/chat/chat.validation";

const router = Router();

router.use(requireAuth);

router.post("/ai/conversations", chatController.getOrCreateAiConversation);
router.get(
  "/ai/conversations/:id/messages",
  validate(conversationIdParamsSchema, "params"),
  chatController.listAiMessages,
);
router.post(
  "/ai/conversations/:id/messages",
  validate(conversationIdParamsSchema, "params"),
  validate(sendMessageBodySchema),
  chatController.sendAiMessage,
);

router.get(
  "/support/conversations",
  validate(supportListQuerySchema, "query"),
  chatController.listSupportConversations,
);
router.post("/support/conversations", chatController.createSupportConversation);
router.patch(
  "/support/conversations/:id",
  validate(conversationIdParamsSchema, "params"),
  validate(updateSupportConversationBodySchema),
  chatController.updateSupportConversation,
);
router.delete(
  "/support/conversations/:id",
  validate(conversationIdParamsSchema, "params"),
  chatController.deleteSupportConversation,
);
router.get(
  "/support/conversations/:id/messages",
  validate(conversationIdParamsSchema, "params"),
  chatController.listSupportMessages,
);
router.post(
  "/support/conversations/:id/messages",
  validate(conversationIdParamsSchema, "params"),
  validate(sendMessageBodySchema),
  chatController.sendSupportMessage,
);

export default router;
