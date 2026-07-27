import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { AnalyzeResult, IdeaResult, PlanResult, Project, ReconstructResult } from "@/lib/types";
import { getProject, getImageBlob } from "@/lib/storage";
import AnalyzeResultView from "@/components/results/AnalyzeResultView";
import ReconstructResultView from "@/components/results/ReconstructResultView";
import IdeaResultView from "@/components/results/IdeaResultView";
import PlanResultView from "@/components/results/PlanResultView";
import ErrorState from "@/components/ErrorState";

export default function Result() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null | undefined>(undefined);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    const found = getProject(id) ?? null;
    setProject(found);

    if (found && found.imageIds.length > 0) {
      let cancelled = false;
      Promise.all(found.imageIds.map((imgId) => getImageBlob(imgId))).then((blobs) => {
        if (cancelled) return;
        setImageUrls(blobs.filter((b): b is Blob => !!b).map((b) => URL.createObjectURL(b)));
      });
      return () => {
        cancelled = true;
      };
    }
  }, [id]);

  if (project === undefined) return null;

  if (project === null) {
    return (
      <div className="mx-auto max-w-[--container-max] px-6 py-16">
        <ErrorState message="Проект не найден." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[--container-max] px-6 py-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link to="/history" className="font-sans text-sm text-pebble hover:text-ink">
            ← История
          </Link>
          <h1 className="mt-2 font-heading text-2xl font-display text-ink">{project.title}</h1>
        </div>
      </div>

      {project.type === "analyze" && imageUrls.length > 0 && (
        <AnalyzeResultView result={project.result as AnalyzeResult} imageUrls={imageUrls} />
      )}
      {project.type === "reconstruct" && imageUrls.length > 0 && (
        <ReconstructResultView result={project.result as ReconstructResult} imageUrls={imageUrls} />
      )}
      {project.type === "idea" && (
        <IdeaResultView project={project} result={project.result as IdeaResult} />
      )}
      {project.type === "plan" && <PlanResultView result={project.result as PlanResult} />}
    </div>
  );
}
