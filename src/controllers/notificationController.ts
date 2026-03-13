import type { Request, Response } from "express"
import * as queries from "../db/queries"
import { getAuth } from "@clerk/express"

export async function createNotification(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req)
        if (!userId) return res.status(401).json({ error: "Unauthorized" })

        const { type, title, message, link } = req.body
        if (!type || !title || !message) {
            return res.status(400).json({ error: "Please enter all details" })
        }

        const notification = await queries.createNotification({
            userId,
            type,
            title,
            message,
            link: link || null,
        })

        return res.status(200).json(notification)
    } catch (error) {
        console.error("Error creating notification:", error)
        return res.status(500).json({ error: "Failed to create notification" })
    }
}

export async function getNotificationsByUser(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req)
        if (!userId) return res.status(401).json({ error: "Unauthorized" })

        const notifications = await queries.getNotificationsByUser(userId)
        return res.status(200).json(notifications)
    } catch (error) {
        console.error("Error getting notifications:", error)
        return res.status(500).json({ error: "Failed to get notifications" })
    }
}

export async function getNotificationById(req: Request, res: Response) {
    try {
        const { id } = req.params as { id: string }

        const notification = await queries.getNotificationById(id)
        if (!notification) return res.status(404).json({ error: "Notification not found" })

        return res.status(200).json(notification)
    } catch (error) {
        console.error("Error getting notification:", error)
        return res.status(500).json({ error: "Failed to get notification" })
    }
}

export async function markNotificationAsRead(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req)
        if (!userId) return res.status(401).json({ error: "Unauthorized" })

        const { id } = req.params as { id: string }

        const existing = await queries.getNotificationById(id)
        if (!existing) return res.status(404).json({ error: "Notification not found" })

        if (existing.userId !== userId) {
            return res.status(403).json({ error: "Unauthorized" })
        }

        const notification = await queries.markNotificationAsRead(id)
        return res.status(200).json(notification)
    } catch (error) {
        console.error("Error marking notification as read:", error)
        return res.status(500).json({ error: "Failed to mark notification as read" })
    }
}

export async function markAllNotificationsAsRead(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req)
        if (!userId) return res.status(401).json({ error: "Unauthorized" })

        await queries.markAllNotificationsAsRead(userId)
        return res.status(200).json({ message: "All notifications marked as read" })
    } catch (error) {
        console.error("Error marking all notifications as read:", error)
        return res.status(500).json({ error: "Failed to mark all notifications as read" })
    }
}

export async function deleteNotification(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req)
        if (!userId) return res.status(401).json({ error: "Unauthorized" })

        const { id } = req.params as { id: string }

        const existing = await queries.getNotificationById(id)
        if (!existing) return res.status(404).json({ error: "Notification not found" })

        if (existing.userId !== userId) {
            return res.status(403).json({ error: "Unauthorized" })
        }

        await queries.deleteNotification(id)
        return res.status(200).json({ message: "Notification deleted" })
    } catch (error) {
        console.error("Error deleting notification:", error)
        return res.status(500).json({ error: "Failed to delete notification" })
    }
}