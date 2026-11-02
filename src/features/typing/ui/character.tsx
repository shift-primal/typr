import { cn } from "cn";

import { Caret } from "#/features/typing/ui/caret";
import { charStatus, type TypingState } from "#/game/typing.ts";

export const Character = ({
	char,
	i,
	state,
}: {
	char: string;
	i: number;
	state: TypingState;
}) => {
	const styles = {
		pending: "text-muted-foreground",
		correct: "text-success",
		incorrect: "text-destructive",
	};

	return (
		<div
			key={i}
			className={cn(
				[styles[charStatus(state, i)]].filter(Boolean).join(" "),
				"inline relative",
			)}
		>
			<Caret i={i} typed={state.typed} />
			<span>{char}</span>
		</div>
	);
};
