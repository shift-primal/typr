import { defineConfig } from "drizzle-kit";

// DATABASE_URL comes from varlock: run through `varlock run -- drizzle-kit …` (the db:* scripts).
export default defineConfig({
	out: "./drizzle",
	schema: "./src/db/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL as string,
	},
});
