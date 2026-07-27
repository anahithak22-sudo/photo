import { useState } from "react";
import type { Confidence, ReconstructResult } from "@/lib/types";
import PhotoViewer from "@/components/PhotoViewer";
import ThumbnailStrip from "@/components/ThumbnailStrip";

interface ReconstructResultViewProps {
  result: ReconstructResult;
  imageUrls: string[];
}

function ConfidenceField<T>({
  title,
  field,
  render,
}: {
  title: string;
  field: Confidence<T>;
  render: (value: T) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const uncertain = field.confidence !== "high";

  return (
    <div className="border-b border-hairline py-6">
      <div className="flex items-center gap-2">
        <h3 className="font-heading text-lg font-normal tracking-tight text-ink">{title}</h3>
        {uncertain && (
          <span className="rounded-full bg-linen px-2 py-0.5 text-xs text-pebble">вероятно</span>
        )}
      </div>
      <div className="mt-2 font-sans text-stone">{render(field.primary)}</div>
      {field.alternatives.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setOpen((o) => !o)}
            className="font-sans text-sm text-stone underline decoration-hairline hover:text-ink"
          >
            {open ? "Скрыть варианты" : "Другие варианты"}
          </button>
          {open && (
            <ul className="mt-2 space-y-3">
              {field.alternatives.map((alt, i) => (
                <li key={i}>
                  <p className="font-sans text-ink">{alt.option}</p>
                  <p className="font-sans text-sm text-stone">{alt.reasoning}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function ReconstructResultView({ result, imageUrls }: ReconstructResultViewProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const items = imageUrls.map((url, i) => ({ id: String(i), previewUrl: url }));

  return (
    <div>
      <div className="mb-6">
        <ThumbnailStrip items={items} activeId={String(activeIndex)} onSelect={(id) => setActiveIndex(Number(id))} />
      </div>

      <div className="grid gap-10 lg:grid-cols-[55%_1fr]">
        <PhotoViewer src={imageUrls[activeIndex]} alt={`Photo ${activeIndex + 1}`} />

        <div>
          <ConfidenceField title="Камера" field={result.camera} render={(v) => v} />
          <ConfidenceField
            title="Объектив"
            field={result.lens}
            render={(v) => `${v.type} · ${v.range}`}
          />
          <ConfidenceField
            title="Настройки"
            field={result.settings}
            render={(v) => `${v.aperture} · ${v.shutter} · ISO ${v.iso}`}
          />
          <ConfidenceField title="Перспектива" field={result.perspective} render={(v) => v} />
          <ConfidenceField title="Свет" field={result.lighting} render={(v) => v} />
          <ConfidenceField title="Локация" field={result.location} render={(v) => v} />

          <div className="border-b border-hairline py-6">
            <h3 className="mb-3 font-heading text-lg font-normal tracking-tight text-ink">Реквизит</h3>
            <ul className="space-y-2 text-stone">
              {result.props.map((p, i) => (
                <li key={i}>
                  <span className="font-sans text-ink">{p.item}</span> — {p.function}
                </li>
              ))}
            </ul>
          </div>

          <div className="border-b border-hairline py-6">
            <h3 className="mb-2 font-heading text-lg font-normal tracking-tight text-ink">Стайлинг</h3>
            <p className="font-sans text-stone">{result.styling}</p>
          </div>

          <div className="border-b border-hairline py-6">
            <h3 className="mb-2 font-heading text-lg font-normal tracking-tight text-ink">Композиция</h3>
            <p className="font-sans text-stone">{result.composition}</p>
          </div>

          <div className="py-6">
            <h3 className="mb-2 font-heading text-lg font-normal tracking-tight text-ink">Обработка</h3>
            <p className="font-sans text-stone">{result.postProcessing}</p>
          </div>
        </div>
      </div>

      <div className="mt-[--spacing-section] border-t border-hairline pt-10">
        <h2 className="mb-6 font-heading text-2xl font-display text-ink">План съёмки</h2>
        <ol className="space-y-4">
          {result.shootingPlan.map((step) => (
            <li key={step.step} className="flex gap-4">
              <span className="font-heading text-xl font-display text-pebble">
                {String(step.step).padStart(2, "0")}
              </span>
              <div>
                <p className="font-sans text-ink">{step.title}</p>
                <p className="font-sans text-sm text-stone">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
