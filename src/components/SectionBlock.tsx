import type { Section } from "@/lib/types";

interface SectionBlockProps {
  title: string;
  section: Section;
}

export default function SectionBlock({ title, section }: SectionBlockProps) {
  return (
    <div className="border-b border-hairline py-8 last:border-b-0">
      <h3 className="mb-4 font-heading text-xl font-normal tracking-tight text-ink">{title}</h3>
      <div className="space-y-4">
        {section.works.length > 0 && (
          <div className="flex gap-3">
            <span className="shrink-0 text-ink">✓</span>
            <ul className="space-y-1 text-stone">
              {section.works.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {section.improve.length > 0 && (
          <div className="flex gap-3">
            <span className="shrink-0 text-ink">△</span>
            <ul className="space-y-1 text-stone">
              {section.improve.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex gap-3">
          <span className="shrink-0 text-ink">→</span>
          <p className="text-ink">{section.recommendation}</p>
        </div>
      </div>
    </div>
  );
}
