import type { Request, Response } from "express"
import * as queries from "../db/queries"
import { getAuth } from "@clerk/express"

export async function createSubscription(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req)
        if (!userId) return res.status(401).json({ error: "Unauthorized" })

        const { plan, amount, payHereRef, endDate } = req.body
        if (!plan || !amount || !endDate) {
            return res.status(400).json({ error: "Please enter all details" })
        }

        const existing = await queries.getSubscriptionByUser(userId)
        if (existing) {
            return res.status(400).json({ error: "You already have an active subscription!" })
        }

        const subscription = await queries.createSubscription({
            userId,
            plan,
            amount,
            payHereRef: payHereRef || null,
            status: "active",
            endDate: new Date(endDate),
        })

        return res.status(200).json(subscription)
    } catch (error) {
        console.error("Error creating subscription:", error)
        return res.status(500).json({ error: "Failed to create subscription" })
    }
}

export async function getMySubscription(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req)
        if (!userId) return res.status(401).json({ error: "Unauthorized" })

        const subscription = await queries.getSubscriptionByUser(userId)
        return res.status(200).json(subscription || { status: "none" })
    } catch (error) {
        console.error("Error getting subscription:", error)
        return res.status(500).json({ error: "Failed to get subscription" })
    }
}

export async function updateSubscription(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req)
        if (!userId) return res.status(401).json({ error: "Unauthorized" })

        const { id } = req.params as { id: string }
        const { plan, endDate } = req.body

        const existing = await queries.getSubscriptionByUser(userId)
        if (!existing) return res.status(404).json({ error: "Subscription not found" })

        const subscription = await queries.updateSubscription(id, { plan, endDate: new Date(endDate) })
        return res.status(200).json(subscription)
    } catch (error) {
        console.error("Error updating subscription:", error)
        return res.status(500).json({ error: "Failed to update subscription" })
    }
}

export async function cancelSubscription(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req)
        if (!userId) return res.status(401).json({ error: "Unauthorized" })

        const existing = await queries.getSubscriptionByUser(userId)
        if (!existing) return res.status(404).json({ error: "No active subscription found!" })

        await queries.updateSubscriptionStatus(existing.id, "cancelled")

        await queries.createNotification({
            userId,
            type: "payment",
            title: "Subscription Cancelled",
            message: "Your subscription has been cancelled. You can resubscribe anytime!",
            link: "/dashboard/subscription"
        })

        return res.status(200).json({ message: "Subscription cancelled successfully!" })
    } catch (error) {
        console.error("Error cancelling subscription:", error)
        return res.status(500).json({ error: "Failed to cancel subscription" })
    }
}