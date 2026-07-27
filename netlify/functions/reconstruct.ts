import { callClaude, type ImageInput } from "./_lib/claude";
import { systemPrompt, RECONSTRUCT_INSTRUCTION } from "./_lib/prompts";
import { ReconstructSchema } from "./_lib/schemas";
import { streamJson, jsonResponse } from "./_lib/http";

interface RequestBody {
  images: ImageInput[];
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method Not Allowed" });
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return jsonResponse(400, { error: "Некорректный запрос" });
  }

  if (!body.images || body.images.length === 0) {
    return jsonResponse(400, { error: "Нужна хотя бы одна фотография" });
  }

  return streamJson(() =>
    callClaude({
      system: systemPrompt(RECONSTRUCT_INSTRUCTION),
      toolName: "reconstruct_shot",
      toolDescription: "Реконструкция того, как был снят кадр",
      schema: ReconstructSchema,
      images: body.images,
      maxTokens: 4096,
      temperature: 0.3,
    })
  );
};
