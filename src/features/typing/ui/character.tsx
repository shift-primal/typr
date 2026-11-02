import { cn } from "cn";

import type { CharStatus } from "#/features/typing/model/session";
import { Caret } from "#/features/typing/ui/caret";

const styles: Record<CharStatus, string> = {
	pending: "text-muted-foreground",
	correct: "text-success",
	incorrect: "text-destructive",
	missed: "text-muted-foreground underline decoration-destructive",
	extra: "text-destructive/60",
};

export const Character = ({
	char,
	status,
	caret,
}: {
	char: string;
	status: CharStatus;
	caret: boolean;
}) => (
	<span className={cn(styles[status], "relative")}>
		{caret && <Caret />}
		{char}
	</span>
);
