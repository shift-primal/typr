import { createStore } from "@tanstack/react-store";

import type { Player } from "#/shared/protocol";

type RoomState = {
	roomId: string | null;
	players: Player[];
};

const initialRoomState: RoomState = { roomId: null, players: [] };

export const createRoomStore = () =>
	createStore(initialRoomState, ({ setState }) => ({
		joined: (roomId: string, players: Player[]) =>
			setState(() => ({ roomId, players })),

		playerJoined: (player: Player) =>
			setState((s) =>
				s.players.some((p) => p.id === player.id)
					? s
					: { ...s, players: [...s.players, player] },
			),

		playerLeft: (id: string) =>
			setState((s) => ({
				...s,
				players: s.players.filter((p) => p.id !== id),
			})),

		reset: () => setState(() => initialRoomState),
	}));

export const roomStore = createRoomStore();
