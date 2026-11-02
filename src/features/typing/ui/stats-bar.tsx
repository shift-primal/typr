import { useSelector } from "@tanstack/react-store";

import { accuracy, wordsDone, wpm } from "#/features/typing/model/stats";
import { typingStore } from "#/features/typing/store";

export const StatsBar = () => {
	const session = useSelector(typingStore, (s) => s);

	return (
		<p className="flex gap-4">
			<span>
				{wordsDone(session)}/{session.words.length}
			</span>
			<span>{accuracy(session).toFixed(0)}%</span>
			{session.finishedAt !== null && (
				<span>{wpm(session, session.finishedAt).toFixed(0)} wpm</span>
			)}
		</p>
	);
};
