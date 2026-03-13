import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { createJob, deleteJob, getAllJobs, getJobById, getJobsByUser, promoteJob, updateJob } from "../controllers/jobController";

const router = Router();

router.post("/", requireAuth(), createJob);

router.get("/", getAllJobs);

router.get("/user/:id", requireAuth(), getJobsByUser);

router.get("/:id", requireAuth(), getJobById);

router.put("/:id/promote", requireAuth(), promoteJob);
router.put("/:id", requireAuth(), updateJob);


router.delete("/:id", requireAuth(), deleteJob);

export default router;