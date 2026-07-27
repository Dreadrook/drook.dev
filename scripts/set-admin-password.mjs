#!/usr/bin/env node
/**
 * Sets up credentials for the dev-only admin panel.
 *
 *   npm run admin:password              # prompt, then write .env.local
 *   npm run admin:password -- --print   # print the lines instead of writing
 *   npm run admin:password -- --username sam --rotate-secret
 *
 * The hash format must stay in sync with src/lib/admin/password.ts:
 *   scrypt:N:r:p:saltBase64Url:keyBase64Url
 *
 * Colons and base64url are deliberate — Next.js expands `$name` inside .env
 * values, which would corrupt a `$`-separated hash.
 */
import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

const COST = 2 ** 15;
const BLOCK_SIZE = 8;
const PARALLELISM = 1;
const KEY_LENGTH = 64;
const MIN_PASSWORD_LENGTH = 12;

const ENV_FILE = path.join(process.cwd(), ".env.local");

function parseArgs(argv) {
  const options = { print: false, rotateSecret: false, username: "" };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--print") options.print = true;
    else if (arg === "--rotate-secret") options.rotateSecret = true;
    else if (arg === "--username") options.username = argv[++i] ?? "";
    else if (arg.startsWith("--username=")) options.username = arg.split("=")[1];
    else {
      console.error(`Unknown argument: ${arg}`);
      process.exit(1);
    }
  }
  return options;
}

function promptHidden(question) {
  process.stdout.write(question);

  return new Promise((resolve) => {
    const stdin = process.stdin;

    if (!stdin.isTTY) {
      let data = "";
      stdin.setEncoding("utf8");
      stdin.on("data", (chunk) => {
        data += chunk;
      });
      stdin.on("end", () => resolve(data.split("\n")[0] ?? ""));
      return;
    }

    let value = "";
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    const onData = (char) => {
      if (char === "\r" || char === "\n" || char === "\u0004") {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener("data", onData);
        process.stdout.write("\n");
        resolve(value);
        return;
      }
      if (char === "\u0003") {
        stdin.setRawMode(false);
        process.stdout.write("\n");
        process.exit(130);
      }
      if (char === "\u007f" || char === "\b") {
        value = value.slice(0, -1);
        return;
      }
      value += char;
    };

    stdin.on("data", onData);
  });
}

async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, KEY_LENGTH, {
    N: COST,
    r: BLOCK_SIZE,
    p: PARALLELISM,
    maxmem: 256 * 1024 * 1024,
  });
  return [
    "scrypt",
    COST,
    BLOCK_SIZE,
    PARALLELISM,
    salt.toString("base64url"),
    key.toString("base64url"),
  ].join(":");
}

function readEnvFile() {
  if (!existsSync(ENV_FILE)) return "";
  return readFileSync(ENV_FILE, "utf8");
}

function existingValue(contents, key) {
  const match = contents.match(new RegExp(`^${key}=(.*)$`, "m"));
  return match ? match[1] : "";
}

function upsert(contents, key, value) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  if (pattern.test(contents)) return contents.replace(pattern, line);
  const prefix = contents.length === 0 || contents.endsWith("\n") ? "" : "\n";
  return `${contents}${prefix}${line}\n`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  const password = await promptHidden("New admin password: ");
  if (password.length < MIN_PASSWORD_LENGTH) {
    console.error(
      `\nPassword must be at least ${MIN_PASSWORD_LENGTH} characters. Nothing was changed.`,
    );
    process.exit(1);
  }

  if (process.stdin.isTTY) {
    const confirmation = await promptHidden("Confirm password: ");
    if (confirmation !== password) {
      console.error("\nPasswords did not match. Nothing was changed.");
      process.exit(1);
    }
  }

  const hash = await hashPassword(password);
  const current = readEnvFile();
  const keepSecret = !options.rotateSecret && existingValue(current, "ADMIN_SESSION_SECRET");
  const secret = keepSecret || randomBytes(48).toString("base64url");
  const username =
    options.username.trim() || existingValue(current, "ADMIN_USERNAME") || "admin";

  const lines = [
    `ADMIN_USERNAME=${username}`,
    `ADMIN_PASSWORD_HASH=${hash}`,
    `ADMIN_SESSION_SECRET=${secret}`,
  ];

  if (options.print) {
    console.log(`\nAdd these to .env.local:\n\n${lines.join("\n")}\n`);
    return;
  }

  let next = current;
  next = upsert(next, "ADMIN_USERNAME", username);
  next = upsert(next, "ADMIN_PASSWORD_HASH", hash);
  next = upsert(next, "ADMIN_SESSION_SECRET", secret);
  writeFileSync(ENV_FILE, next, { mode: 0o600 });

  console.log(`\nWrote credentials to .env.local (username: ${username}).`);
  if (keepSecret) {
    console.log("Kept the existing session secret — pass --rotate-secret to replace it.");
  }
  console.log("Restart `npm run dev`, then open http://localhost:3000/admin");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
