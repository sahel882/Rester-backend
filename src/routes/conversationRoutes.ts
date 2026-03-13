import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { createConversation, getConversationById, getConversationsByUser, updateLastMessage } from "../controllers/conversationController";

const router = Router();

router.post("/", requireAuth(), createConversation);

router.get("/user/:id", requireAuth(), getConversationsByUser);

router.get("/:id", requireAuth(), getConversationById);

router.put("/:id/message", requireAuth(), updateLastMessage);

export default router;