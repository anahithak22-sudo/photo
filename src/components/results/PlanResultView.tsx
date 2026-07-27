import type { PlanResult } from "@/lib/types";

interface PlanResultViewProps {
  result: PlanResult;
}

export default function PlanResultView({ result }: PlanResultViewProps) {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h3 className="mb-2 font-heading text-xl font-normal tracking-tight text-ink">Локация</h3>
        <p className="font-sans text-stone">{result.location}</p>
      </div>

      <div>
        <h3 className="mb-2 font-heading text-xl font-normal tracking-tight text-ink">Реквизит</h3>
        <ul className="space-y-1 text-stone">
          {result.props.map((p, i) => (
            <li key={i}>
              <span className="text-ink">{p.item}</span> — {p.function}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-2 font-heading text-xl font-normal tracking-tight text-ink">Свет</h3>
        <p className="font-sans text-stone">{result.lighting}</p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 font-heading text-xl font-normal tracking-tight text-ink">Камера</h3>
          <p className="font-sans text-stone">{result.camera}</p>
        </div>
        <div>
          <h3 className="mb-2 font-heading text-xl font-normal tracking-tight text-ink">Объектив</h3>
          <p className="font-sans text-stone">{result.lens}</p>
        </div>
      </div>

      <div>
        <h3 className="mb-2 font-heading text-xl font-normal tracking-tight text-ink">Композиция</h3>
        <p className="font-sans text-stone">{result.composition}</p>
      </div>

      <div>
        <h3 className="mb-2 font-heading text-xl font-normal tracking-tight text-ink">Стайлинг</h3>
        <p className="font-sans text-stone">{result.styling}</p>
      </div>

      <div className="border-t border-hairline pt-8">
        <h2 className="mb-4 font-heading text-2xl font-display text-ink">Список кадров</h2>
        <ol className="space-y-4">
          {result.shotList.map((shot, i) => (
            <li key={i} className="flex gap-4">
              <span className="font-heading text-xl font-display text-pebble">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="font-sans text-ink">{shot.title}</p>
                <p className="font-sans text-sm text-stone">{shot.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="border-t border-hairline pt-8">
        <h3 className="mb-2 font-heading text-xl font-normal tracking-tight text-ink">Обработка</h3>
        <p className="font-sans text-stone">{result.editingDirection}</p>
      </div>
    </div>
  );
}
