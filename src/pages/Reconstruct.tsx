import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { nanoid } from "nanoid";
import Uploader, { type UploadedPhoto } from "@/components/Uploader";
import Button from "@/components/ui/Button";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { reconstructPhotos } from "@/lib/api";
import { saveImageBlob, saveProject, getProjects } from "@/lib/storage";
import type { Project } from "@/lib/types";

const RECONSTRUCT_MESSAGES = [
  "Изучаем свет и тени…",
  "Прикидываем фокусное расстояние…",
  "Ищем, где стояла камера…",
  "Собираем план съёмки…",
];

export default function Reconstruct() {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function start() {
    setStatus("loading");
    setError(null);
    try {
      const result = await reconstructPhotos(
        photos.map((p) => ({ data: p.base64, mediaType: p.mediaType }))
      );

      const projectId = nanoid();
      const imageIds: string[] = [];
      for (const photo of photos) {
        await saveImageBlob(photo.id, photo.fullBlob);
        imageIds.push(photo.id);
      }
      const thumbnailId = `${photos[0].id}-thumb`;
      await saveImageBlob(thumbnailId, photos[0].thumbnailBlob);

      const existingCount = getProjects().filter((p) => p.type === "reconstruct").length;
      const title = `Reference ${String(existingCount + 1).padStart(2, "0")}`;

      const project: Project = {
        id: projectId,
        type: "reconstruct",
        title,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        thumbnailId,
        imageIds,
        result,
      };
      saveProject(project);
      navigate(`/result/${projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Что-то пошло не так");
      setStatus("error");
    }
  }

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-[--container-max] px-6 py-16">
        <LoadingState messages={RECONSTRUCT_MESSAGES} />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto max-w-[--container-max] px-6 py-16">
        <ErrorState message={error ?? ""} onRetry={start} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-heading text-3xl font-display text-ink">Как это снято?</h1>
      <p className="mt-3 font-sans text-stone">
        Загрузи фотографию-референс (или серию из одного визуального ключа) — расскажем, как примерно можно было получить такой кадр.
      </p>

      <div className="mt-8">
        <Uploader photos={photos} onChange={setPhotos} />
      </div>

      <div className="mt-8 flex justify-end">
        <Button disabled={photos.length === 0} onClick={start}>
          Реконструировать
        </Button>
      </div>
    </div>
  );
}
