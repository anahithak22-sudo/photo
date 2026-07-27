import { useMemo, useState } from "react";
import { useHistory } from "@/hooks/useHistory";
import HistoryCard from "@/components/HistoryCard";
import Chip from "@/components/ui/Chip";
import { Input } from "@/components/ui/Input";
import type { ProjectType } from "@/lib/types";

const GROUPS: { type: ProjectType; label: string }[] = [
  { type: "analyze", label: "Анализ фотографии" },
  { type: "reconstruct", label: "Как это снято?" },
  { type: "idea", label: "У меня есть идея" },
  { type: "plan", label: "План съёмки" },
];

export default function History() {
  const { projects, remove, rename } = useHistory();
  const [filter, setFilter] = useState<ProjectType | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (filter !== "all" && p.type !== filter) return false;
      if (query && !p.title.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [projects, filter, query]);

  function handleDelete(id: string) {
    if (window.confirm("Удалить этот проект? Это действие нельзя отменить.")) {
      remove(id);
    }
  }

  if (projects.length === 0) {
    return (
      <div className="mx-auto max-w-[--container-max] px-6 py-24 text-center">
        <p className="font-heading text-2xl font-display text-ink">Пока никто не настучал.</p>
        <p className="mt-3 font-sans text-stone">
          Загрузи первую фотографию — разберёмся, что в ней происходит.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[--container-max] px-6 py-16">
      <h1 className="font-heading text-3xl font-display text-ink">My Projects</h1>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <Chip active={filter === "all"} onClick={() => setFilter("all")}>
            Все
          </Chip>
          {GROUPS.map((g) => (
            <Chip key={g.type} active={filter === g.type} onClick={() => setFilter(g.type)}>
              {g.label}
            </Chip>
          ))}
        </div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по названию"
          className="max-w-xs"
        />
      </div>

      <div className="mt-10 space-y-12">
        {GROUPS.filter((g) => filter === "all" || filter === g.type).map((g) => {
          const items = filtered.filter((p) => p.type === g.type);
          if (items.length === 0) return null;
          return (
            <section key={g.type}>
              <h2 className="mb-4 font-heading text-xl font-normal tracking-tight text-ink">
                {g.label} ({items.length})
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((project) => (
                  <HistoryCard
                    key={project.id}
                    project={project}
                    onDelete={handleDelete}
                    onRename={rename}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
