import type { ReactNode } from "react";

export const PageWrapper = ({ children }: { children: ReactNode }) => (
	<div className="flex items-center justify-center h-full">{children}</div>
);
