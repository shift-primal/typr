import { createFileRoute } from "@tanstack/react-router";

import { PageWrapper } from "#/components/layout/page-wrapper.tsx";
import { Typing } from "#/components/typing.tsx";

export const Route = createFileRoute("/solo")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<PageWrapper>
			<Typing />
		</PageWrapper>
	);
}
