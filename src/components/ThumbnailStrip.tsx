interface ThumbnailItem {
  id: string;
  previewUrl: string;
}

interface ThumbnailStripProps {
  items: ThumbnailItem[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function ThumbnailStrip({ items, activeId, onSelect }: ThumbnailStripProps) {
  if (items.length < 2) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {items.map((item, index) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-tile border-2 transition-colors ${
            activeId === item.id ? "border-ink" : "border-transparent opacity-60 hover:opacity-100"
          }`}
        >
          <img src={item.previewUrl} alt={`Photo ${String(index + 1).padStart(2, "0")}`} className="h-full w-full object-cover" />
        </button>
      ))}
    </div>
  );
}
