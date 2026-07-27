import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { nanoid } from "nanoid";
import { Textarea } from "@/components/ui/Input";
import Chip from "@/components/ui/Chip";
import Button from "@/components/ui/Button";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { generateConcepts } from "@/lib/api";
import { saveProject } from "@/lib/storage";
import type { IdeaResult, Project } from "@/lib/types";

const EXAMPLES = [
  "Серебряные украшения в тёмной атмосфере, немного мистически, но не готично",
  "Портрет в квартире у окна, естественный свет, спокойное настроение",
  "Предметная съёмка косметики, чистый минимализм, светлый фон",
];

const IDEA_MESSAGES = [
  "Придумываем визуальные подходы…",
  "Собираем референсы в голове…",
  "Подбираем свет и локации…",
  "Раскладываем идеи по полочкам…",
];

export default function Idea() {
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function start() {
    setStatus("loading");
    setError(null);
    try {
      const { concepts } = await generateConcepts(description);
      const result: IdeaResult = { description, concepts };

      const projectId = nanoid();
      const words = description.trim().split(/\s+/).slice(0, 5).join(" ");

      const project: Project = {
        id: projectId,
        type: "idea",
        title: words || "Идея",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        imageIds: [],
        inputText: description,
        result,
      };
      saveProject(project);
      navigate(`/result/${projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Что-то пошло не так");
      setStatus("error");
    }
  }

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-[--container-max] px-6 py-16">
        <LoadingState messages={IDEA_MESSAGES} />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto max-w-[--container-max] px-6 py-16">
        <ErrorState message={error ?? ""} onRetry={start} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-heading text-3xl font-display text-ink">У меня есть идея</h1>
      <p className="mt-3 font-sans text-stone">
        Опиши, что ты хочешь снять — предложим несколько разных визуальных концепций.
      </p>

      <div className="mt-8">
        <Textarea
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Расскажи, что ты хочешь снять..."
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <Chip key={example} onClick={() => setDescription(example)}>
            {example}
          </Chip>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Button disabled={!description.trim()} onClick={start}>
          Generate ideas
        </Button>
      </div>
    </div>
  );
}
