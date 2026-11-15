// Why a request failed decides what the user can do next: wait for a connection, try a demo, or change what they sent
export type FailureKind = "offline" | "service" | "request" | "timeout";

export const OFFLINE_MESSAGE = "You’re offline. Check your connection and try again.";

export class RequestFailure extends Error {
  readonly kind: FailureKind;

  constructor(message: string, kind: FailureKind) {
    super(message);
    this.name = "RequestFailure";
    this.kind = kind;
  }
}

// The API routes answer { error } with a message written for the user; a 5xx means the AI or the server is down
export async function failureFromResponse(response: Response, fallback: string): Promise<RequestFailure> {
  const body: unknown = await response.json().catch(() => null);
  const message = body && typeof body === "object" && "error" in body && typeof body.error === "string" && body.error ? body.error : fallback;
  return new RequestFailure(message, response.status >= 500 ? "service" : "request");
}

// fetch rejects without a status: either the device is offline or the server never answered
export function networkFailure(fallback: string, online = typeof navigator === "undefined" || navigator.onLine): RequestFailure {
  return online ? new RequestFailure(fallback, "service") : new RequestFailure(OFFLINE_MESSAGE, "offline");
}

export function asRequestFailure(error: unknown, fallback: string): RequestFailure {
  return error instanceof RequestFailure ? error : new RequestFailure(fallback, "service");
}
