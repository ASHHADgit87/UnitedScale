import type { SessionEndReason, SessionPolicy } from "@/lib/session-policy";

export interface SessionState {
  sid: string;

  start: number;

  last: number;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const getSessionSecret = (): string | null =>
  process.env.SESSION_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? null;

const toBase64Url = (bytes: Uint8Array) => {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

const fromBase64Url = (value: string) => {
  const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

const importKey = (secret: string, usages: KeyUsage[]) =>
  crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usages,
  );

export async function encodeSessionState(
  state: SessionState,
  secret: string,
): Promise<string> {
  const body = toBase64Url(encoder.encode(JSON.stringify(state)));
  const key = await importKey(secret, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  return `${body}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function decodeSessionState(
  value: string | undefined,
  secret: string,
): Promise<SessionState | null> {
  if (!value) return null;

  const [body, signature, extra] = value.split(".");
  if (!body || !signature || extra !== undefined) return null;

  try {
    const key = await importKey(secret, ["verify"]);

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(signature),
      encoder.encode(body),
    );
    if (!valid) return null;

    const parsed: unknown = JSON.parse(decoder.decode(fromBase64Url(body)));
    if (typeof parsed !== "object" || parsed === null) return null;

    const { sid, start, last } = parsed as Record<string, unknown>;
    if (
      typeof sid !== "string" ||
      typeof start !== "number" ||
      typeof last !== "number"
    ) {
      return null;
    }
    return { sid, start, last };
  } catch {
    return null;
  }
}

export function readSessionId(accessToken?: string | null): string | null {
  try {
    const part = accessToken?.split(".")[1];
    if (!part) return null;
    const claims = JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof claims?.session_id === "string" ? claims.session_id : null;
  } catch {
    return null;
  }
}

export function evaluateSession(
  state: SessionState,
  policy: SessionPolicy,
  now: number,
): SessionEndReason | null {
  if (now - state.last >= policy.idleMs) return "idle";
  if (now - state.start >= policy.maxMs) return "max";
  return null;
}

export const sessionCookieOptions = (maxMs: number) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: Math.ceil(maxMs / 1000),
});
