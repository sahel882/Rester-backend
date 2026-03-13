import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";

export async function createCategory(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { id, name, slug, icon, description } = req.body;

        if (!name || !slug || !icon || !description) {
            return res
                .status(400)
                .json({ error: "Please enter all the details" });
        };

        const category = await queries.createCategory({
            name,
            slug,
            icon,
            description
        });

        return res.status(200).json(category)


    } catch (error) {
        console.error("Error while creating a category", error);
        return res.status(500).json({ error: "Failed to create a category" });
    };
};

export async function getAllCategories(req: Request, res: Response) {
    try {
        const category = await queries.getAllCategories();
        return res.status(200).json(category);
    } catch (error) {
        console.error("Error getting category:", error);
        return res.status(500).json({ error: "Failed to get category" });
    }
};

export async function getCategoryById(req: Request, res: Response) {
    try {
        const { id } = req.params as { id: string };

        const category = await queries.getCategoryById(id);

        if (!category) return res.status(404).json({ error: "Category not found" });

        return res.status(200).json(category);
    } catch (error) {
        console.error("Error getting category:", error);
        return res.status(500).json({ error: "Failed to get category" });
    }
};

export async function getCategoryBySlug(req: Request, res: Response) {
    try {
        const { slug } = req.params as { slug: string };

        const category = await queries.getCategoryBySlug(slug);

        return res.status(200).json(category);
    } catch (error) {
        console.error("Error getting category:", error);
        return res.status(500).json({ error: "Failed to get category" });
    }
};

export async function updateCategory(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { id } = req.params as { id: string };
        const { name, slug, icon, description } = req.body;

        const existingCategory = await queries.getCategoryById(id);

        if (!existingCategory) {
            return res.status(404).json({ error: "category not found" });
        }

        const category = await queries.updateCategory(id, {
            name,
            slug,
            icon,
            description
        });

        return res.status(200).json(category);
    } catch (error) {
        console.error("Error updating category:", error);
        return res.status(500).json({ error: "Failed to update category" });
    }
};

export async function deleteCategory(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { id } = req.params as { id: string };

        const existingCategory = await queries.getCategoryById(id);

        if (!existingCategory) {
            return res.status(404).json({ error: "category not found" });
        }

        await queries.deleteCategory(id);

        return res
            .status(200)
            .json({ message: "category deleted successfully" });
    } catch (error) {
        console.error("Error deleting category:", error);
        return res.status(500).json({ error: "Failed to delete category" });
    }
};