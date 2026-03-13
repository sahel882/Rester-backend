import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { createReview, deleteReview, getReviewsByGig, getReviewsById } from "../controllers/reviewController";

const router = Router();

router.post("/", requireAuth(), createReview);

router.get("/gig/:id", getReviewsByGig);

router.get("/:id", getReviewsById);

router.delete("/:id", requireAuth(), deleteReview );

export default router;