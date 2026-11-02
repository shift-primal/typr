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
