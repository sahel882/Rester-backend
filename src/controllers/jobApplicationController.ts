import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";

export async function createJobApplication(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" })
        };

        const { jobId, coverLetter, resumeUrl } = req.body;

        if (!jobId || !coverLetter || !resumeUrl) {
            return res.status(400).json({ error: "Please enter all details" })
        };

        const application = await queries.createJobApplication({
            applicantId: userId,
            jobId,
            coverLetter,
            resumeUrl,
        });

        res.status(200).json(application);

    } catch (error) {
        console.error("Error while creating application: ", error);
        res.status(500).json({ error: "Failed to create application" });
    }
};

export async function getApplicationById(req: Request, res: Response) {
    try {
        const { id } = req.params as { id: string };

        const application = await queries.getApplicationById(id);

        if (!application) return res.status(404).json({ error: "Application not found" });

        return res.status(200).json(application);
    } catch (error) {
        console.error("Error getting application:", error);
        return res.status(500).json({ error: "Failed to get application" });
    }
};

export async function updateApplicationStatus(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req)
        if (!userId) return res.status(401).json({ error: "Unauthorized" })

        const { id } = req.params as { id: string }
        const { status } = req.body;

        if (!status) return res.status(400).json({ error: "Status is required" })

        const existingApplication = await queries.getApplicationById(id)
        if (!existingApplication) {
            return res.status(404).json({ error: "Application not found" })
        }

        const application = await queries.updateApplicationStatus(id, status)
        return res.status(200).json(application)

    } catch (error) {
        console.error("Error updating application:", error)
        return res.status(500).json({ error: "Failed to update application" })
    }
};

export async function getApplicationsByJob(req: Request, res: Response) {
    try {
        const { jobId } = req.params as { jobId: string };

        const application = await queries.getApplicationsByJob(jobId);

        return res.status(200).json(application);
    } catch (error) {
        console.error("Error getting application:", error);
        return res.status(500).json({ error: "Failed to get application" });
    }
};

export async function getApplicationsByUser(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const application = await queries.getApplicationsByUser(userId);

        return res.status(200).json(application);
    } catch (error) {
        console.error("Error getting application:", error);
        return res.status(500).json({ error: "Failed to get application" });
    }
};