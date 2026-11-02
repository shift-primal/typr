import { words } from "#/features/typing/model/word-list";

export const generateText = (count: number = 100): string[] => {
	let selectedWords = [];

	for (let i = 0; i < count; i++) {
		const randIdx = Math.floor(Math.random() * words.length);
		selectedWords.push(words[randIdx]);
	}

	return selectedWords;
};
