import type { ButtonHTMLAttributes } from "react";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export default function Chip({ active = false, className = "", ...props }: ChipProps) {
  return (
    <button
      type="button"
      className={`rounded-full border px-4 py-2 text-sm font-sans transition-colors ${
        active
          ? "border-ink bg-ink text-paper"
          : "border-hairline bg-paper text-stone hover:text-ink"
      } ${className}`}
      {...props}
    />
  );
}
