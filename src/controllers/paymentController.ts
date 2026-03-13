import type { Request, Response } from "express"
import * as queries from "../db/queries"
import { getAuth } from "@clerk/express"
import crypto from "crypto"
import { sendTelegramNotification, sendEmail } from "../utils/notifications"

// BASIC PAYMENT ROUTES
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

// PAYHERE
export async function initiatePayment(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req)
        if (!userId) return res.status(401).json({ error: "Unauthorized" })

        const { orderId, amount } = req.body
        if (!orderId || !amount) {
            return res.status(400).json({ error: "orderId and amount required" })
        }

        const order = await queries.getOrderById(orderId)
        if (!order) return res.status(404).json({ error: "Order not found" })

        if (order.buyerId !== userId) {
            return res.status(403).json({ error: "You can only pay for your own orders" })
        }

        const buyer = await queries.getUserById(userId)
        if (!buyer) return res.status(404).json({ error: "User not found" })

        const merchantId = process.env.PAYHERE_MERCHANT_ID!
        const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET!

        const hashedSecret = crypto
            .createHash("md5")
            .update(merchantSecret)
            .digest("hex")
            .toUpperCase()

        const hash = crypto
            .createHash("md5")
            .update(merchantId + orderId + Number(amount).toFixed(2) + "LKR" + hashedSecret)
            .digest("hex")
            .toUpperCase()

        const commission = (Number(amount) * 0.05).toFixed(2)
        const totalAmount = (Number(amount) + Number(commission)).toFixed(2)

        await queries.createPayment({
            orderId,
            payerId: userId,
            amount: totalAmount,
            commission,
            status: "pending",
            payHereRef: null,
        })

        const paymentData = {
            sandbox: true,              // ← change to false for production!
            merchant_id: merchantId,
            return_url: process.env.PAYHERE_RETURN_URL,
            cancel_url: process.env.PAYHERE_CANCEL_URL,
            notify_url: process.env.PAYHERE_NOTIFY_URL,
            order_id: orderId,
            items: `Rester.lk Order #${orderId}`,
            amount: totalAmount,
            currency: "LKR",
            hash,
            first_name: buyer.name?.split(" ")[0] || "Customer",
            last_name: buyer.name?.split(" ")[1] || "",
            email: buyer.email,
            phone: "0771234567",
            address: "Sri Lanka",
            city: "Colombo",
            country: "Sri Lanka",
        }

        return res.status(200).json(paymentData)

    } catch (error) {
        console.error("Error initiating payment:", error)
        return res.status(500).json({ error: "Failed to initiate payment" })
    }
}

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
            console.error("Invalid webhook signature! Possible fraud attempt!")
            return res.status(400).json({ error: "Invalid signature" })
        }

        if (status_code === "2") {
            await queries.updatePaymentStatus(order_id, "completed")

            await queries.updateOrderStatus(order_id, "active")

            const order = await queries.getOrderById(order_id)
            const seller = await queries.getUserById(order?.sellerId || "")
            const buyer = await queries.getUserById(order?.buyerId || "")

            await queries.createNotification({
                userId: order?.sellerId || "",
                type: "order",
                title: "New Order! 🎉",
                message: `You have a new order worth ${amount} LKR. Start working!`,
                link: `/orders/${order_id}`
            })

            await queries.createNotification({
                userId: order?.buyerId || "",
                type: "payment",
                title: "Payment Successful! ✅",
                message: `Your payment of ${amount} LKR was successful!`,
                link: `/orders/${order_id}`
            })

            await sendTelegramNotification(`
🎉 <b>NEW PAYMENT RECEIVED!</b>

💰 Amount: ${amount} LKR
📦 Order: #${order_id}
💳 PayHere Ref: ${payment_id}
👤 Buyer: ${buyer?.name}
👷 Seller: ${seller?.name}

✅ Order is now ACTIVE!
            `)
        }

        if (status_code === "0") {
            await queries.updatePaymentStatus(order_id, "refunded")

            const order = await queries.getOrderById(order_id)

            await queries.createNotification({
                userId: order?.buyerId || "",
                type: "payment",
                title: "Payment Failed",
                message: "Your payment failed. Please try again.",
                link: `/orders/${order_id}`
            })
        }

        return res.status(200).send("OK")

    } catch (error) {
        console.error("Webhook error:", error)
        return res.status(500).json({ error: "Webhook processing failed" })
    }
}

// PAYOUT SYSTEM
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

🔗 Go to admin panel to process!
rester.lk/admin/payouts
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
            <a href="https://rester.lk/admin/payouts">
                Process Payout →
            </a>
            `
        )

        await queries.createNotification({
            userId,
            type: "payment",
            title: "Payout Requested! ✅",
            message: `Your payout of ${user.pendingBalance} LKR has been requested. We'll process it within 24 hours!`,
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

Freelancer has been notified! ✅
        `)

        return res.status(200).json({ message: "Payout confirmed! Freelancer notified! ✅" })

    } catch (error) {
        console.error("Error confirming payout:", error)
        return res.status(500).json({ error: "Failed to confirm payout" })
    }
}

export async function testNotification(req: Request, res: Response) {
    try {
        await sendTelegramNotification(`
🧪 <b>TEST NOTIFICATION!</b>
✅ Telegram is working!
🚀 Rester.lk notifications ready!
        `)

        await sendEmail(
            "🧪 Test Email - Rester.lk",
            "<h2>Email notifications working! ✅</h2>"
        )

        return res.status(200).json({ message: "Notifications sent! Check Telegram and Email! ✅" })
    } catch (error) {
        console.error("Test failed:", error)
        return res.status(500).json({ error: "Notification test failed!" })
    }
}