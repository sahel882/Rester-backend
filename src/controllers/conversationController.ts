import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";

export async function createConversation(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { sellerId } = req.body;

        if (!sellerId) {
            return res
                .status(400)
                .json({ error: "Please enter all the details" });
        };

        const conversation = await queries.createConversation({
            buyerId: userId,
            sellerId,
        });

        return res.status(200).json(conversation);


    } catch (error) {
        console.error("Error while creating a conversation", error);
        return res.status(500).json({ error: "Failed to create a conversation" });
    };
};

export async function getConversationById(req: Request, res: Response) {
    try {
        const { id } = req.params as { id: string };

        const conversation = await queries.getConversationById(id);

        if (!conversation) return res.status(404).json({ error: "Conversation not found" });

        return res.status(200).json(conversation);
    } catch (error) {
        console.error("Error getting conversation:", error);
        return res.status(500).json({ error: "Failed to get conversation" });
    }
};

export async function getConversationsByUser(req: Request, res: Response) {
    try {
        const { userId } = req.params as { userId: string };

        const conversation = await queries.getConversationsByUser(userId);

        return res.status(200).json(conversation);
    } catch (error) {
        console.error("Error getting conversation:", error);
        return res.status(500).json({ error: "conversation" });
    }
};

export async function updateLastMessage(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { id } = req.params as { id: string };
        const { lastMessage } = req.body;

        const existingConversation = await queries.getConversationById(id);

        if (!existingConversation) {
            return res.status(404).json({ error: "conversation not found" });
        }

        if (existingConversation.sellerId !== userId &&
            existingConversation.buyerId !== userId) {
            return res
                .status(403)
                .json({ error: "You can only update your own conversation" });
        }

        const conversation = await queries.updateLastMessage(
            id,
            lastMessage,
        );

        return res.status(200).json(conversation);
    } catch (error) {
        console.error("Error updating conversation:", error);
        return res.status(500).json({ error: "Failed to update conversation" });
    }
};