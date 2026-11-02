import { useSelector } from "@tanstack/react-store";

import { roomStore } from "#/features/room/room-store";

export const RoomScreen = () => {
	const roomId = useSelector(roomStore, (s) => s.roomId);
	const players = useSelector(roomStore, (s) => s.players);

	if (!roomId) return null;

	return (
		<div>
			<h2>Room {roomId}</h2>
			<ul>
				{players.map((p) => (
					<li key={p.id}>{p.name}</li>
				))}
			</ul>
		</div>
	);
};
