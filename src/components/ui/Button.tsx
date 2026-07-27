import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

const variants: Record<string, string> = {
  primary: "bg-ink text-paper hover:opacity-90",
  secondary: "bg-paper text-ink border border-hairline hover:bg-linen",
  ghost: "bg-transparent text-ink hover:bg-paper",
};

export default function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-card px-6 py-3 font-sans font-label text-[15px] tracking-tight transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
