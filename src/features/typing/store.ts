import { createStore } from "@tanstack/react-store";

import {
	backspace,
	commitWord,
	createSession,
	typeChar,
} from "#/features/typing/model/session";
import { generateText } from "#/features/typing/model/text";

export const createTypingStore = () =>
	createStore(createSession([]), ({ setState }) => ({
		typeChar: (char: string) => setState((s) => typeChar(s, char, Date.now())),

		backspace: () => setState(backspace),

		commitWord: () => setState((s) => commitWord(s, Date.now())),

		restart: () => setState(() => createSession(generateText())),
	}));

export const typingStore = createTypingStore();
