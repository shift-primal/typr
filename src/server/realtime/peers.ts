import type { WebSocketPeer as Peer } from "nitro/h3";

import type { ServerMessage } from "./protocol.ts";

const HEARTBEAT_MS = 20_000;
const MAX_MISSED_PINGS = 2;
const MAX_MESSAGES_PER_SECOND = 30;

type PeerState = {
	missedPings: number;
	windowStart: number;
	windowCount: number;
};

// In memory is valid only because exactly one app instance runs (spec 0001 invariant).
const peers = new Map<Peer, PeerState>();
let heartbeat: ReturnType<typeof setInterval> | undefined;

export function send(peer: Peer, message: ServerMessage) {
	peer.send(JSON.stringify(message));
}

export function addPeer(peer: Peer) {
	peers.set(peer, { missedPings: 0, windowStart: Date.now(), windowCount: 0 });
	heartbeat ??= setInterval(sweep, HEARTBEAT_MS);
	heartbeat.unref();
}

export function removePeer(peer: Peer) {
	peers.delete(peer);
	if (peers.size === 0 && heartbeat) {
		clearInterval(heartbeat);
		heartbeat = undefined;
	}
}

export function markAlive(peer: Peer) {
	const state = peers.get(peer);
	if (state) state.missedPings = 0;
}

/** Counts a message against the per socket rate limit. Returns false once the peer goes over it. */
export function withinRateLimit(peer: Peer) {
	const state = peers.get(peer);
	if (!state) return false;
	const now = Date.now();
	if (now - state.windowStart >= 1000) {
		state.windowStart = now;
		state.windowCount = 0;
	}
	state.windowCount++;
	return state.windowCount <= MAX_MESSAGES_PER_SECOND;
}

function sweep() {
	for (const [peer, state] of peers) {
		if (state.missedPings >= MAX_MISSED_PINGS) {
			peer.terminate();
			removePeer(peer);
			continue;
		}
		state.missedPings++;
		peer.ping();
	}
}

/** Called on SIGTERM: tell every socket the server is restarting, then close it. */
export function closeAllPeers() {
	// Live matches get marked aborted here once the match server exists (spec 0001).
	for (const peer of peers.keys()) {
		send(peer, { type: "server_restarting" });
		peer.close(1012, "server_restarting");
	}
	peers.clear();
	if (heartbeat) clearInterval(heartbeat);
	heartbeat = undefined;
}
