import { beforeEach, describe, expect, test } from "vite-plus/test";

import { createRoomStore } from "#/features/room/room-store";

const alice = { id: "a", name: "Alice" };
const bob = { id: "b", name: "Bob" };

describe("room store", () => {
	let store: ReturnType<typeof createRoomStore>;

	beforeEach(() => {
		store = createRoomStore();
	});

	test("joined replaces the previous state", () => {
		store.actions.joined("AAAA", [alice]);
		store.actions.joined("BBBB", [bob]);

		expect(store.state).toEqual({ roomId: "BBBB", players: [bob] });
	});

	test("playerJoined adds a player", () => {
		store.actions.joined("AAAA", [alice]);
		store.actions.playerJoined(bob);

		expect(store.state.players).toEqual([alice, bob]);
	});

	test("playerJoined ignores a duplicate and keeps the same state object", () => {
		store.actions.joined("AAAA", [alice]);
		const before = store.state;

		store.actions.playerJoined(alice);

		expect(store.state).toBe(before);
	});

	test("playerLeft removes only that player", () => {
		store.actions.joined("AAAA", [alice, bob]);
		store.actions.playerLeft("a");

		expect(store.state.players).toEqual([bob]);
	});

	test("reset returns to the initial state", () => {
		store.actions.joined("AAAA", [alice]);
		store.actions.reset();

		expect(store.state).toEqual({ roomId: null, players: [] });
	});
});
