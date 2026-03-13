import { Router } from "express"
import { requireAuth } from "@clerk/express"
import {
    createPayment,
    getPaymentById,
    getPaymentsByUser,
    updatePaymentStatus,
    initiateSubscription,
    getMySubscription,
    cancelSubscription,
    initiateVerification,
    getMyVerification,
    initiatePromotion,
    getActivePromotions,
    payhereWebhook,
    requestPayout,
    getPendingPayouts,
    confirmPayout,
    testNotification
} from "../controllers/paymentController"

const router = Router()

// Basic payments
router.post("/", requireAuth(), createPayment)
router.get("/user/:id", requireAuth(), getPaymentsByUser)
router.get("/:id", requireAuth(), getPaymentById)
router.put("/:id/status", requireAuth(), updatePaymentStatus)

// Subscription
router.post("/subscription/initiate", requireAuth(), initiateSubscription)
router.get("/subscription/my", requireAuth(), getMySubscription)
router.put("/subscription/cancel", requireAuth(), cancelSubscription)

// Verification
router.post("/verification/initiate", requireAuth(), initiateVerification)
router.get("/verification/my", requireAuth(), getMyVerification)

// Promotions
router.post("/promotion/initiate", requireAuth(), initiatePromotion)
router.get("/promotion/:type", getActivePromotions)

// PayHere webhook
router.post("/payhere/webhook", payhereWebhook)

// Payouts
router.post("/payout/request", requireAuth(), requestPayout)
router.get("/payout/pending", requireAuth(), getPendingPayouts)
router.put("/payout/:id/confirm", requireAuth(), confirmPayout)

// Test
router.get("/test-notification", testNotification)

export default router;