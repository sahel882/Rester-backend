import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { createSubscription, getMySubscription, updateSubscription, cancelSubscription } from "../controllers/subscriptionController";

const router = Router()

router.post("/", requireAuth(), createSubscription);

router.get("/my", requireAuth(), getMySubscription);

router.put("/cancel", requireAuth(), cancelSubscription);

router.put("/:id", requireAuth(), updateSubscription);

export default router;