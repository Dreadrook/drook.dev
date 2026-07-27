import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "drook_admin_session";
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

type SessionPayload = {
  /** Username the session was issued to. */
  u: string;
  /** Expiry, epoch ms. */
  e: number;
  /** Random nonce so two sessions are never byte-identical. */
  n: string;
};

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createSessionToken(username: string, secret: string): string {
  const payload: SessionPayload = {
    u: username,
    e: Date.now() + SESSION_TTL_MS,
    n: randomBytes(8).toString("base64url"),
  };
  const encoded = base64url(JSON.stringify(payload));
  return `${encoded}.${sign(encoded, secret)}`;
}

/** Returns the username for a valid, unexpired token, otherwise null. */
export function readSessionToken(
  token: string | undefined,
  secret: string,
): string | null {
  if (!token) return null;

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = sign(encoded, secret);
  const given = Buffer.from(signature);
  const want = Buffer.from(expected);
  if (given.length !== want.length || !timingSafeEqual(given, want)) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as SessionPayload;

    if (typeof payload.u !== "string" || typeof payload.e !== "number") {
      return null;
    }
    if (payload.e < Date.now()) return null;

    return payload.u;
  } catch {
    return null;
  }
}
