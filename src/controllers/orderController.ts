import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";

export async function createOrder(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req)
        if (!userId) return res.status(401).json({ error: "Unauthorized" })

        const { gigId, price, commission, sellerEarning, requirements } = req.body

        if (!gigId || !price || !commission || !sellerEarning || !requirements) {
            return res.status(400).json({ error: "Please enter all the details" })
        }

        const gig = await queries.getGigById(gigId)
        if (!gig) return res.status(404).json({ error: "Gig not found" })

        const order = await queries.createOrder({
            gigId,
            buyerId: userId,
            sellerId: gig.sellerId,
            price,
            commission,
            sellerEarning,
            requirements,
            deliveryDays: gig.deliveryDays,
        })

        return res.status(200).json(order)

    } catch (error) {
        console.error("Error while creating order", error)
        return res.status(500).json({ error: "Failed to create order" })
    }
};

export async function getOrderById(req: Request, res: Response) {
    try {
        const { id } = req.params as { id: string };

        const order = await queries.getOrderById(id);

        if (!order) return res.status(404).json({ error: "Order not found" });

        return res.status(200).json(order);
    } catch (error) {
        console.error("Error getting order:", error);
        return res.status(500).json({ error: "Failed to get order" });
    }
};

export async function getOrdersByBuyer(req: Request, res: Response) {
    try {
        const { buyerId } = req.params as { buyerId: string };

        const order = await queries.getOrdersByBuyer(buyerId);

        return res.status(200).json(order);
    } catch (error) {
        console.error("Error getting order:", error);
        return res.status(500).json({ error: "Failed to get order" });
    }
};

export async function getOrdersBySeller(req: Request, res: Response) {
    try {
        const { sellerId } = req.params as { sellerId: string };

        const order = await queries.getOrdersBySeller(sellerId);

        return res.status(200).json(order);
    } catch (error) {
        console.error("Error getting order:", error);
        return res.status(500).json({ error: "Failed to get order" });
    }
};

export async function updateOrderStatus(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req)
        if (!userId) return res.status(401).json({ error: "Unauthorized" })

        const { id } = req.params as { id: string };
        const { status } = req.body;

        const order = await queries.updateOrderStatus(id, status)
        return res.status(200).json(order)

    } catch (error) {
        console.error("Error updating order status:", error)
        return res.status(500).json({ error: "Failed to update order status" })
    }
};

export async function approveOrder(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req)
        if (!userId) return res.status(401).json({ error: "Unauthorized" })

        const { id } = req.params as { id: string };;

        const order = await queries.approveOrder(id);
        return res.status(200).json(order);

    } catch (error) {
        console.error("Error approving order:", error)
        return res.status(500).json({ error: "Failed to approve order" })
    }
}

export async function autoCompleteOrder(req: Request, res: Response) {
    try {
        const orders = await queries.autoCompleteOrder()
        return res.status(200).json({
            message: `${orders.length} orders auto completed`,
            orders
        })

    } catch (error) {
        console.error("Error auto completing orders:", error)
        return res.status(500).json({ error: "Failed to auto complete orders" })
    }
}