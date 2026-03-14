import type { Request, Response } from "express"
import * as queries from "../db/queries"
import { getAuth } from "@clerk/express"

export async function followUser(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req)
        if (!userId) return res.status(401).json({ error: "Unauthorized" })
        const { followingId } = req.body
        if (!followingId) return res.status(400).json({ error: "followingId required" })
        if (userId === followingId) return res.status(400).json({ error: "Cannot follow yourself!" })
        const follow = await queries.followUser(userId, followingId)
        return res.status(200).json(follow)
    } catch (error) {
        console.error("Error following user:", error)
        return res.status(500).json({ error: "Failed to follow user" })
    }
}

export async function unfollowUser(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req)
        if (!userId) return res.status(401).json({ error: "Unauthorized" })
        const { followingId } = req.body
        await queries.unfollowUser(userId, followingId)
        return res.status(200).json({ message: "Unfollowed!" })
    } catch (error) {
        console.error("Error unfollowing:", error)
        return res.status(500).json({ error: "Failed to unfollow" })
    }
}

export async function getFollowers(req: Request, res: Response) {
    try {
        const { id } = req.params as { id: string }
        const followers = await queries.getFollowers(id)
        return res.status(200).json(followers)
    } catch (error) {
        console.error("Error getting followers:", error)
        return res.status(500).json({ error: "Failed to get followers" })
    }
}

export async function getFollowing(req: Request, res: Response) {
    try {
        const { id } = req.params as { id: string }
        const following = await queries.getFollowing(id)
        return res.status(200).json(following)
    } catch (error) {
        console.error("Error getting following:", error)
        return res.status(500).json({ error: "Failed to get following" })
    }
}

export async function getFollowCounts(req: Request, res: Response) {
    try {
        const { id } = req.params as { id: string }
        const counts = await queries.getFollowCounts(id)
        return res.status(200).json(counts)
    } catch (error) {
        console.error("Error getting counts:", error)
        return res.status(500).json({ error: "Failed to get counts" })
    }
}