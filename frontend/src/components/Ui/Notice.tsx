import type { ReactNode } from "react";

interface NoticeProps {
  children: ReactNode;
  tone?: "error" | "neutral";
}

export function Notice({ children, tone = "neutral" }: NoticeProps) {
  const toneClass =
    tone === "error"
      ? "border-red-400/20 bg-red-400/[0.08] text-red-300"
      : "border-white/10 bg-white/[0.04] text-zinc-300";

  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm leading-5 ${toneClass}`}
      role={tone === "error" ? "alert" : undefined}
    >
      {children}
    </div>
  );
}
