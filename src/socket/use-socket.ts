import { useEffect, useRef, useState } from "react";

import { handleServerMessage } from "#/features/room/handle-message.ts";
import {
	type ClientMessage,
	type ServerMessage,
	serverMessage,
} from "#/shared/protocol";

type Reply = Extract<ServerMessage, { requestId: number }>;

type Pending = {
	resolve: (reply: Reply) => void;
	reject: (error: Error) => void;
	timer: ReturnType<typeof setTimeout>;
};

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
	? Omit<T, K>
	: never;

export type RequestMessage = DistributiveOmit<
	Extract<ClientMessage, { requestId: number }>,
	"requestId"
>;

const REQUEST_TIMEOUT_MS = 5000;

export const useSocket = () => {
	const ws = useRef<WebSocket | null>(null);
	const pending = useRef(new Map<number, Pending>());
	const nextId = useRef(0);

	const [status, setStatus] = useState<"connecting" | "open" | "closed">(
		"connecting",
	);

	useEffect(() => {
		const url = `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/api/ws`;

		let socket: WebSocket | null = null;

		const rejectAll = (reason: string) => {
			for (const { reject, timer } of pending.current.values()) {
				clearTimeout(timer);
				reject(new Error(reason));
			}
			pending.current.clear();
		};

		const connect = () => {
			socket = new WebSocket(url);
			ws.current = socket;

			socket.onopen = () => setStatus("open");

			socket.onmessage = (e) => {
				try {
					const parsed = JSON.parse(e.data);
					const result = serverMessage.safeParse(parsed);

					if (result.success) {
						if ("requestId" in result.data) {
							const entry = pending.current.get(result.data.requestId);
							if (entry) {
								clearTimeout(entry.timer);
								pending.current.delete(result.data.requestId);
								entry.resolve(result.data);
							}
						}

						handleServerMessage(result.data);
					} else {
						console.warn("Invalid message:", result.error);
					}
				} catch (err) {
					console.error("Error parsing message:", err);
				}
			};

			socket.onclose = () => {
				setStatus("closed");
				rejectAll("socket closed");
			};
		};

		if (document.readyState === "complete") connect();
		else window.addEventListener("load", connect, { once: true });

		return () => {
			window.removeEventListener("load", connect);
			rejectAll("socket closed");
			if (!socket) return;
			socket.onopen = socket.onmessage = socket.onclose = null;
			socket.close();
		};
	}, []);

	const send = (message: ClientMessage) => {
		if (ws.current?.readyState === WebSocket.OPEN)
			ws.current.send(JSON.stringify(message));
	};

	const request = (message: RequestMessage) =>
		new Promise<Reply>((resolve, reject) => {
			const socket = ws.current;
			if (socket?.readyState !== WebSocket.OPEN) {
				reject(new Error("socket closed"));
				return;
			}

			const id = nextId.current++;

			const timer = setTimeout(() => {
				pending.current.delete(id);
				reject(new Error("request timed out"));
			}, REQUEST_TIMEOUT_MS);

			pending.current.set(id, { resolve, reject, timer });
			socket.send(JSON.stringify({ ...message, requestId: id }));
		});

	return { status, send, request };
};

export type Socket = ReturnType<typeof useSocket>;
