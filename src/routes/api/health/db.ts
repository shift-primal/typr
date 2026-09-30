import { createFileRoute } from "@tanstack/react-router";

import { sql } from "#/db/index.ts";

// Called once per deploy by the CI smoke step, and by hand.
export const Route = createFileRoute("/api/health/db")({
	server: {
		handlers: {
			GET: async () => {
				try {
					await sql`select 1`;
					return Response.json({ ok: true });
				} catch {
					return Response.json({ ok: false }, { status: 503 });
				}
			},
		},
	},
});
