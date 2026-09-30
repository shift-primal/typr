import { definePlugin } from "nitro";

import { sql } from "#/db/index.ts";
import { closeAllPeers } from "#/server/realtime/peers.ts";

// srvx closes the HTTP server on SIGTERM but never runs Nitro's `close` hook,
// so match sockets and the database pool are shut down from here.
export default definePlugin(() => {
	let shuttingDown = false;
	const shutdown = async (signal: NodeJS.Signals) => {
		if (shuttingDown) return;
		shuttingDown = true;
		console.log(JSON.stringify({ level: "info", msg: "shutdown", signal }));
		closeAllPeers();
		await sql.end({ timeout: 5 });
	};
	process.once("SIGTERM", shutdown);
	process.once("SIGINT", shutdown);
});
