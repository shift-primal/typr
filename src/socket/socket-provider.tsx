import { createContext, use, type ReactNode } from "react";

import { useSocket, type Socket } from "#/hooks/use-socket";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
	const socket = useSocket();
	return <SocketContext value={socket}>{children}</SocketContext>;
};

export const useSocketContext = () => {
	const socket = use(SocketContext);
	if (!socket)
		throw new Error("useSocketContext must be used inside SocketProvider");
	return socket;
};
