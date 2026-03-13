import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { ENV } from "../config/env";

if (!ENV.DATABASE_URI) {
    throw new Error("DATABASE_URI is not set in environment variables")
}

const pool = new Pool({ connectionString: ENV.DATABASE_URI });

pool.on("connect", () => {
    console.log("Database connected successfully");
});

pool.on("error", (err) => {
    console.log("Database connection fail", err);
});

export const db = drizzle({ client: pool, schema });