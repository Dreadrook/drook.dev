import { authorize, isResponse, json } from "@/lib/admin/guard";
import { readContent, writeContent } from "@/lib/admin/store";
import { ValidationError } from "@/lib/admin/validate";

export async function GET(request: Request): Promise<Response> {
  const auth = await authorize(request);
  if (isResponse(auth)) return auth.response;

  try {
    return json({ content: await readContent() });
  } catch (error) {
    if (error instanceof ValidationError) {
      return json(
        {
          error: "src/content/site.json is currently invalid",
          issues: error.issues,
        },
        422,
      );
    }
    return json({ error: describe(error) }, 500);
  }
}

export async function PUT(request: Request): Promise<Response> {
  const auth = await authorize(request, { mutating: true });
  if (isResponse(auth)) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Expected a JSON body" }, 400);
  }

  const payload = body as { content?: unknown };
  if (!payload || typeof payload !== "object" || !("content" in payload)) {
    return json({ error: "Expected { content: ... }" }, 400);
  }

  try {
    const content = await writeContent(payload.content);
    return json({ saved: true, content });
  } catch (error) {
    if (error instanceof ValidationError) {
      return json({ error: "Some fields need fixing", issues: error.issues }, 422);
    }
    return json({ error: describe(error) }, 500);
  }
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : "Unexpected error";
}
