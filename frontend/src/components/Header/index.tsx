import { InputSearch } from "../Items/Inputs/Search";
import { UserTab } from "./UserTab";

export const Header = () => {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/[0.04] bg-zinc-900/90 px-4 py-3 backdrop-blur-sm sm:px-6">
      <InputSearch />
      <UserTab />
    </header>
  );
};
