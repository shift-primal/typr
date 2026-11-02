export const HiddenInput = ({
	ref,
	value,
	onType,
	onBackspace,
}: {
	ref?: React.Ref<HTMLInputElement>;
	value: string;
	onType: (text: string) => void;
	onBackspace: () => void;
}) => {
	const guardKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.ctrlKey || e.metaKey) {
			e.preventDefault();
			return;
		}

		if (e.key === "Backspace") {
			e.preventDefault();
			onBackspace();
		}
	};

	const handleChange = (next: string) => {
		if (next.length < value.length) onBackspace();
		else if (next.startsWith(value)) onType(next.slice(value.length));
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
			onChange={(e) => handleChange(e.target.value)}
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
