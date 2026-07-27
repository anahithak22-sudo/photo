import type { Handler } from "@netlify/functions";
import { callClaude, ClaudeRequestError } from "./_lib/claude";
import { systemPrompt, CONCEPTS_INSTRUCTION } from "./_lib/prompts";
import { ConceptsSchema } from "./_lib/schemas";

interface RequestBody {
  description: string;
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

  if (!body.description || !body.description.trim()) {
    return { statusCode: 400, body: JSON.stringify({ error: "Опиши, что хочешь снять" }) };
  }

  try {
    const result = await callClaude({
      system: systemPrompt(CONCEPTS_INSTRUCTION),
      toolName: "concepts",
      toolDescription: "3-4 визуально разные концепции фотосъёмки",
      schema: ConceptsSchema,
      text: body.description,
      // 8192 measured ~31s and tripped an edge-proxy inactivity timeout (504)
      // in front of Netlify well before the model itself ran out of budget.
      // 3-4 concepts' worth of content fits comfortably in ~2-3k tokens, so
      // this ceiling was oversized for what's actually generated.
      maxTokens: 4096,
      temperature: 0.8,
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
