/**
 * Shared layout constants.
 *
 * These must NOT live in a `"use client"` module. Next replaces the exports of
 * a client module with client-reference stubs when a server component imports
 * them, so interpolating one into a style string emits the stub's error text
 * into the CSS instead of the value.
 */

/** Height of the fixed navbar. Pages that aren't the hero offset by this. */
export const NAV_HEIGHT = "64px";
