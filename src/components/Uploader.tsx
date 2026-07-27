import { useRef, useState } from "react";
import { nanoid } from "nanoid";
import { isAcceptedFile, processImage, MAX_FILE_SIZE, MAX_PHOTOS } from "@/lib/image";
import Button from "./ui/Button";

export interface UploadedPhoto {
  id: string;
  base64: string;
  mediaType: "image/jpeg";
  previewUrl: string;
  fullBlob: Blob;
  thumbnailBlob: Blob;
  name: string;
}

interface UploaderProps {
  photos: UploadedPhoto[];
  onChange: (photos: UploadedPhoto[]) => void;
}

export default function Uploader({ photos, onChange }: UploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function showNotice(message: string) {
    setNotice(message);
    setTimeout(() => setNotice(null), 3500);
  }

  async function addFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    const room = MAX_PHOTOS - photos.length;

    if (files.length > room) {
      showNotice("Максимально можно загрузить 5 фотографий.");
    }
    const toProcess = files.slice(0, Math.max(room, 0));

    const next: UploadedPhoto[] = [];
    for (const file of toProcess) {
      if (!isAcceptedFile(file)) {
        showNotice(`Формат файла «${file.name}» не поддерживается.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        showNotice(`Файл «${file.name}» больше 20 МБ.`);
        continue;
      }
      try {
        const processed = await processImage(file);
        next.push({
          id: nanoid(),
          base64: processed.base64,
          mediaType: processed.mediaType,
          previewUrl: URL.createObjectURL(processed.fullBlob),
          fullBlob: processed.fullBlob,
          thumbnailBlob: processed.thumbnailBlob,
          name: file.name,
        });
      } catch {
        showNotice(`Не удалось обработать файл «${file.name}».`);
      }
    }
    if (next.length > 0) {
      onChange([...photos, ...next]);
    }
  }

  function removePhoto(id: string) {
    onChange(photos.filter((p) => p.id !== id));
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed px-6 py-16 text-center transition-colors ${
          isDragging ? "border-ink bg-paper" : "border-hairline bg-paper/60 hover:bg-paper"
        }`}
      >
        <p className="font-sans text-ink">Перетащи фотографии сюда или нажми, чтобы выбрать</p>
        <p className="font-sans text-sm text-pebble">JPG, PNG, WEBP, HEIC — до 5 файлов, до 20 МБ каждый</p>
        <Button
          type="button"
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
        >
          Выбрать файлы
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp,.heic,.heif,image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {notice && <p className="mt-3 text-center font-sans text-sm text-stone">{notice}</p>}

      {photos.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative h-24 w-24 overflow-hidden rounded-tile">
              <img src={photo.previewUrl} alt={photo.name} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(photo.id)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/80 text-paper opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Удалить фотографию"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
