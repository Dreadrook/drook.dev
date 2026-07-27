import { authorize, isResponse, json } from "@/lib/admin/guard";
import { type UploadKind, saveUpload } from "@/lib/admin/store";
import { ValidationError } from "@/lib/admin/validate";

const KINDS = new Set<UploadKind>(["resume", "image"]);
/** Above any allowed file plus form overhead — refuse before buffering it. */
const MAX_REQUEST_BYTES = 20 * 1024 * 1024;

export async function POST(request: Request): Promise<Response> {
  const auth = await authorize(request, { mutating: true });
  if (isResponse(auth)) return auth.response;

  const declaredSize = Number(request.headers.get("content-length") ?? 0);
  if (declaredSize > MAX_REQUEST_BYTES) {
    return json({ error: "That file is too large" }, 413);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "Expected a multipart form upload" }, 400);
  }

  const kind = String(form.get("kind") ?? "") as UploadKind;
  if (!KINDS.has(kind)) {
    return json({ error: 'kind must be "resume" or "image"' }, 400);
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return json({ error: "No file was uploaded" }, 400);
  }

  try {
    const { url, bytes } = await saveUpload(file, kind);
    return json({ url, bytes });
  } catch (error) {
    if (error instanceof ValidationError) {
      return json({ error: error.issues.join(" | "), issues: error.issues }, 422);
    }
    return json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      500,
    );
  }
}
