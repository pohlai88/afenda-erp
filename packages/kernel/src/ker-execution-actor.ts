import type { UserSession } from "./ker-app-capabilities";

export type ExecutionActorType = "user" | "system" | "agent";

export type ExecutionActor = {
  actorId: string;
  actorType: ExecutionActorType;
  email: string | null;
  label: string;
  sessionSource: UserSession["source"];
};

export function resolveExecutionActor(input: {
  session: Pick<UserSession, "id" | "name" | "email" | "source">;
  actorType?: ExecutionActorType;
}): ExecutionActor {
  return {
    actorId: input.session.id,
    actorType: input.actorType ?? "user",
    email: input.session.email,
    label: input.session.name,
    sessionSource: input.session.source,
  };
}
