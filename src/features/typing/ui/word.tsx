import { charStatus, type WordStatus } from "#/features/typing/model/session";
import { Character } from "#/features/typing/ui/character";

export const Word = ({
	target,
	typed,
	status,
}: {
	target: string;
	typed: string;
	status: WordStatus;
}) => {
	const length = Math.max(target.length, typed.length);
	const isCurrent = status === "current";

	return (
		<span className="inline-block whitespace-pre">
			{Array.from({ length }, (_, i) => (
				<Character
					key={i}
					char={target[i] ?? typed[i]}
					status={charStatus(target, typed, i, status === "done")}
					caret={isCurrent && i === typed.length}
				/>
			))}
			<Character
				char=" "
				status="pending"
				caret={isCurrent && typed.length === length}
			/>
		</span>
	);
};
