import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";
import { clerkClient } from "@clerk/clerk-sdk-node";

export async function syncUser(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" })
        };

        const { email, name, imageUrl, coverImage } = req.body

        if (!email || !name || !imageUrl) {
            return res.status(400).json({ error: "Email, name, and imageUrl are required" })
        };

        const user = await queries.upsertUser({
            id: userId,
            email,
            name,
            imageUrl,
            coverImage,
        });

        res.status(200).json(user);

    } catch (error) {
        console.error("Error syncing user: ", error);
        res.status(500).json({ error: "Failed to sync user" });
    }
};

export async function getUserById(req: Request, res: Response) {
    try {
        const { id } = req.params as { id: string };

        const user = await queries.getUserById(id);

        if (!user) {
            return res.status(404).json({ error: `User with this id ${id} not found` });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error("Error while searching for user", error);
        return res.status(500).json({ error: "Failed to search user" });
    }
};

export async function getUserByEmail(req: Request, res: Response) {
    try {
        const { email } = req.params as { email: string };

        const user = await queries.getUserByEmail(email);

        if (!user) {
            return res.status(404).json({ error: `User with this email ${email} not found` });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error("Error while searching for user", error);
        return res.status(500).json({ error: "Failed to search user" });
    }
};

export async function updateUser(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { id } = req.params as { id: string };
        const { email, name, imageUrl, role, bio, skill, country, jobTitle, experience, coverImage } = req.body;

        const existingUser = await queries.getUserById(id);

        if (!existingUser) {
            return res.status(404).json({ error: "User not found" });
        }

        if (existingUser.id !== userId) {
            return res
                .status(403)
                .json({ error: "You can only update your own Profile" });
        }

        const user = await queries.updateUser(id, {
            email,
            name, imageUrl,
            role,
            bio,
            skill,
            coverImage,
            country,
            jobTitle,
            experience
        });

        return res.status(200).json(user);

    } catch (error) {
        console.error("Error while updating user:", error);
        return res.status(500).json({ error: "Failed to update user" });
    };
};

export async function deleteUser(req: Request, res: Response) {
    try {
        const { userId } = getAuth(req); // Clerk userId from auth

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { id } = req.params as { id: string };

        const existingUser = await queries.getUserById(id);

        if (!existingUser) {
            return res.status(404).json({ error: `User with this id ${id} was not found` });
        }

        if (existingUser.id !== userId) {
            return res
                .status(403)
                .json({ error: "You can only delete your own profile" });
        }

        await queries.deleteUser(id);

        try {
            await clerkClient.users.deleteUser(userId);
        } catch (clerkError) {
            console.error("Failed to delete user from Clerk:", clerkError);
            return res.status(500).json({ error: "User deleted from DB but failed on Clerk" });
        }

        res.status(200).json({ message: "User deleted successfully from DB and Clerk" });
    } catch (error) {
        console.error("Error while deleting user:", error);
        return res.status(500).json({ error: "Failed to delete user" });
    }
};