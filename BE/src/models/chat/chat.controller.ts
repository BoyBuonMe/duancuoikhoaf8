import type { NextFunction, Request, Response } from "express";
import { isPusherConfigured, pusher } from "@/config/pusher.config";
import * as chatService from "@/models/chat/chat.service";
import type {
  BroadcastingAuthBody,
  ConversationIdParams,
  SendMessageBody,
  SupportListQuery,
  UpdateSupportConversationBody,
} from "@/models/chat/chat.validation";

function userContext(req: Request) {
  return {
    userId: req.user!.id,
    role: req.user!.role,
  };
}

/** POST /api/chat/ai/conversations — Lấy hoặc tạo AI conversation */
export async function getOrCreateAiConversation(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId } = userContext(req);
    const conversation = await chatService.getOrCreateAiConversation(userId);
    res.status(201).json({ conversation });
  } catch (e) {
    next(e);
  }
}

/** GET /api/chat/ai/conversations/:id/messages */
export async function listAiMessages(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId } = userContext(req);
    const { id } = req.params as ConversationIdParams;
    const messages = await chatService.listAiMessages(userId, id);
    res.json({ messages });
  } catch (e) {
    next(e);
  }
}

/** POST /api/chat/ai/conversations/:id/messages */
export async function sendAiMessage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId } = userContext(req);
    const { id } = req.params as ConversationIdParams;
    const { content } = req.body as SendMessageBody;
    const result = await chatService.sendAiMessage(userId, id, content);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
}

/** GET /api/chat/support/conversations */
export async function listSupportConversations(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId, role } = userContext(req);
    const { status } = req.query as SupportListQuery;
    const conversations = await chatService.listSupportConversations(
      userId,
      role,
      status,
    );
    res.json({ conversations });
  } catch (e) {
    next(e);
  }
}

/** POST /api/chat/support/conversations */
export async function createSupportConversation(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId } = userContext(req);
    const conversation = await chatService.createSupportConversation(userId);
    res.status(201).json({ conversation });
  } catch (e) {
    next(e);
  }
}

/** PATCH /api/chat/support/conversations/:id */
export async function updateSupportConversation(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId, role } = userContext(req);
    const { id } = req.params as ConversationIdParams;
    const body = req.body as UpdateSupportConversationBody;
    const conversation = await chatService.updateSupportConversation(
      userId,
      role,
      id,
      body,
    );
    res.json({ conversation });
  } catch (e) {
    next(e);
  }
}

/** GET /api/chat/support/conversations/:id/messages */
export async function listSupportMessages(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId, role } = userContext(req);
    const { id } = req.params as ConversationIdParams;
    const messages = await chatService.listSupportMessages(userId, role, id);
    res.json({ messages });
  } catch (e) {
    next(e);
  }
}

/** POST /api/chat/support/conversations/:id/messages */
export async function sendSupportMessage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId, role } = userContext(req);
    const { id } = req.params as ConversationIdParams;
    const { content } = req.body as SendMessageBody;
    const message = await chatService.sendSupportMessage(
      userId,
      role,
      id,
      content,
    );
    res.status(201).json({ message });
  } catch (e) {
    next(e);
  }
}

/** POST /api/broadcasting/auth — Soketi/Pusher private channel auth */
export async function broadcastingAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!isPusherConfigured()) {
      res.status(503).json({ message: "Realtime not configured" });
      return;
    }

    const { userId, role } = userContext(req);
    const { socket_id, channel_name } = req.body as BroadcastingAuthBody;

    await chatService.authorizePrivateChannel(userId, role, channel_name);

    const auth = pusher.authorizeChannel(socket_id, channel_name);
    res.send(auth);
  } catch (e) {
    next(e);
  }
}
