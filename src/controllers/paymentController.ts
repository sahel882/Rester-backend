import type { Request, Response } from "express"
import * as queries from "../db/queries"
import { getAuth } from "@clerk/express"
import crypto from "crypto"
import { sendTelegramNotification, sendEmail } from "../utils/notifications"

// ====================
// PRICING CONFIG
// ====================
const PRICES = {
    pro: 999,
    business: 2999,
    verification: 2000,
    jobPromotion: 1000,
    internshipPromotion: 500,
}

// ====================
// HELPER - BUILD PAYHERE HASH
// ====================
const buildPayHereHash = (
    merchantId: string,
    orderId: string,
    amount: string,
    merchantSecret: string
) => {
    const hashedSecret = crypto
        .createHash("md5")
        .update(merchantSecret)
        .digest("hex")
        .toUpperCase()

    return crypto
        .createHash("md5")
        .update(merchantId + orderId + amount + "LKR" + hashedSecret)
        .digest("hex")
        .toUpperCase()
}

// ====================
// HELPER - BUILD PAYHERE DATA
// ====================
const buildPayHereData = (
    merchantId: string,
    orderId: string,
    amount: string,
    items: string,
    hash: string,
    buyer: { name: string | null; email: string }
) => ({
    sandbox: true, // ← change to false for production!
    merchant_id: merchantId,
    return_url: process.env.PAYHERE_RETURN_URL,
    cancel_url: process.env.PAYHERE_CANCEL_URL,
    notify_url: process.env.PAYHERE_NOTIFY_URL,
    order_id: orderId,
    items,
    amount,
    currency: "LKR",
    hash,
    first_name: buyer.name?.split(" ")[0] || "Customer",
    last_name: buyer.name?.split(" ")[1] || "",
    email: buyer.email,
    phone: "0771234567",
    address: "Sri Lanka",
    city: "Colombo",
    country: "Sri Lanka",
})

// ====================
// BASIC PAYMENT ROUTES
// ====================
export async function createPayment(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req)
        if (!userId) return res.status(401).json({ error: "Unauthorized" })

        const { orderId, amount, commission } = req.body
        if (!orderId || !amount || !commission) {
            return res.status(400).json({ error: "Please enter all details" })
        }

        const payment = await queries.createPayment({
            orderId,
            payerId: userId,
            amount,
            commission,
        })

        return res.status(200).json(payment)
    } catch (error) {
        console.error("Error creating payment:", error)
        return res.status(500).json({ error: "Failed to create payment" })
    }
}

export async function getPaymentById(req: Request, res: Response) {
    try {
        const { id } = req.params as { id: string }
        const payment = await queries.getPaymentById(id)
        if (!payment) return res.status(404).json({ error: "Payment not found" })
        return res.status(200).json(payment)
    } catch (error) {
        console.error("Error getting payment:", error)
        return res.status(500).json({ error: "Failed to get payment" })
    }
}

export async function getPaymentsByUser(req: Request, res: Response) {
    try {
        const { id } = req.params as { id: string }
        const payments = await queries.getPaymentsByUser(id)
        return res.status(200).json(payments)
    } catch (error) {
        console.error("Error getting payments:", error)
        return res.status(500).json({ error: "Failed to get payments" })
    }
}

export async function updatePaymentStatus(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req)
        if (!userId) return res.status(401).json({ error: "Unauthorized" })
        const { id } = req.params as { id: string }
        const { status } = req.body
        const payment = await queries.updatePaymentStatus(id, status)
        return res.status(200).json(payment)
    } catch (error) {
        console.error("Error updating payment:", error)
        return res.status(500).json({ error: "Failed to update payment" })
    }
}

// ====================
// SUBSCRIPTION PAYMENT
// ====================
export async function initiateSubscription(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req)
        if (!userId) return res.status(401).json({ error: "Unauthorized" })

        const { plan } = req.body
        if (!plan || !["pro", "business"].includes(plan)) {
            return res.status(400).json({ error: "Invalid plan! Choose pro or business" })
        }

        const buyer = await queries.getUserById(userId)
        if (!buyer) return res.status(404).json({ error: "User not found" })

        // Check if already subscribed
        const existing = await queries.getSubscriptionByUser(userId)
        if (existing) {
            return res.status(400).json({ error: "You already have an active subscription!" })
        }

        const amount = PRICES[plan as "pro" | "business"].toFixed(2)
        const orderId = `SUB-${userId}-${Date.now()}`

        const merchantId = process.env.PAYHERE_MERCHANT_ID!
        const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET!
        const hash = buildPayHereHash(merchantId, orderId, amount, merchantSecret)

        const paymentData = buildPayHereData(
            merchantId,
            orderId,
            amount,
            `Rester.lk ${plan.toUpperCase()} Plan`,
            hash,
            buyer
        )

        return res.status(200).json({ ...paymentData, plan, type: "subscription" })

    } catch (error) {
        console.error("Error initiating subscription:", error)
        return res.status(500).json({ error: "Failed to initiate subscription" })
    }
}

