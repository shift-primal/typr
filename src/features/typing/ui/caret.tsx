import { cn } from "cn";

export const Caret = ({ i, typed }: { i: number; typed: string }) => (
	<div
		className={cn(
			i === typed.length && "bg-yellow-300 animate-blink -z-50",
			"inset-0 absolute",
		)}
	></div>
);
