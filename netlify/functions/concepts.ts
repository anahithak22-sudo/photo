import { callClaude } from "./_lib/claude";
import { systemPrompt, CONCEPTS_INSTRUCTION } from "./_lib/prompts";
import { ConceptsSchema } from "./_lib/schemas";
import { streamJson, jsonResponse } from "./_lib/http";

interface RequestBody {
  description: string;
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

  if (!body.description || !body.description.trim()) {
    return jsonResponse(400, { error: "Опиши, что хочешь снять" });
  }

  return streamJson(() =>
    callClaude({
      system: systemPrompt(CONCEPTS_INSTRUCTION),
      toolName: "concepts",
      toolDescription: "2 визуально разные концепции фотосъёмки",
      schema: ConceptsSchema,
      text: body.description,
      maxTokens: 2400,
    })
  );
};
