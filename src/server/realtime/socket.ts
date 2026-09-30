import { defineWebSocketHandler } from "nitro";

import {
	addPeer,
	markAlive,
	removePeer,
	send,
	withinRateLimit,
} from "./peers.ts";
import { clientMessage } from "./protocol.ts";

const MAX_MESSAGE_BYTES = 4096;

// Registered at /api/ws in vite.config.ts (Nitro route, outside the Start router).
export default defineWebSocketHandler({
	upgrade(request) {
		// Stops cross site websocket hijacking: the socket will trust the auth cookie.
		if (request.headers.get("origin") !== process.env.BETTER_AUTH_URL) {
			throw new Response("Forbidden", { status: 403 });
		}
		// Session check (401 without a session) lands with Better Auth in feature 7.
	},
	open(peer) {
		addPeer(peer);
	},
	message(peer, message) {
		markAlive(peer);
		const raw = message.text();
		if (Buffer.byteLength(raw) > MAX_MESSAGE_BYTES) {
			peer.close(1009, "message_too_big");
			return;
		}
		if (!withinRateLimit(peer)) {
			peer.close(1008, "rate_limited");
			return;
		}
		let json: unknown;
		try {
			json = JSON.parse(raw);
		} catch {
			peer.close(1008, "invalid_message");
			return;
		}
		const parsed = clientMessage.safeParse(json);
		if (!parsed.success) {
			peer.close(1008, "invalid_message");
			return;
		}
		switch (parsed.data.type) {
			case "echo":
				send(peer, { type: "echo", text: parsed.data.text });
				break;
		}
	},
	pong(peer) {
		markAlive(peer);
	},
	close(peer) {
		removePeer(peer);
	},
	error(peer) {
		removePeer(peer);
	},
});
