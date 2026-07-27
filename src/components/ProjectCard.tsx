import { useState } from "react";
import { Link } from "react-router-dom";
import type { Project } from "@/lib/types";

const TYPE_LABELS: Record<Project["type"], string> = {
  analyze: "Анализ фотографии",
  reconstruct: "Как это снято?",
  idea: "У меня есть идея",
  plan: "План съёмки",
};

interface ProjectCardProps {
  project: Project;
  previewUrl?: string;
  previewColor?: string;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
}

export default function ProjectCard({
  project,
  previewUrl,
  previewColor,
  onDelete,
  onRename,
}: ProjectCardProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(project.title);

  function commitRename() {
    setEditing(false);
    const trimmed = title.trim();
    if (trimmed && trimmed !== project.title) {
      onRename(project.id, trimmed);
    } else {
      setTitle(project.title);
    }
  }

  return (
    <div className="group relative overflow-hidden rounded-card border border-hairline bg-paper transition-transform hover:-translate-y-1">
      <Link to={`/result/${project.id}`} className="block">
        <div className="aspect-[4/3] w-full overflow-hidden bg-linen">
          {previewUrl ? (
            <img src={previewUrl} alt={project.title} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full" style={{ backgroundColor: previewColor ?? "#e5e2df" }} />
          )}
        </div>
      </Link>
      <div className="p-4">
        {editing ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") {
                setTitle(project.title);
                setEditing(false);
              }
            }}
            className="w-full border-b border-hairline bg-transparent font-sans text-ink outline-none"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-left font-sans text-ink hover:underline"
          >
            {project.title}
          </button>
        )}
        <div className="mt-1 flex items-center justify-between text-sm text-pebble">
          <span>{TYPE_LABELS[project.type]}</span>
          <span>{new Date(project.createdAt).toLocaleDateString("ru-RU")}</span>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.preventDefault();
          onDelete(project.id);
        }}
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-ink/70 text-paper opacity-0 transition-opacity group-hover:opacity-100"
        aria-label="Удалить"
      >
        ×
      </button>
    </div>
  );
}
