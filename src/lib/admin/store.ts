import { randomBytes } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { SiteContent } from "@/lib/content";
import { ValidationError, validateSiteContent } from "@/lib/admin/validate";

const ROOT = process.cwd();
const CONTENT_FILE = path.join(ROOT, "src", "content", "site.json");
const PUBLIC_DIR = path.join(ROOT, "public");
const UPLOADS_DIR = path.join(PUBLIC_DIR, "uploads");

const MAX_PDF_BYTES = 15 * 1024 * 1024;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/** Reads and validates the live content file. */
export async function readContent(): Promise<SiteContent> {
  const raw = await readFile(CONTENT_FILE, "utf8");
  return validateSiteContent(JSON.parse(raw));
}

/**
 * Validates then writes the content file. The write goes to a temp file and is
 * renamed into place so an interrupted save can't leave `site.json` truncated.
 */
export async function writeContent(value: unknown): Promise<SiteContent> {
  const content = validateSiteContent(value);
  const serialized = `${JSON.stringify(content, null, 2)}\n`;
  const tempFile = `${CONTENT_FILE}.${randomBytes(6).toString("hex")}.tmp`;

  await writeFile(tempFile, serialized, "utf8");
  await rename(tempFile, CONTENT_FILE);

  return content;
}

export type UploadKind = "resume" | "image";

const IMAGE_TYPES: Record<string, { ext: string; magic: (b: Buffer) => boolean }> = {
  "image/png": {
    ext: "png",
    magic: (b) => b.subarray(0, 4).toString("hex") === "89504e47",
  },
  "image/jpeg": {
    ext: "jpg",
    magic: (b) => b.subarray(0, 3).toString("hex") === "ffd8ff",
  },
  "image/gif": {
    ext: "gif",
    magic: (b) => b.subarray(0, 4).toString("ascii") === "GIF8",
  },
  "image/webp": {
    ext: "webp",
    magic: (b) =>
      b.subarray(0, 4).toString("ascii") === "RIFF" &&
      b.subarray(8, 12).toString("ascii") === "WEBP",
  },
};

function slugifyFilename(name: string): string {
  const base = path.basename(name).replace(/\.[^.]+$/, "");
  const slug = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug.length > 0 ? slug : "upload";
}

/**
 * Stores an uploaded file under `public/` and returns the URL path to it.
 *
 * File type is decided by the declared MIME type *and* the file's magic bytes,
 * and the on-disk name is always generated here — never taken from the client.
 */
export async function saveUpload(
  file: File,
  kind: UploadKind,
): Promise<{ url: string; bytes: number }> {
  const bytes = Buffer.from(await file.arrayBuffer());

  if (kind === "resume") {
    if (bytes.length > MAX_PDF_BYTES) {
      throw new ValidationError(["file: PDF must be 15 MB or smaller"]);
    }
    if (bytes.subarray(0, 5).toString("ascii") !== "%PDF-") {
      throw new ValidationError(["file: that does not look like a PDF"]);
    }
    // Fixed name so the public URL and any existing links stay stable.
    await writeFile(path.join(PUBLIC_DIR, "Resume.pdf"), bytes);
    return { url: "/Resume.pdf", bytes: bytes.length };
  }

  const spec = IMAGE_TYPES[file.type];
  if (!spec) {
    throw new ValidationError([
      "file: images must be PNG, JPEG, GIF or WebP (SVG is not accepted)",
    ]);
  }
  if (bytes.length > MAX_IMAGE_BYTES) {
    throw new ValidationError(["file: image must be 8 MB or smaller"]);
  }
  if (!spec.magic(bytes)) {
    throw new ValidationError([
      `file: contents do not match the declared type (${file.type})`,
    ]);
  }

  await mkdir(UPLOADS_DIR, { recursive: true });
  const name = `${slugifyFilename(file.name)}-${randomBytes(4).toString("hex")}.${spec.ext}`;
  await writeFile(path.join(UPLOADS_DIR, name), bytes);

  return { url: `/uploads/${name}`, bytes: bytes.length };
}
