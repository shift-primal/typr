import { describe, expect, test } from "vite-plus/test";

import {
	backspace,
	charStatus,
	commitWord,
	createSession,
	type TypingSession,
	typeChar,
} from "#/features/typing/model/session";

const type = (state: TypingSession, text: string, now = 0) => {
	for (const char of text)
		state = char === " " ? commitWord(state, now) : typeChar(state, char, now);
	return state;
};

const session = () => createSession(["the", "quick", "fox"]);

describe("typing session", () => {
	test("space commits the current word", () => {
		const state = type(session(), "the qu");

		expect(state.attempts).toEqual(["the"]);
		expect(state.current).toBe("qu");
	});

	test("space commits a wrong word too", () => {
		const state = type(session(), "the qiuck ");

		expect(state.attempts).toEqual(["the", "qiuck"]);
		expect(state.current).toBe("");
	});

	test("space on an empty word does nothing", () => {
		const state = type(session(), "the ");

		expect(commitWord(state, 0)).toBe(state);
	});

	test("backspace removes the last character", () => {
		expect(backspace(type(session(), "th")).current).toBe("t");
	});

	test("backspace reopens a wrong previous word", () => {
		const state = backspace(type(session(), "the qiuck "));

		expect(state.attempts).toEqual(["the"]);
		expect(state.current).toBe("qiuck");
	});

	test("backspace is locked when every previous word is correct", () => {
		const state = type(session(), "the quick ");

		expect(backspace(state)).toBe(state);
	});

	test("backspace goes back through a correct word to an earlier mistake", () => {
		let state = type(session(), "teh quick ");

		for (let i = 0; i < 7; i++) state = backspace(state);

		expect(state.attempts).toEqual([]);
		expect(state.current).toBe("teh");
	});

	test("backspace walks back through wrong words until a correct one", () => {
		let state = type(
			createSession(["the", "quick", "brown", "fox"]),
			"the qx bx ",
		);

		for (let i = 0; i < 10; i++) state = backspace(state);

		expect(state.attempts).toEqual(["the"]);
		expect(state.current).toBe("");
	});

	test("typing the last word correctly finishes without a space", () => {
		const state = type(session(), "the quick fox", 1000);

		expect(state.finishedAt).toBe(1000);
		expect(state.attempts).toEqual(["the", "quick", "fox"]);
		expect(state.current).toBe("");
	});

	test("space on a wrong last word finishes", () => {
		const state = type(session(), "the quick fx ");

		expect(state.finishedAt).not.toBeNull();
		expect(state.attempts).toEqual(["the", "quick", "fx"]);
	});

	test("input after finishing is ignored", () => {
		const state = type(session(), "the quick fox");

		expect(typeChar(state, "a", 0)).toBe(state);
		expect(backspace(state)).toBe(state);
	});

	test("errors stay counted after fixing them", () => {
		const state = type(backspace(type(session(), "tx")), "he");

		expect(state.current).toBe("the");
		expect(state.keystrokes).toBe(4);
		expect(state.errors).toBe(1);
	});

	test("startedAt is set on the first character", () => {
		expect(type(session(), "t", 500).startedAt).toBe(500);
	});
});

describe("charStatus", () => {
	test("classifies typed, missing and extra characters", () => {
		expect(charStatus("fox", "fx", 0, false)).toBe("correct");
		expect(charStatus("fox", "fx", 1, false)).toBe("incorrect");
		expect(charStatus("fox", "fx", 2, false)).toBe("pending");
		expect(charStatus("fox", "fx", 2, true)).toBe("missed");
		expect(charStatus("fox", "foxy", 3, false)).toBe("extra");
	});
});
