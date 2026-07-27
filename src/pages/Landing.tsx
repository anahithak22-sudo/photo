import { Link } from "react-router-dom";
import { useHistory } from "@/hooks/useHistory";
import HistoryCard from "@/components/HistoryCard";

const MODES = [
  {
    to: "/analyze",
    title: "Analyze Photo",
    subtitle: "Анализ фотографии",
    description:
      "Загрузи свою фотографию и узнай, что в ней работает, что можно улучшить и какой визуальный стиль она передаёт.",
  },
  {
    to: "/reconstruct",
    title: "How Was This Shot?",
    subtitle: "Как это снято?",
    description:
      "Загрузи фотографию-референс и узнай, как примерно можно было создать такой кадр.",
  },
  {
    to: "/idea",
    title: "I Have an Idea",
    subtitle: "У меня есть идея",
    description: "Опиши, что ты хочешь снять, а AI поможет придумать визуальное решение.",
  },
];

export default function Landing() {
  const { projects, remove, rename } = useHistory();
  const recent = projects.slice(0, 6);

  return (
    <div className="mx-auto max-w-[--container-max] px-6 py-16 md:py-24">
      <header className="mx-auto max-w-3xl text-center">
        <h1 className="font-heading text-display-xl font-display text-ink">
          Understand your image.
          <br />
          Recreate the shot.
          <br />
          Build the idea.
        </h1>
        <p className="mt-6 font-sans text-lg text-stone">
          Pixel Snitch — AI, который сдаёт секреты фотографий.
        </p>
      </header>

      <section className="mt-[--spacing-section] grid gap-6 md:grid-cols-3">
        {MODES.map((mode) => (
          <Link
            key={mode.to}
            to={mode.to}
            className="flex flex-col gap-3 rounded-card border border-hairline bg-paper p-8 transition-transform hover:-translate-y-1"
          >
            <h2 className="font-heading text-2xl font-display text-ink">{mode.title}</h2>
            <p className="font-sans text-sm uppercase tracking-wide text-pebble">{mode.subtitle}</p>
            <p className="font-sans text-stone">{mode.description}</p>
          </Link>
        ))}
      </section>

      {recent.length > 0 && (
        <section className="mt-[--spacing-section]">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-heading text-2xl font-display text-ink">Recent Work</h2>
            <Link to="/history" className="font-sans text-sm text-stone hover:text-ink">
              Вся история →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((project) => (
              <HistoryCard
                key={project.id}
                project={project}
                onDelete={remove}
                onRename={rename}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
