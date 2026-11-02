import { useSelector } from "@tanstack/react-store";
import { RotateCcw } from "lucide-react";
import { useEffect } from "react";

import { typingStore } from "#/features/typing/store";
import { StatsBar } from "#/features/typing/ui/stats-bar";
import { Timer } from "#/features/typing/ui/timer";
import { TypingSurface } from "#/features/typing/ui/typing-surface";

export const SoloScreen = () => {
	const startedAt = useSelector(typingStore, (s) => s.startedAt);
	const finishedAt = useSelector(typingStore, (s) => s.finishedAt);

	useEffect(() => {
		typingStore.actions.restart();
	}, []);

	return (
		<TypingSurface>
			<div className="absolute bottom-10 right-1/2 translate-1/2 w-md flex items-center justify-between">
				<Timer startedAt={startedAt} finishedAt={finishedAt} />
				<StatsBar />
				<button
					type="button"
					onClick={typingStore.actions.restart}
					className="border border-foreground p-.5 cursor-pointer"
				>
					<RotateCcw className="size-5" />
				</button>
			</div>
		</TypingSurface>
	);
};
