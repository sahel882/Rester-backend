import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";

export async function createMessage(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { conversationId, receiverId, content, fileURL } = req.body;

        if (!conversationId || !receiverId || !content) {
            return res
                .status(400)
                .json({ error: "Please enter all the details" });
        };

        const message = await queries.createMessage({
            conversationId,
            senderId: userId,
            receiverId,
            content,
            fileURL: fileURL || null,
        });

        return res.status(200).json(message)


    } catch (error) {
        console.error("Error while creating a message", error);
        return res.status(500).json({ error: "Failed to create a message" });
    };
};

export async function getMessagesByConversation(req: Request, res: Response) {
    try {
        const { id } = req.params as { id: string };

        const message = await queries.getMessagesByConversation(id);
        return res.status(200).json(message);

    } catch (error) {
        console.error("Error getting message:", error);
        return res.status(500).json({ error: "Failed to get message" });
    }
};

export async function markMessagesAsRead(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req)
        if (!userId) return res.status(401).json({ error: "Unauthorized" })

        const { id } = req.params as { id: string }

        await queries.markMessagesAsRead(id)
        return res.status(200).json({ message: "Messages marked as read!" })

    } catch (error) {
        console.error("Error marking messages as read:", error)
        return res.status(500).json({ error: "Failed to mark messages as read" })
    }
};