import { createFileRoute, Link } from "@tanstack/react-router";

import { PageWrapper } from "#/components/layout/page-wrapper.tsx";

const Home = () => {
	return (
		<PageWrapper>
			<Link to="/solo">Solo</Link>
			<Link to="/room/enter">Multiplayer</Link>
		</PageWrapper>
	);
};

export const Route = createFileRoute("/")({ component: Home });
