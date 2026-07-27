import { cookies } from "next/headers";
import { SESSION_COOKIE, readSessionToken } from "@/lib/admin/session";

export type AdminConfig = {
  username: string;
  passwordHash: string;
  sessionSecret: string;
};

export function loadConfig(): AdminConfig | null {
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!passwordHash || !sessionSecret) return null;
  // A short secret would make session forgery cheap; refuse rather than pretend.
  if (sessionSecret.length < 32) return null;

  return {
    username: process.env.ADMIN_USERNAME?.trim() || "admin",
    passwordHash,
    sessionSecret,
  };
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}

/**
 * The admin only exists on the dev server. These files aren't even compiled
 * into a production build (see `pageExtensions` in next.config.ts), but check
 * anyway so a misconfiguration can never expose a write endpoint.
 */
export function devOnlyGuard(): Response | null {
  if (process.env.NODE_ENV === "production") {
    return json({ error: "Not found" }, 404);
  }
  return null;
}

/**
 * Rejects cross-site requests. The session cookie is SameSite=Strict, so this
 * is a second layer: a mutating request must come from this same origin.
 */
export function sameOriginGuard(request: Request): Response | null {
  const origin = request.headers.get("origin");
  if (!origin) return null; // Non-browser callers (curl) send no Origin.

  const host = request.headers.get("host");
  try {
    if (new URL(origin).host !== host) {
      return json({ error: "Cross-origin request rejected" }, 403);
    }
  } catch {
    return json({ error: "Invalid origin" }, 403);
  }
  return null;
}

export async function currentUser(config: AdminConfig): Promise<string | null> {
  const store = await cookies();
  return readSessionToken(
    store.get(SESSION_COOKIE)?.value,
    config.sessionSecret,
  );
}

type AuthorizedRequest = { config: AdminConfig; username: string };

/**
 * Runs every guard a mutating admin endpoint needs. Returns either a Response
 * to send back immediately, or the authorised context.
 */
export async function authorize(
  request: Request,
  options: { mutating?: boolean } = {},
): Promise<{ response: Response } | AuthorizedRequest> {
  const devOnly = devOnlyGuard();
  if (devOnly) return { response: devOnly };

  if (options.mutating) {
    const crossOrigin = sameOriginGuard(request);
    if (crossOrigin) return { response: crossOrigin };
  }

  const config = loadConfig();
  if (!config) {
    return {
      response: json(
        {
          error:
            "Admin is not configured. Run `npm run admin:password` and restart the dev server.",
          code: "not_configured",
        },
        503,
      ),
    };
  }

  const username = await currentUser(config);
  if (!username) {
    return { response: json({ error: "Not signed in" }, 401) };
  }

  return { config, username };
}

export function isResponse(
  value: { response: Response } | AuthorizedRequest,
): value is { response: Response } {
  return "response" in value;
}

/** Best-effort client identity for rate limiting on a local dev server. */
export function clientKey(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}
