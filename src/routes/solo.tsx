import { createFileRoute } from "@tanstack/react-router";

import { PageWrapper } from "#/components/layout/page-wrapper.tsx";
import { SoloScreen } from "#/features/solo/solo-screen";

export const Route = createFileRoute("/solo")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<PageWrapper>
			<SoloScreen />
		</PageWrapper>
	);
}
