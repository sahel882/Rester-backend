import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";

export async function createGig(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { title, description, category, price, deliveryDays, revisions, imageUrl, tags } = req.body;

        if (!title || !description || !category || !price || !deliveryDays || !revisions) {
            return res
                .status(400)
                .json({ error: "Please enter all the details" });
        };

        const gig = await queries.createGig({
            sellerId: userId,
            title,
            description,
            category,
            price,
            deliveryDays,
            revisions,
        });

        return res.status(200).json(gig)


    } catch (error) {
        console.error("Error while creating a gig", error);
        return res.status(500).json({ error: "Failed to create a gig" });
    };
};

export async function getAllGig(req: Request, res: Response) {
    try {
        const gig = await queries.getAllGigs();
        return res.status(200).json(gig);
    } catch (error) {
        console.error("Error getting gig:", error);
        return res.status(500).json({ error: "Failed to get gig" });
    }
};

export async function getGigById(req: Request, res: Response) {
    try {
        const { id } = req.params as { id: string };

        const gig = await queries.getGigById(id);

        if (!gig) return res.status(404).json({ error: "Gig not found" });

        return res.status(200).json(gig);
    } catch (error) {
        console.error("Error getting gig:", error);
        return res.status(500).json({ error: "Failed to get gig" });
    }
};

export async function getMyGigs(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req)
        if (!userId) return res.status(401).json({ error: "Unauthorized" })

        const gigs = await queries.getGigsBySeller(userId)

        return res.status(200).json(gigs)
    } catch (error) {
        console.error("Error getting my gigs:", error)
        return res.status(500).json({ error: "Failed to get your gigs" })
    }
}

export async function getGigsBySeller(req: Request, res: Response) {
    try {
        const { sellerId } = req.params as { sellerId: string };

        const gig = await queries.getGigsBySeller(sellerId);

        return res.status(200).json(gig);
    } catch (error) {
        console.error("Error getting gig:", error);
        return res.status(500).json({ error: "Failed to get gig" });
    }
};

export async function getGigsByCategory(req: Request, res: Response) {
    try {
        const { category } = req.params as { category: string };

        const gig = await queries.getGigsByCategory(category);

        return res.status(200).json(gig);
    } catch (error) {
        console.error("Error getting gig:", error);
        return res.status(500).json({ error: "Failed to get gig" });
    }
};

export async function updateGig(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { id } = req.params as { id: string };
        const { title, description, category, price, deliveryDays, revisions } = req.body;

        const existingGig = await queries.getGigById(id);

        if (!existingGig) {
            return res.status(404).json({ error: "Gig not found" });
        }

        if (existingGig.sellerId !== userId) {
            return res
                .status(403)
                .json({ error: "You can only update your own gig" });
        }

        const gig = await queries.updateGig(id, {
            sellerId: userId,
            title,
            description,
            category,
            price,
            deliveryDays,
            revisions,
        });

        return res.status(200).json(gig);
    } catch (error) {
        console.error("Error updating gig:", error);
        return res.status(500).json({ error: "Failed to update gig" });
    }
};

export async function deleteGig(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { id } = req.params as { id: string };

        const existingGig = await queries.getGigById(id);

        if (!existingGig) {
            return res.status(404).json({ error: "Gig not found" });
        }

        if (existingGig?.sellerId !== userId) {
            return res
                .status(403)
                .json({ error: "You can only delete your own gig" });
        }

        await queries.deleteGig(id);

        return res
            .status(200)
            .json({ message: "gig deleted successfully" });
    } catch (error) {
        console.error("Error deleting gig:", error);
        return res.status(500).json({ error: "Failed to delete gig" });
    }
};