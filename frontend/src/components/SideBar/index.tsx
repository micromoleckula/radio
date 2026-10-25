import { ButtonSidebar } from "../Items/Buttons/ButtonSidebar";

export const Sidebar = () => {
  return (
    <aside className="flex h-full w-[264px] flex-col gap-2 rounded-xl bg-zinc-900 p-4">
      <nav aria-label="Main navigation" className="flex flex-col gap-2">
        <ButtonSidebar to="/home">Home</ButtonSidebar>
        <ButtonSidebar to="/search">Search</ButtonSidebar>
        <ButtonSidebar to="/library">Your Library</ButtonSidebar>
        <ButtonSidebar to="/edit-audios">Manage audio</ButtonSidebar>
      </nav>
    </aside>
  );
};