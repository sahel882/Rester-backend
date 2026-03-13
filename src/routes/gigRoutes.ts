import { Router } from "express";
import { createGig, deleteGig, getAllGig, getGigById, getGigsByCategory, getGigsBySeller, updateGig } from "../controllers/gigController";
import { requireAuth } from "@clerk/express";

const router = Router();

router.post("/", requireAuth(), createGig);

router.get("/", getAllGig);

router.get("/:id", getGigById);

router.get("/seller/:id", getGigsBySeller);

router.get("/category/:cat", getGigsByCategory);

router.put("/:id", updateGig);

router.delete("/:id", deleteGig);

export default router;