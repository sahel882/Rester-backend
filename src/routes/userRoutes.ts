import { Router } from "express";
import { deleteUser, getUserByEmail, getUserById, syncUser, updateUser } from "../controllers/userController";
import { requireAuth } from "@clerk/express";

const router = Router();

router.post("/sync", requireAuth(), syncUser);

router.get("/:id", getUserById);

router.get("/email/:email", getUserByEmail);

router.put("/:id", requireAuth(), updateUser);

router.delete("/:id", requireAuth(), deleteUser);

export default router;