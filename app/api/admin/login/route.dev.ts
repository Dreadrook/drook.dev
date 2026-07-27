import { cookies } from "next/headers";
import { setTimeout as sleep } from "node:timers/promises";
import {
  clientKey,
  devOnlyGuard,
  json,
  loadConfig,
  sameOriginGuard,
} from "@/lib/admin/guard";
import { verifyPassword } from "@/lib/admin/password";
import {
  recordFailure,
  recordSuccess,
  retryAfterSeconds,
} from "@/lib/admin/rate-limit";
import {
  SESSION_COOKIE,
  SESSION_TTL_MS,
  createSessionToken,
} from "@/lib/admin/session";

export async function POST(request: Request): Promise<Response> {
  const blocked = devOnlyGuard() ?? sameOriginGuard(request);
  if (blocked) return blocked;

  const config = loadConfig();
  if (!config) {
    return json(
      {
        error:
          "Admin is not configured. Run `npm run admin:password`, then restart the dev server.",
        code: "not_configured",
      },
      503,
    );
  }

  const key = clientKey(request);
  const lockedFor = retryAfterSeconds(key);
  if (lockedFor > 0) {
    return json(
      {
        error: `Too many failed attempts. Try again in ${Math.ceil(lockedFor / 60)} minute(s).`,
      },
      429,
    );
  }

  let username = "";
  let password = "";
  try {
    const body = (await request.json()) as {
      username?: unknown;
      password?: unknown;
    };
    username = typeof body.username === "string" ? body.username.trim() : "";
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return json({ error: "Expected a JSON body" }, 400);
  }

  const usernameMatches = username.length === 0 || username === config.username;
  const passwordMatches = await verifyPassword(password, config.passwordHash);

  if (!usernameMatches || !passwordMatches) {
    recordFailure(key);
    // Small constant delay so guessing stays slow and timing gives nothing away.
    await sleep(400);
    return json({ error: "Incorrect username or password" }, 401);
  }

  recordSuccess(key);
  const store = await cookies();
  store.set({
    name: SESSION_COOKIE,
    value: createSessionToken(config.username, config.sessionSecret),
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });

  return json({ authenticated: true, username: config.username });
}
