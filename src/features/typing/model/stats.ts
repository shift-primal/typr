import type { TypingSession } from "#/features/typing/model/session";

export const wordsDone = (state: TypingSession): number =>
	state.attempts.length;

export const correctWords = (state: TypingSession): number =>
	state.attempts.filter((attempt, i) => attempt === state.words[i]).length;

// Correct words plus their following space, / 5 / minutes.
export const wpm = (state: TypingSession, now: number): number => {
	if (state.startedAt === null) return 0;

	const minutes = ((state.finishedAt ?? now) - state.startedAt) / 60_000;
	if (minutes <= 0) return 0;

	const chars = state.attempts.reduce(
		(sum, attempt, i) =>
			attempt === state.words[i] ? sum + attempt.length + 1 : sum,
		0,
	);

	return chars / 5 / minutes;
};

export const accuracy = (state: TypingSession): number =>
	state.keystrokes === 0
		? 100
		: ((state.keystrokes - state.errors) / state.keystrokes) * 100;
