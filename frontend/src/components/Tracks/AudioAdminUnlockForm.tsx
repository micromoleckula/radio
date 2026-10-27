import type { FormEvent } from "react";

interface AudioAdminUnlockFormProps {
  password: string;
  isPending: boolean;
  error?: Error | null;
  onPasswordChange: (password: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function AudioAdminUnlockForm({
  password,
  isPending,
  error,
  onPasswordChange,
  onSubmit,
}: AudioAdminUnlockFormProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#090909] px-4 text-white">
      <form
        className="w-full max-w-sm space-y-5 rounded-lg border border-white/10 bg-[#171717] p-6"
        onSubmit={onSubmit}
      >
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-400">
            Audio management
          </p>
          <h1 className="text-2xl font-bold">Unlock editor</h1>
        </div>
        <label className="grid gap-2 text-sm text-zinc-300">
          Manager PIN
          <input
            autoComplete="current-password"
            autoFocus
            className="rounded bg-zinc-800 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-emerald-400"
            maxLength={128}
            onChange={(event) => {
              onPasswordChange(event.target.value);
            }}
            required
            type="password"
            value={password}
          />
        </label>
        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error.message}
          </p>
        )}
        <button
          className="w-full rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-black hover:bg-emerald-300 disabled:opacity-50"
          disabled={isPending || !password}
          type="submit"
        >
          {isPending ? "Checking..." : "Unlock"}
        </button>
      </form>
    </main>
  );
}