export async function getMySubscription(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req)
        if (!userId) return res.status(401).json({ error: "Unauthorized" })

        const subscription = await queries.getSubscriptionByUser(userId)
        return res.status(200).json(subscription || { status: "none" })
    } catch (error) {
        console.error("Error getting subscription:", error)
        return res.status(500).json({ error: "Failed to get subscription" })
    }
}

export async function cancelSubscription(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req)
        if (!userId) return res.status(401).json({ error: "Unauthorized" })

        const subscription = await queries.getSubscriptionByUser(userId)
        if (!subscription) return res.status(404).json({ error: "No active subscription found!" })

        await queries.updateSubscriptionStatus(subscription.id, "cancelled")

        await queries.createNotification({
            userId,
            type: "payment",
            title: "Subscription Cancelled",
            message: "Your subscription has been cancelled. You can resubscribe anytime!",
            link: "/dashboard/subscription"
        })

        return res.status(200).json({ message: "Subscription cancelled successfully!" })
    } catch (error) {
        console.error("Error cancelling subscription:", error)
        return res.status(500).json({ error: "Failed to cancel subscription" })
    }
}

// ====================
// VERIFICATION PAYMENT
// ====================
export async function initiateVerification(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req)
        if (!userId) return res.status(401).json({ error: "Unauthorized" })

        const buyer = await queries.getUserById(userId)
        if (!buyer) return res.status(404).json({ error: "User not found" })

        // Check if already verified
        const existing = await queries.getVerificationByUser(userId)
        if (existing) {
            return res.status(400).json({ error: "You already have an active verification badge!" })
        }

        const amount = PRICES.verification.toFixed(2)
        const orderId = `VER-${userId}-${Date.now()}`

        const merchantId = process.env.PAYHERE_MERCHANT_ID!
        const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET!
        const hash = buildPayHereHash(merchantId, orderId, amount, merchantSecret)

        const paymentData = buildPayHereData(
            merchantId,
            orderId,
            amount,
            "Rester.lk Verification Badge",
            hash,
            buyer
        )

        return res.status(200).json({ ...paymentData, type: "verification" })

    } catch (error) {
        console.error("Error initiating verification:", error)
        return res.status(500).json({ error: "Failed to initiate verification" })
    }
}

export async function getMyVerification(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req)
        if (!userId) return res.status(401).json({ error: "Unauthorized" })

        const verification = await queries.getVerificationByUser(userId)
        return res.status(200).json(verification || { status: "none" })
    } catch (error) {
        console.error("Error getting verification:", error)
        return res.status(500).json({ error: "Failed to get verification" })
    }
}

// ====================
// PROMOTION PAYMENT
// ====================
export async function initiatePromotion(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req)
        if (!userId) return res.status(401).json({ error: "Unauthorized" })

        const { type, referenceId } = req.body
        if (!type || !referenceId || !["job", "internship"].includes(type)) {
            return res.status(400).json({ error: "Invalid promotion type!" })
        }

        const buyer = await queries.getUserById(userId)
        if (!buyer) return res.status(404).json({ error: "User not found" })

        const amount = type === "job"
            ? PRICES.jobPromotion.toFixed(2)
            : PRICES.internshipPromotion.toFixed(2)

        const orderId = `PROMO-${type.toUpperCase()}-${referenceId}-${Date.now()}`

        const merchantId = process.env.PAYHERE_MERCHANT_ID!
        const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET!
        const hash = buildPayHereHash(merchantId, orderId, amount, merchantSecret)

        const paymentData = buildPayHereData(
            merchantId,
            orderId,
            amount,
            `Rester.lk ${type.toUpperCase()} Promotion`,
            hash,
            buyer
        )

        return res.status(200).json({ ...paymentData, type: "promotion", promotionType: type, referenceId })

    } catch (error) {
        console.error("Error initiating promotion:", error)
        return res.status(500).json({ error: "Failed to initiate promotion" })
    }
}

