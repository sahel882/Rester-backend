import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";

export async function createInternship(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" })
        };

        const { title, description, company, location, duration, stipend, requirements } = req.body;

        if (!title || !description || !company || !duration || !stipend || !location || !requirements) {
            return res.status(400).json({ error: "Please enter all details" })
        };

        const internship = await queries.createInternship({
            postedBy: userId,
            title,
            description,
            company,
            location,
            duration,
            stipend,
            requirements
        });

        res.status(200).json(internship);

    } catch (error) {
        console.error("Error while creating internship: ", error);
        res.status(500).json({ error: "Failed to create internship" });
    }
};

export async function getAllInternship(req: Request, res: Response) {
    try {
        const internship = await queries.getAllInternships();
        return res.status(200).json(internship);
    } catch (error) {
        console.error("Error getting internship:", error);
        return res.status(500).json({ error: "Failed to get internship" });
    }
};

export async function getInternshipById(req: Request, res: Response) {
    try {
        const { id } = req.params as { id: string };

        const internship = await queries.getInternshipById(id);

        if (!internship) return res.status(404).json({ error: "internship not found" });

        return res.status(200).json(internship);
    } catch (error) {
        console.error("Error getting internship:", error);
        return res.status(500).json({ error: "Failed to get internship" });
    }
};

export async function getInternshipsByUser(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" })
        }

        const internship = await queries.getInternshipsByUser(userId);

        return res.status(200).json(internship);
    } catch (error) {
        console.error("Error getting internship:", error);
        return res.status(500).json({ error: "Failed to get internship" });
    }
};

export async function updateInternship(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { id } = req.params as { id: string };
        const { title, description, company, location, duration, stipend, requirements } = req.body;

        const existingInternship = await queries.getInternshipById(id);

        if (!existingInternship) {
            return res.status(404).json({ error: "Job not found" });
        }

        if (existingInternship?.postedBy !== userId) {
            return res
                .status(403)
                .json({ error: "You can only update your own internship" });
        }

        const internship = await queries.updateInternship(id, {
            title,
            description,
            company,
            location,
            duration,
            stipend,
            requirements
        });

        return res.status(200).json(internship);
    } catch (error) {
        console.error("Error updating internship:", error);
        return res.status(500).json({ error: "Failed to update internship" });
    }
};

export async function deleteInternship(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { id } = req.params as { id: string };

        const existingInternship = await queries.getInternshipById(id);

        if (!existingInternship) {
            return res.status(404).json({ error: "Internship not found" });
        }

        if (existingInternship?.postedBy !== userId) {
            return res
                .status(403)
                .json({ error: "You can only delete your own internship" });
        }

        await queries.deleteInternship(id);

        return res
            .status(200)
            .json({ message: "Internship deleted successfully" });
    } catch (error) {
        console.error("Error deleting internship:", error);
        return res.status(500).json({ error: "Failed to delete internship" });
    }
};

export async function promoteInternship(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req)
        if (!userId) return res.status(401).json({ error: "Unauthorized" })

        const { id } = req.params as { id: string }
        const { fee } = req.body

        const existingInternship = await queries.getInternshipById(id)
        if (!existingInternship) return res.status(404).json({ error: "Internship not found" })

        if (existingInternship.postedBy !== userId) {
            return res.status(403).json({ error: "You can only promote your own internships" })
        }

        const internship = await queries.promoteInternship(id, fee)
        return res.status(200).json(internship)

    } catch (error) {
        console.error("Error promoting internship:", error)
        return res.status(500).json({ error: "Failed to promote internship" })
    }
}