import { createFileRoute } from "@tanstack/react-router";

// Liveness only, no database call: Coolify polls this every 30s and must not keep Neon awake.
export const Route = createFileRoute("/api/health/")({
	server: {
		handlers: {
			GET: () =>
				Response.json({ ok: true, version: process.env.APP_VERSION ?? "dev" }),
		},
	},
});
