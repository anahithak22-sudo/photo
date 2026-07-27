import { useState } from "react";
import type { AnalyzeResult } from "@/lib/types";
import PhotoViewer from "@/components/PhotoViewer";
import ThumbnailStrip from "@/components/ThumbnailStrip";
import SectionBlock from "@/components/SectionBlock";

interface AnalyzeResultViewProps {
  result: AnalyzeResult;
  imageUrls: string[];
}

type CategoryKey = "composition" | "color" | "light" | "quality" | "retouching" | "format";

const CATEGORY_LABELS: { key: CategoryKey; label: string }[] = [
  { key: "composition", label: "Композиция" },
  { key: "color", label: "Цвет" },
  { key: "light", label: "Свет" },
  { key: "quality", label: "Качество" },
  { key: "retouching", label: "Ретушь" },
  { key: "format", label: "Формат" },
];

export default function AnalyzeResultView({ result, imageUrls }: AnalyzeResultViewProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = result.photos[activeIndex];
  const items = imageUrls.map((url, i) => ({ id: String(i), previewUrl: url }));

  return (
    <div>
      <div className="mb-6">
        <ThumbnailStrip items={items} activeId={String(activeIndex)} onSelect={(id) => setActiveIndex(Number(id))} />
      </div>

      <div className="grid gap-10 lg:grid-cols-[55%_1fr]">
        <PhotoViewer src={imageUrls[activeIndex]} alt={`Photo ${activeIndex + 1}`} />

        <div>
          {CATEGORY_LABELS.map(({ key, label }) => (
            <SectionBlock key={key} title={label} section={active[key]} />
          ))}

          <div className="border-b border-hairline py-8">
            <h3 className="mb-4 font-heading text-xl font-normal tracking-tight text-ink">Стиль</h3>
            <p className="mb-3 font-sans text-ink">{active.visualStyle.label}</p>
            <ul className="space-y-1 text-stone">
              {active.visualStyle.characteristics.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>

          <div className="py-8">
            <h3 className="mb-4 font-heading text-xl font-normal tracking-tight text-ink">Итог</h3>
            <div className="space-y-4">
              <div>
                <p className="font-sans text-sm uppercase tracking-wide text-pebble">Сильные стороны</p>
                <ul className="mt-2 space-y-1 text-stone">
                  {active.overall.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-sans text-sm uppercase tracking-wide text-pebble">Проблемы</p>
                <ul className="mt-2 space-y-1 text-stone">
                  {active.overall.problems.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-sans text-sm uppercase tracking-wide text-pebble">Что сделать в первую очередь</p>
                <ol className="mt-2 list-decimal space-y-2 pl-5 text-ink">
                  {active.overall.priority.map((p, i) => (
                    <li key={i}>
                      <span className="font-sans">{p.action}</span>
                      <span className="block text-sm text-stone">{p.why}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      {result.seriesStyle && (
        <div className="mt-[--spacing-section] border-t border-hairline pt-10">
          <h2 className="mb-6 font-heading text-2xl font-display text-ink">Твой визуальный стиль</h2>
          <p className="mb-3 font-sans text-ink">{result.seriesStyle.label}</p>
          <p className="mb-4 font-sans text-stone">{result.seriesStyle.summary}</p>
          <ul className="mb-4 space-y-1 text-stone">
            {result.seriesStyle.characteristics.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
          <p className="font-sans text-sm text-pebble">
            Консистентность серии: {result.seriesStyle.consistency}%
          </p>
        </div>
      )}
    </div>
  );
}
