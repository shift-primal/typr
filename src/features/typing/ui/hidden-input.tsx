export const HiddenInput = ({
	ref,
	value,
	onChange,
}: {
	ref?: React.Ref<HTMLInputElement>;
	value: string;
	onChange: (value: string) => void;
}) => {
	const guardKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.ctrlKey || e.metaKey) {
			e.preventDefault();
			return;
		}

		if (e.key === "Backspace") {
			const start = e.currentTarget.selectionStart ?? 0;
			const end = e.currentTarget.selectionEnd ?? 0;
			if (end - start > 1) {
				e.preventDefault();
			}
		}
	};

	const resetSelection = (e: React.SyntheticEvent<HTMLInputElement>) => {
		const target = e.currentTarget;
		target.setSelectionRange(target.value.length, target.value.length);
	};

	return (
		<input
			ref={ref}
			className="absolute inset-0 w-full h-full opacity-0 cursor-default pointer-events-none z-10"
			value={value}
			onChange={(e) => onChange(e.target.value)}
			onKeyDown={guardKeys}
			onSelect={resetSelection}
			type="text"
			autoFocus
			autoComplete="off"
			autoCapitalize="off"
			autoCorrect="off"
			spellCheck={false}
		/>
	);
};
