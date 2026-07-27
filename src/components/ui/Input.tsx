import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

const fieldClass =
  "w-full rounded-card border border-hairline bg-paper px-4 py-3 font-sans text-ink placeholder:text-pebble focus:outline-none focus:border-ink transition-colors";

export function Input({ className = "", ...props }: InputProps) {
  return <input className={`${fieldClass} ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: TextareaProps) {
  return <textarea className={`${fieldClass} resize-none ${className}`} {...props} />;
}
