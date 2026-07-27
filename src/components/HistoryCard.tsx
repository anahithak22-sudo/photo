import type { Project, IdeaResult } from "@/lib/types";
import { useImageUrl } from "@/hooks/useImageUrl";
import ProjectCard from "./ProjectCard";

interface HistoryCardProps {
  project: Project;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
}

export default function HistoryCard({ project, onDelete, onRename }: HistoryCardProps) {
  const previewUrl = useImageUrl(project.thumbnailId ?? project.imageIds[0]);
  const ideaColor =
    project.type === "idea"
      ? (project.result as IdeaResult).concepts[0]?.colorPalette[0]?.hex
      : undefined;

  return (
    <ProjectCard
      project={project}
      previewUrl={previewUrl}
      previewColor={ideaColor}
      onDelete={onDelete}
      onRename={onRename}
    />
  );
}
