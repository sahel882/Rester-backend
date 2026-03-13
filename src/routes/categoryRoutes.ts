import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { createCategory, deleteCategory, getAllCategories, getCategoryById, getCategoryBySlug, updateCategory } from "../controllers/categoryController";

const router = Router();

router.post("/", requireAuth(), createCategory);

router.get("/", getAllCategories);

router.get("/:id", getCategoryById);

router.get("/slug/:slug", getCategoryBySlug);

router.put("/:id", requireAuth(), updateCategory);

router.delete("/:id", requireAuth(), deleteCategory);

export default router;