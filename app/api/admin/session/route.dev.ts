import { cookies } from "next/headers";
import {
  currentUser,
  devOnlyGuard,
  json,
  loadConfig,
  sameOriginGuard,
} from "@/lib/admin/guard";
import { SESSION_COOKIE } from "@/lib/admin/session";

/** Who am I? Used by the admin page to decide what to render. */
export async function GET(): Promise<Response> {
  const blocked = devOnlyGuard();
  if (blocked) return blocked;

  const config = loadConfig();
  if (!config) {
    return json({ configured: false, authenticated: false });
  }

  const username = await currentUser(config);
  return json({
    configured: true,
    authenticated: username !== null,
    username,
  });
}

/** Sign out. */
export async function DELETE(request: Request): Promise<Response> {
  const blocked = devOnlyGuard() ?? sameOriginGuard(request);
  if (blocked) return blocked;

  const store = await cookies();
  store.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return json({ authenticated: false });
}
