import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";

export async function createReview(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" })
        }

        const { orderId, gigId, sellerId, rating, comment } = req.body;

        if (!orderId || !gigId || !sellerId || !rating || !comment) {
            return res.status(400).json({ error: "Please enter all details" })
        };

        const review = await queries.createReview({
            orderId,
            gigId,
            buyerId: userId,
            sellerId,
            rating,
            comment
        });

        return res.status(200).json(review);

    } catch (error) {
        console.error("Error while creating a review", error);
        return res.status(500).json({ error: "Failed to create a review" });
    }
};

export async function getReviewsByGig(req: Request, res: Response) {
    try {
        const { gigId } = req.params as { gigId: string }

        const review = await queries.getReviewsByGig(gigId);

        return res.status(200).json(review);
    } catch (error) {
        console.error("Error getting review:", error);
        return res.status(500).json({ error: "Failed to get review" });
    }
};

export async function getReviewsById(req: Request, res: Response) {
    try {
        const { id } = req.params as { id: string };

        const review = await queries.getReviewById(id);

        if (!review) return res.status(404).json({ error: "Review not found" });

        return res.status(200).json(review);
    } catch (error) {
        console.error("Error getting review:", error);
        return res.status(500).json({ error: "Failed to get review" });
    }
};

export async function deleteReview(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { id } = req.params as { id: string };

        const existingReview = await queries.getReviewById(id);

        if (!existingReview) {
            return res.status(404).json({ error: "Review not found" });
        }

        if (existingReview?.buyerId !== userId) {
            return res
                .status(403)
                .json({ error: "You can only delete your own review" });
        }

        await queries.deleteReview(id);

        return res
            .status(200)
            .json({ message: "review deleted successfully" });
    } catch (error) {
        console.error("Error deleting review:", error);
        return res.status(500).json({ error: "Failed to delete review" });
    }
};