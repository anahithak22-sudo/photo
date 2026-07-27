import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { nanoid } from "nanoid";
import type { Concept, IdeaResult, PlanResult, Project } from "@/lib/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { generateShootingPlan } from "@/lib/api";
import { saveProject } from "@/lib/storage";

interface IdeaResultViewProps {
  project: Project;
  result: IdeaResult;
}

function SearchPromptRow({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);
  const encoded = encodeURIComponent(prompt);

  return (
    <li className="flex flex-wrap items-center gap-2">
      <span className="font-sans text-sm text-stone">{prompt}</span>
      <button
        onClick={() => {
          navigator.clipboard.writeText(prompt);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="rounded-full border border-hairline px-2 py-0.5 text-xs text-stone hover:text-ink"
      >
        {copied ? "Скопировано" : "Копировать"}
      </button>
      <a
        href={`https://www.pinterest.com/search/pins/?q=${encoded}`}
        target="_blank"
        rel="noreferrer"
        className="text-xs text-pebble underline hover:text-ink"
      >
        Pinterest
      </a>
      <a
        href={`https://www.google.com/search?tbm=isch&q=${encoded}`}
        target="_blank"
        rel="noreferrer"
        className="text-xs text-pebble underline hover:text-ink"
      >
        Google Images
      </a>
    </li>
  );
}

function ConceptCard({ concept, project }: { concept: Concept; project: Project }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function createPlan() {
    setLoading(true);
    setError(null);
    try {
      const description = (project.result as IdeaResult).description;
      const plan: PlanResult = await generateShootingPlan(description, concept);
      const planId = nanoid();
      const planProject: Project = {
        id: planId,
        type: "plan",
        title: `План — ${concept.title}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        imageIds: [],
        result: plan,
        parentId: project.id,
      };
      saveProject(planProject);
      navigate(`/result/${planId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Что-то пошло не так");
      setLoading(false);
    }
  }

  return (
    <Card className="flex flex-col gap-4 p-8">
      <h3 className="font-heading text-2xl font-display text-ink">{concept.title}</h3>
      <p className="font-sans text-stone">{concept.mood}</p>

      <div className="flex gap-2">
        {concept.colorPalette.map((c) => (
          <div key={c.hex} className="flex flex-col items-center gap-1">
            <div className="h-10 w-10 rounded-tile" style={{ backgroundColor: c.hex }} />
            <span className="font-sans text-xs text-pebble">{c.name}</span>
          </div>
        ))}
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <p className="font-sans font-label text-pebble">Локация</p>
          <p className="text-stone">{concept.location}</p>
        </div>
        <div>
          <p className="font-sans font-label text-pebble">Фон</p>
          <p className="text-stone">{concept.background}</p>
        </div>
        <div>
          <p className="font-sans font-label text-pebble">Свет</p>
          <p className="text-stone">{concept.lighting}</p>
        </div>
        <div>
          <p className="font-sans font-label text-pebble">Реквизит</p>
          <ul className="text-stone">
            {concept.props.map((p, i) => (
              <li key={i}>
                <span className="text-ink">{p.item}</span> — {p.function}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-sans font-label text-pebble">Композиция</p>
          <p className="text-stone">{concept.composition}</p>
        </div>
        <div>
          <p className="font-sans font-label text-pebble">Как это выглядит</p>
          <p className="text-stone">{concept.moodDescription}</p>
        </div>
        <div>
          <p className="font-sans font-label text-pebble">На что смотреть в референсах</p>
          <ul className="text-stone">
            {concept.referenceNotes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-sans font-label text-pebble">Поисковые запросы</p>
          <ul className="mt-1 space-y-1">
            {concept.searchPrompts.map((prompt, i) => (
              <SearchPromptRow key={i} prompt={prompt} />
            ))}
          </ul>
        </div>
      </div>

      {error && <p className="font-sans text-sm text-stone">{error}</p>}
      <Button onClick={createPlan} disabled={loading}>
        {loading ? "Готовим план…" : "Создать план съёмки"}
      </Button>
    </Card>
  );
}

export default function IdeaResultView({ project, result }: IdeaResultViewProps) {
  return (
    <div>
      <p className="mb-8 font-sans text-stone">«{result.description}»</p>
      <div className="grid gap-6 md:grid-cols-2">
        {result.concepts.map((concept, i) => (
          <ConceptCard key={i} concept={concept} project={project} />
        ))}
      </div>
    </div>
  );
}
