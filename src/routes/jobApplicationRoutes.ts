import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { createJobApplication, getApplicationById, getApplicationsByJob, getApplicationsByUser, updateApplicationStatus } from "../controllers/jobApplicationController";

const router = Router();

router.post("/", requireAuth(), createJobApplication);

router.get("/my", requireAuth(), getApplicationsByUser);

router.get("/job/:jobId", requireAuth(), getApplicationsByJob);

router.get("/:id", requireAuth(), getApplicationById);

router.put("/:id/status", requireAuth(), updateApplicationStatus);

export default router;