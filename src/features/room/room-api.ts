import { toast } from "#/components/ui/toast";
import type { RequestMessage, Socket } from "#/socket/use-socket";

const requestRoom = async (
	socket: Socket,
	message: RequestMessage,
	successTitle: string,
) => {
	try {
		const reply = await socket.request(message);

		if (reply.type === "room_error") {
			toast.add({ title: "Could not enter room", description: reply.message });
			return;
		}

		toast.add({
			title: successTitle,
			description: `Successfully entered room ${reply.roomId}`,
		});

		return reply.roomId;
	} catch (e) {
		toast.add({
			title: "Connection problem",
			description: e instanceof Error ? e.message : String(e),
		});
	}
};

export const joinRoom = (socket: Socket, roomId: string, name: string) =>
	requestRoom(socket, { type: "join_room", roomId, name }, "Joined room!");

export const createRoom = (socket: Socket, name: string) =>
	requestRoom(socket, { type: "create_room", name }, "Created room!");
