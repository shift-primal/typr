import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema.ts";

// Direct (unpooled) Neon connection. Idle connections close after 20s so Neon can scale to zero.
export const sql = postgres(process.env.DATABASE_URL as string, {
	max: 5,
	idle_timeout: 20,
	connect_timeout: 10,
});

export const db = drizzle(sql, { schema });
