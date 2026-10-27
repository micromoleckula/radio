import { Link, Outlet } from "react-router-dom";

export const AuthLayout = () => {
  return (
    <div className="flex min-h-screen flex-col items-center bg-[#121212] px-4 pt-8 sm:pt-16">
      <Link
        to="/"
        className="mb-8 flex items-center gap-2 transition-opacity hover:opacity-80"
      >
        <div className="rounded-full bg-white p-1.5 text-black">S</div>
        <span className="text-white text-3xl font-bold tracking-tighter">
          Radio Pepe
        </span>
      </Link>

      <div className="w-full">
        <Outlet />
      </div>
    </div>
  );
};
