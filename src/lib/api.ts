import type {
  PhotoAnalysis,
  SeriesStyle,
  ReconstructResult,
  Concept,
  PlanResult,
} from "./types";

export interface ApiImage {
  data: string;
  mediaType: "image/jpeg" | "image/png" | "image/webp";
}

async function post<T>(path: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Соединение потеряно. Результат не сохранён — попробуй ещё раз.");
  }

  // The AI endpoints stream keep-alive whitespace while the model works (to
  // survive a ~30s edge-proxy inactivity timeout), so they always resolve as
  // HTTP 200 and signal failure with an `error` field in the body instead.
  // Fast-fail validation (bad method / missing input) still uses a real status.
  let data: { error?: string } & Partial<T>;
  try {
    data = JSON.parse(await response.text());
  } catch {
    throw new Error("Не удалось получить ответ от модели. Попробуй ещё раз.");
  }

  if (!response.ok || data.error) {
    throw new Error(data.error || "Не удалось получить ответ от модели. Попробуй ещё раз.");
  }

  return data as T;
}

export function analyzeSinglePhoto(image: ApiImage): Promise<PhotoAnalysis> {
  return post("/api/analyze", { images: [image], mode: "single" });
}

export function analyzeSeriesStyle(images: ApiImage[]): Promise<SeriesStyle> {
  return post("/api/analyze", { images, mode: "series" });
}

export function reconstructPhotos(images: ApiImage[]): Promise<ReconstructResult> {
  return post("/api/reconstruct", { images });
}

export function generateConcepts(description: string): Promise<{ concepts: Concept[] }> {
  return post("/api/concepts", { description });
}

export function generateShootingPlan(
  description: string,
  concept: Concept
): Promise<PlanResult> {
  return post("/api/shooting-plan", { description, concept });
}
