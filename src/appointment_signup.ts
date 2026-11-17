import { z } from "zod";
import { InfraiClient } from "./infrai_client.ts";

export const signupRequest = z.object({
  email: z.string().email(),
  password: z.string().min(12),
  name: z.string().min(1),
  appointmentId: z.string().min(1),
  appointmentAt: z.string().datetime()
});

export type SignupRequest = z.infer<typeof signupRequest>;

export async function signupAndNotify(client: InfraiClient, raw: unknown) {
  const input = signupRequest.parse(raw);
  const user = await client.createUser({
    email: input.email,
    password: input.password,
    name: input.name,
    metadata: { appointment_id: input.appointmentId, appointment_at: input.appointmentAt },
    vendor: "infrai",
    mode: "default_vendor",
    idempotency_key: `signup:${input.email}:${input.appointmentId}`
  });
  const session = await client.createSession({ user_id: user.user_id, method: "password", require_mfa: false });
  const email = await client.sendEmail({
    to: input.email,
    subject: "Appointment received",
    body: `Hello ${input.name}, your appointment ${input.appointmentId} is scheduled for ${input.appointmentAt}.`,
  });
  return { userId: user.user_id, sessionId: session.session_id, messageId: email.message_id };
}

export function chooseNotificationChannel(hasSession: boolean): "email" | "manual-review" {
  return hasSession ? "email" : "manual-review";
}
