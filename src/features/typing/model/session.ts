import { generateText } from "#/features/typing/model/text";

export type TypingState = {
	words: string[];
	attempts: string[];
	current: string;

	startedAt: number | null;
	finishedAt: number | null;

	keystrokes: number;
	errors: number;
};

export type CharacterStatus = "pending" | "correct" | "incorrect";

export const createTyping = (): TypingState => ({
	target: generateText(),
	typed: "",
	startedAt: null,
	finishedAt: null,
	keystrokes: 0,
	errors: 0,
});

export const applyInput = (
	state: TypingState,
	input: string,
	now: number,
): TypingState => {
	if (state.finishedAt !== null) return state;

	const typed = input.slice(0, state.target.length);

	let { keystrokes, errors } = state;
	for (let i = state.typed.length; i < typed.length; i++) {
		keystrokes++;
		if (typed[i] !== state.target[i]) errors++;
	}

	return {
		...state,
		typed,
		keystrokes,
		errors,
		startedAt: state.startedAt ?? (typed.length > 0 ? now : null),
		finishedAt: typed === state.target ? now : null,
	};
};

export const typeChar = ()

export const charStatus = (state: TypingState, idx: number): CharacterStatus =>
	idx >= state.typed.length
		? "pending"
		: state.typed[idx] == state.target[idx]
			? "correct"
			: "incorrect";
