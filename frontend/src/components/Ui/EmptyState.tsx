import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="grid min-h-44 place-items-center rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-5 py-10 text-center">
      <div className="max-w-md">
        <h2 className="font-semibold text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}
