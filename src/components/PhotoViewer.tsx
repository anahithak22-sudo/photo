interface PhotoViewerProps {
  src: string;
  alt: string;
}

export default function PhotoViewer({ src, alt }: PhotoViewerProps) {
  return (
    <div className="lg:sticky lg:top-8 lg:self-start">
      <div className="overflow-hidden rounded-card bg-paper">
        <img src={src} alt={alt} className="w-full object-contain" />
      </div>
    </div>
  );
}
