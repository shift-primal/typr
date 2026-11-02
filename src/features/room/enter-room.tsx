import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSet,
} from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { createRoom, joinRoom } from "#/features/room/room-api";
import { useSocketContext } from "#/socket/socket-provider";

const nameSchema = z
	.string()
	.min(2, "Minimum 2 characters")
	.max(16, "Max 16 characters");
const roomIdSchema = z
	.string()
	.length(4, 'Invalid Room ID. Valid Format: "A1B2"');

export const EnterRoom = () => {
	const socket = useSocketContext();
	const navigate = useNavigate();

	const enter = async (roomId: Promise<string | undefined>) => {
		const id = await roomId;
		if (id) await navigate({ to: "/room/$roomId", params: { roomId: id } });
	};

	const form = useForm({
		defaultValues: {
			roomId: "",
			name: "",
		},
		onSubmit: ({ value }) => enter(joinRoom(socket, value.roomId, value.name)),
	});

	const create = async () => {
		await form.validateField("name", "change");
		form.setFieldMeta("name", (meta) => ({ ...meta, isTouched: true }));
		if (!form.getFieldMeta("name")?.isValid) return;
		await enter(createRoom(socket, form.getFieldValue("name")));
	};

	return (
		<Card className="w-full sm:max-w-md">
			<CardHeader>
				<CardTitle>Join a room</CardTitle>
				<CardDescription>
					To start, join a room with an ID, or create one
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					id="join-or-create-room"
					onSubmit={(e) => {
						e.preventDefault();
						void form.handleSubmit();
					}}
				>
					<FieldSet>
						<FieldGroup>
							<form.Field name="name" validators={{ onChange: nameSchema }}>
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Name</FieldLabel>
											<Input
												type="text"
												id={field.name}
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
												placeholder="Kasper"
												autoComplete="off"
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
											<FieldDescription>
												Your display name (will be shown to others)
											</FieldDescription>
										</Field>
									);
								}}
							</form.Field>
						</FieldGroup>
						<FieldGroup>
							<form.Field name="roomId" validators={{ onSubmit: roomIdSchema }}>
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Room ID</FieldLabel>
											<Input
												type="text"
												id={field.name}
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
												placeholder="A1B2"
												autoComplete="off"
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
											<FieldDescription>
												Only needed to join an existing room
											</FieldDescription>
										</Field>
									);
								}}
							</form.Field>
						</FieldGroup>
					</FieldSet>
				</form>
			</CardContent>
			<CardFooter>
				<Field orientation="horizontal">
					<Button type="button" variant="outline" onClick={() => form.reset()}>
						Reset
					</Button>
					<Button type="submit" form="join-or-create-room" variant="outline">
						Join
					</Button>
					<Button type="button" variant="default" onClick={create}>
						Create
					</Button>
				</Field>
			</CardFooter>
		</Card>
	);
};