export async function getActivePromotions(req: Request, res: Response) {
    try {
        const { type } = req.params as { type: string }
        if (!["job", "internship"].includes(type)) {
            return res.status(400).json({ error: "Invalid type!" })
        }
        const promotions = await queries.getActivePromotions(type as "job" | "internship")
        return res.status(200).json(promotions)
    } catch (error) {
        console.error("Error getting promotions:", error)
        return res.status(500).json({ error: "Failed to get promotions" })
    }
}

// ====================
// PAYHERE WEBHOOK
// ====================
export async function payhereWebhook(req: Request, res: Response) {
    try {
        const {
            merchant_id,
            order_id,
            payment_id,
            status_code,
            md5sig,
            amount,
            currency
        } = req.body

        // 1. Verify webhook is from PayHere
        const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET!
        const hashedSecret = crypto
            .createHash("md5")
            .update(merchantSecret)
            .digest("hex")
            .toUpperCase()

        const localHash = crypto
            .createHash("md5")
            .update(merchant_id + order_id + amount + currency + status_code + hashedSecret)
            .digest("hex")
            .toUpperCase()

        if (localHash !== md5sig) {
            console.error("Invalid webhook! Possible fraud!")
            return res.status(400).json({ error: "Invalid signature" })
        }

        // 2. Payment SUCCESS
        if (status_code === "2") {

            // SUBSCRIPTION PAYMENT
            if (order_id.startsWith("SUB-")) {
                const parts = order_id.split("-")
                const userId = parts[1]
                const plan = order_id.includes("pro") ? "pro" : "business"

                // Create subscription (30 days)
                const endDate = new Date()
                endDate.setDate(endDate.getDate() + 30)

                await queries.createSubscription({
                    userId,
                    plan: plan as "pro" | "business",
                    amount,
                    payHereRef: payment_id,
                    status: "active",
                    endDate,
                })

                await queries.createNotification({
                    userId,
                    type: "payment",
                    title: "Subscription Active! 🎉",
                    message: `Your ${plan.toUpperCase()} plan is now active!`,
                    link: "/dashboard/subscription"
                })

                await sendTelegramNotification(`
💎 <b>NEW SUBSCRIPTION!</b>

👤 User: ${userId}
📦 Plan: ${plan.toUpperCase()}
💰 Amount: ${amount} LKR
💳 Ref: ${payment_id}
                `)
            }

            // VERIFICATION PAYMENT
            else if (order_id.startsWith("VER-")) {
                const parts = order_id.split("-")
                const userId = parts[1]

                // Create verification (30 days)
                const endDate = new Date()
                endDate.setDate(endDate.getDate() + 30)

                await queries.createVerification({
                    userId,
                    amount,
                    payHereRef: payment_id,
                    status: "active",
                    endDate,
                })

                await queries.createNotification({
                    userId,
                    type: "payment",
                    title: "Verification Badge Active! ✅",
                    message: "Your profile is now verified on Rester.lk!",
                    link: "/dashboard/profile"
                })

                await sendTelegramNotification(`
✅ <b>NEW VERIFICATION!</b>

👤 User: ${userId}
💰 Amount: ${amount} LKR
💳 Ref: ${payment_id}
                `)
            }

            // PROMOTION PAYMENT
            else if (order_id.startsWith("PROMO-")) {
                const parts = order_id.split("-")
                const type = parts[1].toLowerCase() as "job" | "internship"
                const referenceId = parts[2]
                const userId = parts[3]

                // Create promotion (7 days)
                const endDate = new Date()
                endDate.setDate(endDate.getDate() + 7)

                await queries.createPromotion({
                    userId,
                    type,
                    referenceId,
                    amount,
                    payHereRef: payment_id,
                    status: "active",
                    endDate,
                })

                await queries.createNotification({
                    userId,
                    type: "payment",
                    title: "Promotion Active! 🚀",
                    message: `Your ${type} has been promoted for 7 days!`,
                    link: `/dashboard/${type}s`
                })

                await sendTelegramNotification(`
🚀 <b>NEW PROMOTION!</b>

📦 Type: ${type.toUpperCase()}
🔗 Reference: ${referenceId}
💰 Amount: ${amount} LKR
💳 Ref: ${payment_id}
                `)
            }
        }

        return res.status(200).send("OK")

    } catch (error) {
        console.error("Webhook error:", error)
        return res.status(500).json({ error: "Webhook processing failed" })
    }
}

