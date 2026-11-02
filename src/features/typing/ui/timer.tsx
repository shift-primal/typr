import { useEffect, useState } from "react";

export const Timer = ({
	startedAt,
	finishedAt,
}: {
	startedAt: number | null;
	finishedAt: number | null;
}) => {
	const [now, setNow] = useState(0);

	useEffect(() => {
		if (startedAt === null || finishedAt !== null) return;
		let frame = 0;
		const tick = () => {
			setNow(Date.now());
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [startedAt, finishedAt]);

	const end = finishedAt ?? now;
	const elapsed =
		startedAt !== null && end >= startedAt ? (end - startedAt) / 1000 : 0;

	return <p>Time: {elapsed.toFixed(2)}</p>;
};
