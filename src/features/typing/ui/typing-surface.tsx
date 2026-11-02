import { useSelector } from "@tanstack/react-store";
import { useRef, type ReactNode } from "react";

import { typingStore } from "#/features/typing/store";
import { HiddenInput } from "#/features/typing/ui/hidden-input";
import { WordList } from "#/features/typing/ui/word-list";

const type = (text: string) => {
	for (const char of text) {
		if (char === " ") typingStore.actions.commitWord();
		else typingStore.actions.typeChar(char);
	}
};

export const TypingSurface = ({ children }: { children?: ReactNode }) => {
	const current = useSelector(typingStore, (s) => s.current);
	const inputRef = useRef<HTMLInputElement>(null);

	return (
		<div
			className="w-full h-full flex items-center justify-center relative"
			onClick={() => inputRef.current?.focus()}
		>
			<HiddenInput
				ref={inputRef}
				value={current}
				onType={type}
				onBackspace={typingStore.actions.backspace}
			/>
			<WordList />
			{children}
		</div>
	);
};
