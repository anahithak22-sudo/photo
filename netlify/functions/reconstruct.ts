import { callClaude, type ImageInput } from "./_lib/claude";
import {
  systemPrompt,
  RECONSTRUCT_TECH_INSTRUCTION,
  RECONSTRUCT_PLAN_INSTRUCTION,
} from "./_lib/prompts";
import { ReconstructTechSchema, ReconstructPlanSchema } from "./_lib/schemas";
import { streamJson, jsonResponse } from "./_lib/http";

interface RequestBody {
  images: ImageInput[];
  // The full reconstruction takes ~36s to generate in one shot and gets cut by
  // an effective ~35s platform ceiling, so the client asks for the two halves
  // in parallel and merges them.
  part: "tech" | "plan";
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
    body.part === "plan"
      ? callClaude({
          system: systemPrompt(RECONSTRUCT_PLAN_INSTRUCTION),
          toolName: "reconstruct_plan",
          toolDescription: "Постановочная часть: реквизит, стайлинг, композиция, обработка, план съёмки",
          schema: ReconstructPlanSchema,
          images: body.images,
          maxTokens: 2200,
        })
      : callClaude({
          system: systemPrompt(RECONSTRUCT_TECH_INSTRUCTION),
          toolName: "reconstruct_tech",
          toolDescription: "Техническая часть: камера, объектив, настройки, перспектива, свет, локация",
          schema: ReconstructTechSchema,
          images: body.images,
          maxTokens: 2000,
        })
  );
};
