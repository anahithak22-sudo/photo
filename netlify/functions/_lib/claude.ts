import Anthropic from "@anthropic-ai/sdk";
import type { z } from "zod";
import { toTool } from "./schemas";

const MODEL = "claude-sonnet-5";

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export class ClaudeRequestError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

export interface ImageInput {
  base64: string;
  mediaType: "image/jpeg" | "image/png" | "image/webp";
}

interface CallOptions<T> {
  system: string;
  toolName: string;
  toolDescription: string;
  schema: z.ZodType<T>;
  text?: string;
  images?: ImageInput[];
  maxTokens?: number;
  temperature?: number;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withBackoff<T>(fn: () => Promise<T>): Promise<T> {
  const maxAttempts = 3;
  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const status = (err as { status?: number })?.status;
      if (status === 429 || status === 529) {
        await sleep(2 ** attempt * 500);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

export async function callClaude<T>(options: CallOptions<T>): Promise<T> {
  const {
    system,
    toolName,
    toolDescription,
    schema,
    text,
    images = [],
    maxTokens = 4096,
    temperature = 0.3,
  } = options;

  const tool = toTool(toolName, toolDescription, schema);
  const anthropic = getClient();

  const content: Anthropic.MessageParam["content"] = [];
  for (const image of images) {
    content.push({
      type: "image",
      source: { type: "base64", media_type: image.mediaType, data: image.base64 },
    });
  }
  if (text) {
    content.push({ type: "text", text });
  }

  const runOnce = async (extraNote?: string) => {
    const response = await withBackoff(() =>
      anthropic.messages.create({
        model: MODEL,
        max_tokens: maxTokens,
        temperature,
        system,
        tools: [tool],
        tool_choice: { type: "tool", name: toolName },
        messages: [
          {
            role: "user",
            content: extraNote
              ? [...content, { type: "text", text: extraNote }]
              : content,
          },
        ],
      })
    );

    const toolUse = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
    );
    if (!toolUse) {
      throw new ClaudeRequestError("Модель не вернула структурированный ответ", 502);
    }
    return schema.parse(toolUse.input);
  };

  try {
    return await runOnce();
  } catch (err) {
    try {
      return await runOnce(
        `Твой предыдущий ответ не прошёл валидацию: ${String(
          (err as Error).message
        )}. Пожалуйста, верни корректный результат строго по схеме инструмента.`
      );
    } catch (retryErr) {
      throw new ClaudeRequestError(
        "Не удалось получить корректный ответ от модели. Попробуй ещё раз.",
        502
      );
    }
  }
}
