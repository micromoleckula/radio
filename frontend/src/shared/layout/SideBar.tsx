import { ButtonSidebar } from "../ui/ButtonSidebar";
import { Link } from "react-router-dom";

export const Sidebar = () => {
  return (
    <aside className="hidden h-full w-56 shrink-0 flex-col rounded-xl bg-zinc-900 p-4 md:flex lg:w-60">
      <Link className="mb-8 flex items-center gap-3 px-2" to="/home">
        <span className="grid size-10 place-items-center rounded-full bg-emerald-400 font-black text-zinc-950">
          R
        </span>
        <span>
          <span className="block font-semibold text-white">Radio Pepe</span>
          <span className="block text-xs text-zinc-500">Your music space</span>
        </span>
      </Link>
      <nav aria-label="Main navigation" className="flex flex-col gap-1">
        <p className="mb-2 px-3 text-caption font-semibold uppercase tracking-kicker text-zinc-600">
          Discover
        </p>
        <ButtonSidebar to="/home">Home</ButtonSidebar>
        <ButtonSidebar to="/search">Search</ButtonSidebar>
        <p className="mb-2 mt-7 px-3 text-caption font-semibold uppercase tracking-kicker text-zinc-600">
          Your space
        </p>
        <ButtonSidebar to="/library">Your Library</ButtonSidebar>
        <ButtonSidebar to="/edit-audios">Manage audio</ButtonSidebar>
      </nav>
    </aside>
  );
};