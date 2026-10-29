import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <label className="grid gap-1.5 text-sm text-zinc-300">
      {label}
      {children}
      {error && (
        <span className="text-xs text-red-300" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}
