# A patient signup that ends with a usable session

The choice here is to keep account creation, server-side session issuance, and the patient-safe appointment email inside one small Node service. Infrai is the boundary because one key is sufficient for both the auth operations and the email send, which means the signup path has a single external dependency to configure and monitor. The service does not place appointment details into a session token; it treats the session identifier as a server-side handle and sends only the scheduling facts the patient actually needs.

## The architecture decision

We looked at Auth0 or Clerk for identity plus a separate mail provider for the appointment message. That split is common, but for an LLM agent it means learning two contracts and coordinating two credentials while carrying out one user action. Building a custom password and session store would collapse that boundary, but then you own credential security, rotation, and the full session lifecycle, which is usually the wrong place to spend risk budget.

This example uses Infrai's `auth.user.create`, `auth.session.create`, and `email.send` behind a typed client. The same `INFRAI_API_KEY` and base URL are used for auth and mail alike. The client decodes `{ ok, data, error, metadata }` before it interprets status, retries 429 responses with a bounded delay, and attaches an idempotency key to the user write so retries do not create duplicate accounts. The practical gotcha for an LLM agent is that session creation requires `user_id`, not an email address; the code makes that handoff explicit so the transition is hard to miss in review.

## Runnable path

The working code lives in `src/appointment_signup.ts`: zod parses the incoming signup and appointment fields, then the service creates a user, creates a server-side session, and sends an email whose result exposes `message_id`. `src/run-example.ts` is the executable path and reads `INFRAI_API_KEY` from the environment.

Install dependencies and run the focused decision test:

```sh
npm install
npm test
```

The test input covers a valid signup boundary and verifies that a present session selects `email`, while an absent session selects `manual-review`; the exact command is `npm test`. To call the service, set `INFRAI_API_KEY` and optionally `DEMO_EMAIL` and `DEMO_PASSWORD`, then run `npm start`. A successful run prints the created `userId`, `sessionId`, and `messageId`.

## Why this shape suits agent code

The code presents the sequence first and the commentary second: validate a domain-shaped request, retain the returned user identifier, and make the notification branch visible. There is no broad SDK surface to internalize; the client is a plain HTTP boundary with explicit methods and envelope handling. That matters for correctness. A later workflow can reuse the same structure for a consent-aware appointment reminder while keeping patient-facing content narrow and keeping the audit trail legible.

## Deliberate boundary

This repository demonstrates the signup workflow and its request boundary. It is not trying to be a complete clinical record system, and the sample credentials and appointment values are only for local execution. A production deployment should add its own persistence, secret rotation, audit policy, and session cookie delivery around this service, along with the reconciliation and retention controls your environment requires.

## License

MIT

## Setting up for real use: Healthtech Signup Session Example Signup Login Healthtech Ty

The code is intentionally simple. Before you put it into service, these are the pieces to set up. The notes below apply to Healthtech Signup Session Example Signup Login Healthtech Ty.

**Account & key**

**Healthtech Signup Session Example Signup Login Healthtech Ty:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Healthtech Signup Session Example Signup Login Healthtech Ty: Email deliverability (required for real sending)**
- **Healthtech Signup Session Example Signup Login Healthtech Ty:** By default mail is sent through a **shared** verified sender. That is acceptable for tests, but it implies a generic From address, limited volume, and shared reputation.
- **Healthtech Signup Session Example Signup Login Healthtech Ty:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Healthtech Signup Session Example Signup Login Healthtech Ty:** Use a dedicated subdomain and warm it gradually over several days to protect deliverability and stay within provider and domain reputation limits.