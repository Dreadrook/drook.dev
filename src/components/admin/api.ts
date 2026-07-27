"use client";

import type { SiteContent } from "@/lib/content";

/**
 * Thin client for the dev-only admin API. Every call is same-origin so the
 * SameSite=Strict session cookie rides along.
 */

export class AdminApiError extends Error {
  constructor(
    message: string,
    readonly issues: string[] = [],
    readonly status = 0,
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: "same-origin",
    cache: "no-store",
    ...init,
  });

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    // Fall through to the status-based message below.
  }

  const payload = (body ?? {}) as { error?: string; issues?: string[] };

  if (!response.ok) {
    throw new AdminApiError(
      payload.error ?? `Request failed (${response.status})`,
      payload.issues ?? [],
      response.status,
    );
  }

  return payload as T;
}

export type SessionState = {
  configured: boolean;
  authenticated: boolean;
  username?: string | null;
};

export function getSession(): Promise<SessionState> {
  return request<SessionState>("/api/admin/session/");
}

export function login(username: string, password: string): Promise<SessionState> {
  return request<SessionState>("/api/admin/login/", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
}

export function logout(): Promise<void> {
  return request<void>("/api/admin/session/", { method: "DELETE" });
}

export function getContent(): Promise<{ content: SiteContent }> {
  return request<{ content: SiteContent }>("/api/admin/content/");
}

export function saveContent(
  content: SiteContent,
): Promise<{ saved: boolean; content: SiteContent }> {
  return request("/api/admin/content/", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ content }),
  });
}

export function uploadFile(
  kind: "resume" | "image",
  file: File,
): Promise<{ url: string; bytes: number }> {
  const form = new FormData();
  form.set("kind", kind);
  form.set("file", file);
  return request("/api/admin/upload/", { method: "POST", body: form });
}
