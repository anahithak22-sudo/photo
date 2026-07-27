import type { Handler } from "@netlify/functions";
import { callClaude, ClaudeRequestError, type ImageInput } from "./_lib/claude";
import { systemPrompt, ANALYZE_SINGLE_INSTRUCTION, ANALYZE_SERIES_INSTRUCTION } from "./_lib/prompts";
import { PhotoAnalysisSchema, SeriesStyleSchema } from "./_lib/schemas";

interface RequestBody {
  images: ImageInput[];
  mode: "single" | "series";
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let body: RequestBody;
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Некорректный запрос" }) };
  }

  if (!body.images || body.images.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: "Нужна хотя бы одна фотография" }) };
  }

  try {
    if (body.mode === "series") {
      const result = await callClaude({
        system: systemPrompt(ANALYZE_SERIES_INSTRUCTION),
        toolName: "series_style",
        toolDescription: "Общий визуальный стиль серии фотографий",
        schema: SeriesStyleSchema,
        images: body.images,
        maxTokens: 2200,
        temperature: 0.3,
      });
      return { statusCode: 200, body: JSON.stringify(result) };
    }

    const result = await callClaude({
      system: systemPrompt(ANALYZE_SINGLE_INSTRUCTION),
      toolName: "photo_analysis",
      toolDescription: "Разбор одной фотографии по категориям",
      schema: PhotoAnalysisSchema,
      images: [body.images[0]],
      maxTokens: 2200,
      temperature: 0.3,
    });
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (err) {
    if (err instanceof ClaudeRequestError) {
      return { statusCode: err.status, body: JSON.stringify({ error: err.message }) };
    }
    return {
      statusCode: 502,
      body: JSON.stringify({ error: "Не удалось получить ответ от модели. Попробуй ещё раз." }),
    };
  }
};
