import type { TypingState } from "#/game/typing";

export const wpm = (state: TypingState, now: number): number => {
	//TODO: correct chars / 5 / minutes
};

export const accuracy = (state: TypingState): number => {
	// TODO: (keystrokes - errors) / keystrokes
};
