import { createFileRoute } from "@tanstack/react-router";

import { PageWrapper } from "#/components/layout/page-wrapper.tsx";
import { EnterRoom } from "#/features/room/enter-room";

export const Route = createFileRoute("/room/enter")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<PageWrapper>
			<EnterRoom />
		</PageWrapper>
	);
}
