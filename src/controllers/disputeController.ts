import type { Request, Response } from "express"
import * as queries from "../db/queries"
import { getAuth } from "@clerk/express"

export async function createDispute(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req)
        if (!userId) return res.status(401).json({ error: "Unauthorized" })

        const { orderId, reason, description } = req.body
        if (!orderId || !reason || !description) {
            return res.status(400).json({ error: "Please enter all details" })
        }

        const dispute = await queries.createDispute({
            raisedBy: userId,
            orderId,
            reason,
            description,
        })

        return res.status(200).json(dispute)
    } catch (error) {
        console.error("Error creating dispute:", error)
        return res.status(500).json({ error: "Failed to create dispute" })
    }
}

export async function getDisputeById(req: Request, res: Response) {
    try {
        const { id } = req.params as { id: string }

        const dispute = await queries.getDisputeById(id)
        if (!dispute) return res.status(404).json({ error: "Dispute not found" })

        return res.status(200).json(dispute)
    } catch (error) {
        console.error("Error getting dispute:", error)
        return res.status(500).json({ error: "Failed to get dispute" })
    }
}

export async function getDisputesByUser(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req)
        if (!userId) return res.status(401).json({ error: "Unauthorized" })

        const disputes = await queries.getDisputesByOrder(userId)
        return res.status(200).json(disputes)
    } catch (error) {
        console.error("Error getting disputes:", error)
        return res.status(500).json({ error: "Failed to get disputes" })
    }
}

export async function updateDisputeStatus(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req)
        if (!userId) return res.status(401).json({ error: "Unauthorized" })

        const { id } = req.params as { id: string }
        const { status } = req.body
        if (!status) return res.status(400).json({ error: "Status is required" })

        const existing = await queries.getDisputeById(id)
        if (!existing) return res.status(404).json({ error: "Dispute not found" })

        const dispute = await queries.updateDisputeStatus(id, status)
        return res.status(200).json(dispute)
    } catch (error) {
        console.error("Error updating dispute:", error)
        return res.status(500).json({ error: "Failed to update dispute" })
    }
}

export async function resolveDispute(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req)
        if (!userId) return res.status(401).json({ error: "Unauthorized" })

        const { id } = req.params as { id: string }
        const { resolution } = req.body
        if (!resolution) return res.status(400).json({ error: "Resolution is required" })

        const existing = await queries.getDisputeById(id)
        if (!existing) return res.status(404).json({ error: "Dispute not found" })

        const dispute = await queries.resolveDispute(id, resolution)
        return res.status(200).json(dispute)
    } catch (error) {
        console.error("Error resolving dispute:", error)
        return res.status(500).json({ error: "Failed to resolve dispute" })
    }
}