import { callClaude, type ImageInput } from "./_lib/claude";
import { systemPrompt, ANALYZE_SINGLE_INSTRUCTION, ANALYZE_SERIES_INSTRUCTION } from "./_lib/prompts";
import { PhotoAnalysisSchema, SeriesStyleSchema } from "./_lib/schemas";
import { streamJson, jsonResponse } from "./_lib/http";

interface RequestBody {
  images: ImageInput[];
  mode: "single" | "series";
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
    body.mode === "series"
      ? callClaude({
          system: systemPrompt(ANALYZE_SERIES_INSTRUCTION),
          toolName: "series_style",
          toolDescription: "Общий визуальный стиль серии фотографий",
          schema: SeriesStyleSchema,
          images: body.images,
          maxTokens: 2200,
        })
      : callClaude({
          system: systemPrompt(ANALYZE_SINGLE_INSTRUCTION),
          toolName: "photo_analysis",
          toolDescription: "Разбор одной фотографии по категориям",
          schema: PhotoAnalysisSchema,
          images: [body.images[0]],
          maxTokens: 2200,
        })
  );
};
