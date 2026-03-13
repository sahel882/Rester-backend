import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { approveOrder, autoCompleteOrder, createOrder, getOrderById, getOrdersByBuyer, getOrdersBySeller, updateOrderStatus } from "../controllers/orderController";

const router = Router();

router.post("/", requireAuth(), createOrder);

router.get("/:id", requireAuth(), getOrderById);

router.get("/buyer/:id", requireAuth(), getOrdersByBuyer);

router.get("/seller/:id", requireAuth(), getOrdersBySeller);

router.put("/:id/status", requireAuth(), updateOrderStatus);

router.put("/:id/approve", requireAuth(), approveOrder);

router.post("/auto-complete", requireAuth(), autoCompleteOrder);

export default router;