import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { createNotification, deleteNotification, getNotificationById, getNotificationsByUser, markAllNotificationsAsRead, markNotificationAsRead } from "../controllers/notificationController";

const router = Router();

router.post("/", requireAuth(), createNotification);

router.get("/my", requireAuth(), getNotificationsByUser);

router.put("/:id/read-all", requireAuth(), markAllNotificationsAsRead);

router.put("/:id/read", requireAuth(), markNotificationAsRead);

router.get("/:id", requireAuth(), getNotificationById);

router.delete("/:id", requireAuth(), deleteNotification);

export default router;