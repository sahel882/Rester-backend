import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { createMessage, getMessagesByConversation, markMessagesAsRead } from "../controllers/messageController";

const router = Router();

router.post("/", requireAuth(), createMessage);

router.get("/:conversationId", requireAuth(), getMessagesByConversation);

router.put("/:conversationId/read", requireAuth(), markMessagesAsRead);

export default router;