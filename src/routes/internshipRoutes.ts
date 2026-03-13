import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { createInternship, deleteInternship, getAllInternship, getInternshipById, getInternshipsByUser, promoteInternship, updateInternship } from "../controllers/internshipController";

const router = Router();

router.post("/", requireAuth(), createInternship);

router.get("/", getAllInternship);

router.get("/user/:id", requireAuth(), getInternshipsByUser);

router.get("/:id", getInternshipById);

router.put("/:id/promote", requireAuth(), promoteInternship);

router.put("/:id", requireAuth(), updateInternship);

router.delete("/:id", requireAuth(), deleteInternship);

export default router;