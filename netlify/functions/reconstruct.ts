import type { Handler } from "@netlify/functions";
import { callClaude, ClaudeRequestError, type ImageInput } from "./_lib/claude";
import { systemPrompt, RECONSTRUCT_INSTRUCTION } from "./_lib/prompts";
import { ReconstructSchema } from "./_lib/schemas";

interface RequestBody {
  images: ImageInput[];
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
    const result = await callClaude({
      system: systemPrompt(RECONSTRUCT_INSTRUCTION),
      toolName: "reconstruct_shot",
      toolDescription: "Реконструкция того, как был снят кадр",
      schema: ReconstructSchema,
      images: body.images,
      maxTokens: 4096,
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
