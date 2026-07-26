import type { Handler } from "@netlify/functions";
import { callClaude, ClaudeRequestError } from "./_lib/claude";
import { systemPrompt, SHOOTING_PLAN_INSTRUCTION } from "./_lib/prompts";
import { ShootingPlanSchema } from "./_lib/schemas";
import type { Concept } from "../../src/lib/types";

interface RequestBody {
  description: string;
  concept: Concept;
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

  if (!body.concept) {
    return { statusCode: 400, body: JSON.stringify({ error: "Не выбрана концепция" }) };
  }

  const conceptText = `Исходная идея пользователя: ${body.description}\n\nВыбранная концепция:\n${JSON.stringify(
    body.concept,
    null,
    2
  )}`;

  try {
    const result = await callClaude({
      system: systemPrompt(SHOOTING_PLAN_INSTRUCTION),
      toolName: "shooting_plan",
      toolDescription: "Конкретный план съёмки по выбранной концепции",
      schema: ShootingPlanSchema,
      text: conceptText,
      maxTokens: 4096,
      temperature: 0.4,
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
