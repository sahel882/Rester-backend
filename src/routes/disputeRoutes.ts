import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { createDispute, getDisputeById, getDisputesByUser, updateDisputeStatus, resolveDispute } from "../controllers/disputeController";

const router = Router()

router.post("/", requireAuth(), createDispute);

router.get("/my", requireAuth(), getDisputesByUser);

router.get("/:id", requireAuth(), getDisputeById);

router.put("/:id/status", requireAuth(), updateDisputeStatus);

router.put("/:id/resolve", requireAuth(), resolveDispute);

export default router;