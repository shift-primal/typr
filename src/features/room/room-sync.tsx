import { useEffect } from "react";

import { roomStore } from "#/features/room/room-store";
import type { ServerMessage } from "#/shared/protocol";
import { useSocketContext } from "#/socket/socket-provider";

export const handleServerMessage = (message: ServerMessage) => {
	switch (message.type) {
		case "room_joined":
			roomStore.actions.joined(message.roomId, message.players);
			break;
		case "player_joined":
			roomStore.actions.playerJoined(message.player);
			break;
		case "player_left":
			roomStore.actions.playerLeft(message.id);
			break;
	}
};

export const RoomSync = () => {
	const { subscribe } = useSocketContext();

	useEffect(
		() =>
			subscribe({
				onMessage: handleServerMessage,
				onClose: roomStore.actions.reset,
			}),
		[subscribe],
	);

	return null;
};
