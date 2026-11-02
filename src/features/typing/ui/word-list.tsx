import { useSelector } from "@tanstack/react-store";

import { typedFor, wordStatus } from "#/features/typing/model/session";
import { typingStore } from "#/features/typing/store";
import { Word } from "#/features/typing/ui/word";

export const WordList = () => {
	const session = useSelector(typingStore, (s) => s);

	return (
		<div className="pointer-events-none select-none w-lg font-mono text-2xl leading-relaxed">
			{session.words.map((word, i) => (
				<Word
					key={i}
					target={word}
					typed={typedFor(session, i)}
					status={wordStatus(session, i)}
				/>
			))}
		</div>
	);
};