// ====================
// PAYOUT SYSTEM
// ====================
export async function requestPayout(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req)
        if (!userId) return res.status(401).json({ error: "Unauthorized" })

        const { bankName, accountNumber, accountName } = req.body
        if (!bankName || !accountNumber || !accountName) {
            return res.status(400).json({ error: "Please enter all bank details" })
        }

        const user = await queries.getUserById(userId)
        if (!user) return res.status(404).json({ error: "User not found" })

        if (!user.pendingBalance || Number(user.pendingBalance) <= 0) {
            return res.status(400).json({ error: "No pending balance to withdraw!" })
        }

        const payout = await queries.createPayoutRequest({
            userId,
            amount: user.pendingBalance,
            bankName,
            accountNumber,
            accountName,
            status: "pending"
        })

        await sendTelegramNotification(`
🚨 <b>NEW PAYOUT REQUEST!</b>

👤 Freelancer: ${user.name}
💰 Amount: ${user.pendingBalance} LKR
🏦 Bank: ${bankName}
📝 Account No: ${accountNumber}
👤 Account Name: ${accountName}

🔗 rester.lk/admin/payouts
        `)

        await sendEmail(
            "🚨 New Payout Request - Rester.lk",
            `
            <h2>New Payout Request!</h2>
            <table>
                <tr><td>Freelancer:</td><td>${user.name}</td></tr>
                <tr><td>Amount:</td><td>${user.pendingBalance} LKR</td></tr>
                <tr><td>Bank:</td><td>${bankName}</td></tr>
                <tr><td>Account No:</td><td>${accountNumber}</td></tr>
                <tr><td>Account Name:</td><td>${accountName}</td></tr>
            </table>
            <a href="https://rester.lk/admin/payouts">Process Payout →</a>
            `
        )

        await queries.createNotification({
            userId,
            type: "payment",
            title: "Payout Requested! ✅",
            message: `Your payout of ${user.pendingBalance} LKR has been requested. We'll process within 24 hours!`,
            link: "/dashboard/payouts"
        })

        return res.status(200).json({
            message: "Payout requested! We'll transfer within 24 hours! ✅",
            payout
        })

    } catch (error) {
        console.error("Error requesting payout:", error)
        return res.status(500).json({ error: "Failed to request payout" })
    }
}

export async function getPendingPayouts(req: Request, res: Response) {
    try {
        const payouts = await queries.getPendingPayouts()
        return res.status(200).json(payouts)
    } catch (error) {
        console.error("Error getting payouts:", error)
        return res.status(500).json({ error: "Failed to get payouts" })
    }
}

export async function confirmPayout(req: Request, res: Response) {
    try {
        const { id } = req.params as { id: string }
        const payout = await queries.getPayoutById(id)
        if (!payout) return res.status(404).json({ error: "Payout not found" })

        await queries.updatePayoutStatus(id, "completed")
        await queries.updateUser(payout.userId, { pendingBalance: "0" })

        await queries.createNotification({
            userId: payout.userId,
            type: "payment",
            title: "Payout Sent! 💰",
            message: `Your payout of ${payout.amount} LKR has been sent to your ${payout.bankName} account!`,
            link: "/dashboard/payouts"
        })

        await sendTelegramNotification(`
✅ <b>PAYOUT CONFIRMED!</b>

👤 ${payout.user?.name}
💰 ${payout.amount} LKR
🏦 ${payout.bankName}
📝 ${payout.accountNumber}

Freelancer notified! ✅
        `)

        return res.status(200).json({ message: "Payout confirmed! Freelancer notified! ✅" })
    } catch (error) {
        console.error("Error confirming payout:", error)
        return res.status(500).json({ error: "Failed to confirm payout" })
    }
}

// ====================
// TEST NOTIFICATION
// ====================
export async function testNotification(req: Request, res: Response) {
    try {
        await sendTelegramNotification(`
🧪 <b>TEST NOTIFICATION!</b>
✅ Telegram is working!
🚀 Rester.lk ready!
        `)

        await sendEmail(
            "🧪 Test - Rester.lk",
            "<h2>Email working! ✅</h2>"
        )

        return res.status(200).json({ message: "Notifications sent! ✅" })
    } catch (error) {
        console.error("Test failed:", error)
        return res.status(500).json({ error: "Test failed!" })
    }
}