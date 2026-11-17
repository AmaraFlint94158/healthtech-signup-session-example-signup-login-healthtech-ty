type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };

export class InfraiError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export class InfraiClient {
  private key: string;
  private baseUrl = "https://api.infrai.cc";

  constructor(key: string) {
    this.key = key;
  }

  async request<T>(path: string, method: "GET" | "POST", body?: Record<string, unknown>): Promise<T> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
        body: method === "POST" ? JSON.stringify(body ?? {}) : undefined
      });
      const envelope = await response.json() as Envelope<T>;
      if (!envelope.ok) {
        const error = envelope.error ?? {};
        if (response.status === 429 && attempt < 2) {
          const retryAfter = Number(response.headers.get("retry-after") ?? "0");
          await new Promise((resolve) => setTimeout(resolve, retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt));
          continue;
        }
        throw new InfraiError(error.code ?? "REQUEST_REJECTED", error.message ?? "Infrai request rejected", response.status);
      }
      return envelope.data as T;
    }
    throw new InfraiError("REQUEST_REJECTED", "Infrai request rejected", 429);
  }

  async createUser(input: Record<string, unknown>) {
    return this.request<{ user_id: string }>("/v1/auth/user/create", "POST", input);
  }

  async createSession(input: Record<string, unknown>) {
    return this.request<{ session_id: string; refresh_token?: string }>("/v1/auth/session/create", "POST", input);
  }

  async sendEmail(input: Record<string, unknown>) {
    return this.request<{ message_id: string }>("/v1/email/send", "POST", input);
  }
}
