/**
 * Tiny in-memory failed-login limiter. The admin only runs on the dev server,
 * so a per-process map is the right amount of machinery — it resets when you
 * restart `npm run dev`.
 */

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000;

type Entry = {
  failures: number;
  windowStart: number;
  lockedUntil: number;
};

const attempts = new Map<string, Entry>();

function entryFor(key: string): Entry {
  const now = Date.now();
  const existing = attempts.get(key);

  if (!existing || now - existing.windowStart > WINDOW_MS) {
    const fresh: Entry = { failures: 0, windowStart: now, lockedUntil: 0 };
    attempts.set(key, fresh);
    return fresh;
  }

  return existing;
}

/** Seconds remaining in a lockout, or 0 when the caller may try again. */
export function retryAfterSeconds(key: string): number {
  const entry = attempts.get(key);
  if (!entry) return 0;
  const remaining = entry.lockedUntil - Date.now();
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

export function recordFailure(key: string): void {
  const entry = entryFor(key);
  entry.failures += 1;
  if (entry.failures >= MAX_ATTEMPTS) {
    entry.lockedUntil = Date.now() + LOCKOUT_MS;
    entry.failures = 0;
    entry.windowStart = Date.now();
  }
}

export function recordSuccess(key: string): void {
  attempts.delete(key);
}
