import { Character } from "#/features/typing/ui/character";
import type { TypingState } from "#/game/typing.ts";

export const WordList = ({ state }: { state: TypingState }) => {
	return (
		<div className="pointer-events-none select-none w-lg">
			<div className="font-mono text-2xl leading-relaxed">
				{[...state.target].map((char, i) => (
					<Character key={`${char}-${i}`} char={char} i={i} state={state} />
				))}
			</div>
		</div>
	);
};
