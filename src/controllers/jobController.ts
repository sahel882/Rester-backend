import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";

export async function createJob(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" })
        };

        const { title, description, category, type, salary, location, requirements } = req.body;

        if (!title || !description || !category || !type || !salary || !location || !requirements) {
            return res.status(400).json({ error: "Please enter all details" })
        };

        const job = await queries.createJob({
            postedBy: userId,
            title,
            description,
            category,
            type,
            salary,
            location,
            requirements
        });

        res.status(200).json(job);

    } catch (error) {
        console.error("Error while creating job: ", error);
        res.status(500).json({ error: "Failed to create job" });
    }
};

export async function getAllJobs(req: Request, res: Response) {
    try {
        const job = await queries.getAllJobs();
        return res.status(200).json(job);
    } catch (error) {
        console.error("Error getting job:", error);
        return res.status(500).json({ error: "Failed to get job" });
    }
};

export async function getJobById(req: Request, res: Response) {
    try {
        const { id } = req.params as { id: string };

        const job = await queries.getJobById(id);

        if (!job) return res.status(404).json({ error: "Job not found" });

        return res.status(200).json(job);
    } catch (error) {
        console.error("Error getting job:", error);
        return res.status(500).json({ error: "Failed to get job" });
    }
};

export async function getJobsByUser(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" })
        }

        const job = await queries.getJobsByUser(userId);

        return res.status(200).json(job);
    } catch (error) {
        console.error("Error getting job:", error);
        return res.status(500).json({ error: "Failed to get job" });
    }
};

export async function updateJob(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { id } = req.params as { id: string };
        const { postedBy, title, description, category, type, salary, location, requirements } = req.body;

        const existingJob = await queries.getJobById(id);

        if (!existingJob) {
            return res.status(404).json({ error: "Job not found" });
        }

        if (existingJob?.postedBy !== userId) {
            return res
                .status(403)
                .json({ error: "You can only update your own job" });
        }

        const job = await queries.updateJob(id, {
            title,
            description,
            category,
            type,
            salary,
            location,
            requirements
        });

        return res.status(200).json(job);
    } catch (error) {
        console.error("Error updating job:", error);
        return res.status(500).json({ error: "Failed to update job" });
    }
};

export async function deleteJob(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { id } = req.params as { id: string };

        const existingJob = await queries.getJobById(id);

        if (!existingJob) {
            return res.status(404).json({ error: "Job not found" });
        }

        if (existingJob?.postedBy !== userId) {
            return res
                .status(403)
                .json({ error: "You can only delete your own job" });
        }

        await queries.deleteJob(id);

        return res
            .status(200)
            .json({ message: "Job deleted successfully" });
    } catch (error) {
        console.error("Error deleting job:", error);
        return res.status(500).json({ error: "Failed to delete job" });
    }
};

export async function promoteJob(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req)
        if (!userId) return res.status(401).json({ error: "Unauthorized" })

        const { id } = req.params as { id: string }
        const { fee } = req.body

        const existingJob = await queries.getJobById(id)
        if (!existingJob) return res.status(404).json({ error: "Job not found" })

        if (existingJob.postedBy !== userId) {
            return res.status(403).json({ error: "You can only promote your own jobs" })
        }

        const job = await queries.promoteJob(id, fee)
        return res.status(200).json(job)

    } catch (error) {
        console.error("Error promoting job:", error)
        return res.status(500).json({ error: "Failed to promote job" })
    }
}