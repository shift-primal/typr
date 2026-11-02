import { RotateCcw, Timer } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { HiddenInput } from "#/features/typing/ui/hidden-input.tsx";
import { WordList } from "#/features/typing/ui/word-list.tsx";
import { applyInput, createTyping, type TypingState } from "#/game/typing";

const blankTyping = (): TypingState => ({
	target: "",
	typed: "",
	startedAt: null,
	finishedAt: null,
	keystrokes: 0,
	errors: 0,
});

export const Typing = () => {
	const [typingState, setTypingState] = useState<TypingState>(blankTyping);

	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		setTypingState(createTyping());
	}, []);

	const restart = () => {
		setTypingState(createTyping());
		inputRef.current?.focus();
	};

	const handleChange = (value: string) => {
		console.log(value);
		setTypingState((p) => applyInput(p, value, Date.now()));
	};

	return (
		<div
			className="w-full h-full flex items-center justify-center relative"
			onClick={() => {
				inputRef.current?.focus();
			}}
		>
			<HiddenInput
				ref={inputRef}
				value={typingState.typed}
				onChange={handleChange}
			/>
			<WordList state={typingState} />
			<div
				id="ui"
				className="absolute bottom-10 right-1/2 translate-1/2 w-md flex items-center justify-between"
			>
				<Timer
					startedAt={typingState.startedAt}
					finishedAt={typingState.finishedAt}
				/>
				<button
					type="button"
					onClick={restart}
					className="border border-foreground p-.5 cursor-pointer"
				>
					<RotateCcw className="size-5" />
				</button>
			</div>
		</div>
	);
};
