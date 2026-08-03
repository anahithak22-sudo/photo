import { callClaude, type ImageInput } from "./_lib/claude";
import {
  systemPrompt,
  ANALYZE_PART_A_INSTRUCTION,
  ANALYZE_PART_B_INSTRUCTION,
  ANALYZE_SERIES_INSTRUCTION,
} from "./_lib/prompts";
import {
  PhotoAnalysisPartASchema,
  PhotoAnalysisPartBSchema,
  SeriesStyleSchema,
} from "./_lib/schemas";
import { streamJson, jsonResponse } from "./_lib/http";

interface RequestBody {
  images: ImageInput[];
  // "a" and "b" are the two halves of a single photo's analysis, requested in
  // parallel by the client and merged there. A combined request measured 32.8s
  // against an effective ~35s platform ceiling, leaving no margin for larger
  // real-world uploads.
  mode: "a" | "b" | "series";
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

  return streamJson(() => {
    if (body.mode === "series") {
      return callClaude({
        system: systemPrompt(ANALYZE_SERIES_INSTRUCTION),
        toolName: "series_style",
        toolDescription: "Общий визуальный стиль серии фотографий",
        schema: SeriesStyleSchema,
        images: body.images,
        maxTokens: 1600,
      });
    }

    if (body.mode === "b") {
      return callClaude({
        system: systemPrompt(ANALYZE_PART_B_INSTRUCTION),
        toolName: "photo_analysis_b",
        toolDescription: "Качество, ретушь, формат, стиль и итог по фотографии",
        schema: PhotoAnalysisPartBSchema,
        images: [body.images[0]],
        maxTokens: 1800,
      });
    }

    return callClaude({
      system: systemPrompt(ANALYZE_PART_A_INSTRUCTION),
      toolName: "photo_analysis_a",
      toolDescription: "Композиция, цвет и свет фотографии",
      schema: PhotoAnalysisPartASchema,
      images: [body.images[0]],
      maxTokens: 1400,
    });
  });
};
