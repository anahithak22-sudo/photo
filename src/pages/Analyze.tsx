import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { nanoid } from "nanoid";
import Uploader, { type UploadedPhoto } from "@/components/Uploader";
import Button from "@/components/ui/Button";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { analyzeSinglePhoto, analyzeSeriesStyle } from "@/lib/api";
import { saveImageBlob } from "@/lib/storage";
import { saveProject } from "@/lib/storage";
import type { AnalyzeResult, Project } from "@/lib/types";

export default function Analyze() {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState("");
  const navigate = useNavigate();

  async function startAnalysis() {
    setStatus("loading");
    setError(null);

    try {
      let done = 0;
      const total = photos.length + (photos.length >= 2 ? 1 : 0);
      const updateProgress = () => {
        done += 1;
        setProgress(`Photo ${done} из ${total}`);
      };

      const photoAnalyses = await Promise.all(
        photos.map(async (photo) => {
          const result = await analyzeSinglePhoto({ data: photo.base64, mediaType: photo.mediaType });
          updateProgress();
          return result;
        })
      );

      const seriesStyle =
        photos.length >= 2
          ? await (async () => {
              const result = await analyzeSeriesStyle(
                photos.map((p) => ({ data: p.base64, mediaType: p.mediaType }))
              );
              updateProgress();
              return result;
            })()
          : undefined;

      const result: AnalyzeResult = { photos: photoAnalyses, seriesStyle };

      const projectId = nanoid();
      const imageIds: string[] = [];
      for (const photo of photos) {
        await saveImageBlob(photo.id, photo.fullBlob);
        imageIds.push(photo.id);
      }
      const thumbnailId = `${photos[0].id}-thumb`;
      await saveImageBlob(thumbnailId, photos[0].thumbnailBlob);

      const firstName = photos[0].name.replace(/\.[^.]+$/, "");
      const title = firstName || `Анализ ${new Date().toLocaleDateString("ru-RU")}`;

      const project: Project = {
        id: projectId,
        type: "analyze",
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
        <LoadingState progress={progress} />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto max-w-[--container-max] px-6 py-16">
        <ErrorState message={error ?? ""} onRetry={startAnalysis} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-heading text-3xl font-display text-ink">Анализ фотографии</h1>
      <p className="mt-3 font-sans text-stone">
        Загрузи от 1 до 5 фотографий. Каждая получит отдельный разбор; для серии из двух и более фото добавим общий визуальный стиль.
      </p>

      <div className="mt-8">
        <Uploader photos={photos} onChange={setPhotos} />
      </div>

      <div className="mt-8 flex justify-end">
        <Button disabled={photos.length === 0} onClick={startAnalysis}>
          Начать анализ
        </Button>
      </div>
    </div>
  );
}
