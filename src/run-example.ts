import { InfraiClient } from "./infrai_client.ts";
import { signupAndNotify } from "./appointment_signup.ts";

const key = process.env.INFRAI_API_KEY;
if (!key) throw new Error("Set INFRAI_API_KEY before running the example.");

const result = await signupAndNotify(new InfraiClient(key), {
  email: process.env.DEMO_EMAIL ?? "patient@example.com",
  password: process.env.DEMO_PASSWORD ?? "correct-horse-battery-staple",
  name: "Demo Patient",
  appointmentId: "appointment-001",
  appointmentAt: "2027-01-15T09:30:00.000Z"
});
console.log(JSON.stringify(result, null, 2));
