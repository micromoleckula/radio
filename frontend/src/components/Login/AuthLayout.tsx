import { Link, Outlet } from "react-router-dom";

export const AuthLayout = () => {
  return (
    <div className="flex min-h-dvh flex-col items-center bg-[#090909] px-4 py-10 text-white sm:justify-center sm:py-14">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-7 flex items-center justify-center gap-3 transition-opacity hover:opacity-80"
        >
          <span className="grid size-10 place-items-center rounded-full bg-emerald-400 font-black text-zinc-950">
            R
          </span>
          <span>
            <span className="block text-lg font-semibold">Radio Pepe</span>
            <span className="block text-xs text-zinc-500">
              Your music space
            </span>
          </span>
        </Link>
        <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/80 p-6 shadow-2xl shadow-black/30 sm:p-8">
          <Outlet />
        </div>
        <p className="mt-5 text-center text-xs text-zinc-600">
          A little room for the music you love.
        </p>
      </div>
    </div>
  );
};
