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

  if (!response.ok) {
    let message = "Не удалось получить ответ от модели. Попробуй ещё раз.";
    try {
      const data = (await response.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      // ignore parse errors, use default message
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
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
