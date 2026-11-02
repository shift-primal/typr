export type TypingSession = {
	words: string[];
	attempts: string[];
	current: string;

	startedAt: number | null;
	finishedAt: number | null;

	keystrokes: number;
	errors: number;
};

export type WordStatus = "done" | "current" | "upcoming";
export type CharStatus =
	| "pending"
	| "correct"
	| "incorrect"
	| "missed"
	| "extra";

export const createSession = (words: string[]): TypingSession => ({
	words,
	attempts: [],
	current: "",
	startedAt: null,
	finishedAt: null,
	keystrokes: 0,
	errors: 0,
});

const activeWord = (state: TypingSession) => state.words[state.attempts.length];

const isLastWord = (state: TypingSession) =>
	state.attempts.length === state.words.length - 1;

const finish = (state: TypingSession, now: number): TypingSession => ({
	...state,
	attempts: [...state.attempts, state.current],
	current: "",
	finishedAt: now,
});

export const typeChar = (
	state: TypingSession,
	char: string,
	now: number,
): TypingSession => {
	if (state.finishedAt !== null || state.words.length === 0) return state;

	const target = activeWord(state);
	const current = state.current + char;
	const next = {
		...state,
		current,
		keystrokes: state.keystrokes + 1,
		errors: state.errors + (char === target[state.current.length] ? 0 : 1),
		startedAt: state.startedAt ?? now,
	};

	return isLastWord(state) && current === target ? finish(next, now) : next;
};

export const backspace = (state: TypingSession): TypingSession => {
	if (state.finishedAt !== null) return state;
	if (state.current.length > 0)
		return { ...state, current: state.current.slice(0, -1) };

	const prev = state.attempts.at(-1);
	const allCorrect = state.attempts.every((a, i) => a === state.words[i]);

	if (prev === undefined || allCorrect) return state;

	return {
		...state,
		attempts: state.attempts.slice(0, -1),
		current: prev,
	};
};

export const commitWord = (
	state: TypingSession,
	now: number,
): TypingSession => {
	if (state.finishedAt !== null || state.current === "") return state;
	if (isLastWord(state)) return finish(state, now);

	return {
		...state,
		attempts: [...state.attempts, state.current],
		current: "",
	};
};

export const wordStatus = (state: TypingSession, idx: number): WordStatus =>
	idx < state.attempts.length
		? "done"
		: idx === state.attempts.length
			? "current"
			: "upcoming";

export const typedFor = (state: TypingSession, idx: number): string =>
	idx < state.attempts.length
		? state.attempts[idx]
		: idx === state.attempts.length
			? state.current
			: "";

export const charStatus = (
	target: string,
	typed: string,
	idx: number,
	done: boolean,
): CharStatus => {
	if (idx >= target.length) return "extra";
	if (idx >= typed.length) return done ? "missed" : "pending";
	return typed[idx] === target[idx] ? "correct" : "incorrect";
};
