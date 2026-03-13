import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { createPayment, testNotification, getPaymentById, updatePaymentStatus, getPaymentsByUser } from "../controllers/paymentController";

const router = Router();

router.post("/", requireAuth(), createPayment);

router.get("/", requireAuth(), getPaymentById);

router.get("/", requireAuth(), getPaymentsByUser);

router.put("/", requireAuth(), updatePaymentStatus);

router.get("/test-notification", testNotification)

export default router;