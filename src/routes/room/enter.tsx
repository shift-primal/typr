import { createFileRoute } from "@tanstack/react-router";

import { EnterRoom } from "#/components/enter-room.tsx";
import { PageWrapper } from "#/components/layout/page-wrapper.tsx";

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
