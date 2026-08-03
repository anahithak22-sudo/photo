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

// Both the photo analysis and the reconstruction are requested as two halves
// in parallel and merged here. Generating either one in a single call ran right
// at (or past) the ~35s ceiling imposed by the proxy in front of Netlify; each
// half completes in roughly half that, leaving real margin.
export async function analyzeSinglePhoto(image: ApiImage): Promise<PhotoAnalysis> {
  const [a, b] = await Promise.all([
    post<Pick<PhotoAnalysis, "composition" | "color" | "light">>("/api/analyze", {
      images: [image],
      mode: "a",
    }),
    post<Omit<PhotoAnalysis, "composition" | "color" | "light">>("/api/analyze", {
      images: [image],
      mode: "b",
    }),
  ]);
  return { ...a, ...b };
}

export function analyzeSeriesStyle(images: ApiImage[]): Promise<SeriesStyle> {
  return post("/api/analyze", { images, mode: "series" });
}

type ReconstructTech = Pick<
  ReconstructResult,
  "camera" | "lens" | "settings" | "perspective" | "lighting" | "location"
>;
type ReconstructPlan = Omit<ReconstructResult, keyof ReconstructTech>;

export async function reconstructPhotos(images: ApiImage[]): Promise<ReconstructResult> {
  const [tech, plan] = await Promise.all([
    post<ReconstructTech>("/api/reconstruct", { images, part: "tech" }),
    post<ReconstructPlan>("/api/reconstruct", { images, part: "plan" }),
  ]);
  return { ...tech, ...plan };
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
