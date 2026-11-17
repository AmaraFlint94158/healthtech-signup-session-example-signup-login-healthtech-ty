import assert from "node:assert/strict";
import { chooseNotificationChannel, signupRequest } from "./appointment_signup.ts";

assert.equal(chooseNotificationChannel(true), "email");
assert.equal(chooseNotificationChannel(false), "manual-review");
assert.throws(() => signupRequest.parse({ email: "bad", password: "short", name: "A", appointmentId: "a", appointmentAt: "now" }));
console.log("signup boundary and notification decision passed");
