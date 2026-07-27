import {
  randomBytes,
  type ScryptOptions,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";

// promisify() picks scrypt's 3-argument overload, which drops the cost options.
function scrypt(
  password: string,
  salt: Buffer,
  keyLength: number,
  options: ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, keyLength, options, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

const KEY_LENGTH = 64;
const DEFAULT_COST = 2 ** 15;
const DEFAULT_BLOCK_SIZE = 8;
const DEFAULT_PARALLELISM = 1;

/**
 * Serialised as `scrypt:N:r:p:saltBase64Url:keyBase64Url`.
 *
 * Colons and base64url (not `$` and base64) matter: Next.js runs .env values
 * through dotenv-expand, which would treat `$32768` as a variable reference and
 * silently blank out part of the hash.
 */
export type ParsedHash = {
  cost: number;
  blockSize: number;
  parallelism: number;
  salt: Buffer;
  key: Buffer;
};

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = (await scrypt(password, salt, KEY_LENGTH, {
    N: DEFAULT_COST,
    r: DEFAULT_BLOCK_SIZE,
    p: DEFAULT_PARALLELISM,
    // scrypt with N=2^15 needs more than the default 32 MB of memory.
    maxmem: 256 * 1024 * 1024,
  }));

  return [
    "scrypt",
    DEFAULT_COST,
    DEFAULT_BLOCK_SIZE,
    DEFAULT_PARALLELISM,
    salt.toString("base64url"),
    key.toString("base64url"),
  ].join(":");
}

export function parseHash(stored: string): ParsedHash | null {
  const parts = stored.split(":");
  if (parts.length !== 6 || parts[0] !== "scrypt") return null;

  const [, cost, blockSize, parallelism, salt, key] = parts;
  const parsed = {
    cost: Number(cost),
    blockSize: Number(blockSize),
    parallelism: Number(parallelism),
    salt: Buffer.from(salt, "base64url"),
    key: Buffer.from(key, "base64url"),
  };

  const numbersValid = [parsed.cost, parsed.blockSize, parsed.parallelism].every(
    (value) => Number.isInteger(value) && value > 0,
  );
  if (!numbersValid || parsed.salt.length === 0 || parsed.key.length === 0) {
    return null;
  }

  return parsed;
}

/** Constant-time password check. Returns false for malformed stored hashes. */
export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const parsed = parseHash(stored);
  if (!parsed) return false;

  const candidate = (await scrypt(password, parsed.salt, parsed.key.length, {
    N: parsed.cost,
    r: parsed.blockSize,
    p: parsed.parallelism,
    maxmem: 256 * 1024 * 1024,
  }));

  return (
    candidate.length === parsed.key.length &&
    timingSafeEqual(candidate, parsed.key)
  );
}
