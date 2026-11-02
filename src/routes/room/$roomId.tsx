import { createFileRoute } from "@tanstack/react-router";

import { RoomScreen } from "#/features/room/room-screen";

export const Route = createFileRoute("/room/$roomId")({
	component: RouteComponent,
});

function RouteComponent() {
	return <RoomScreen />;
}
