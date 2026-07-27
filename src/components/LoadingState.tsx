import { useEffect, useState } from "react";

const DEFAULT_MESSAGES = [
  "Допрашиваем пиксели…",
  "Изучаем, откуда падал свет…",
  "Вычисляем, кто виноват…",
  "Сверяем показания…",
];

interface LoadingStateProps {
  messages?: string[];
  progress?: string;
}

export default function LoadingState({ messages = DEFAULT_MESSAGES, progress }: LoadingStateProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 3000);
    return () => clearInterval(id);
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <p className="font-sans text-pebble transition-opacity duration-500">{messages[index]}</p>
      {progress && <p className="font-sans text-sm text-pebble">{progress}</p>}
    </div>
  );
}
