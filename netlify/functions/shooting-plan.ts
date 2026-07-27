import { callClaude } from "./_lib/claude";
import { systemPrompt, SHOOTING_PLAN_INSTRUCTION } from "./_lib/prompts";
import { ShootingPlanSchema } from "./_lib/schemas";
import { streamJson, jsonResponse } from "./_lib/http";
import type { Concept } from "../../src/lib/types";

interface RequestBody {
  description: string;
  concept: Concept;
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

  if (!body.concept) {
    return jsonResponse(400, { error: "Не выбрана концепция" });
  }

  const conceptText = `Исходная идея пользователя: ${body.description}\n\nВыбранная концепция:\n${JSON.stringify(
    body.concept,
    null,
    2
  )}`;

  return streamJson(() =>
    callClaude({
      system: systemPrompt(SHOOTING_PLAN_INSTRUCTION),
      toolName: "shooting_plan",
      toolDescription: "Конкретный план съёмки по выбранной концепции",
      schema: ShootingPlanSchema,
      text: conceptText,
      maxTokens: 4096,
      temperature: 0.4,
    })
  );
};
