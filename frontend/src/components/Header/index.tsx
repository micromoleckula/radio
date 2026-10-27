import { InputSearch } from "../Items/Inputs/Search";
import { UserTab } from "./UserTab";

export const Header = () => {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between bg-zinc-900/90 p-4 backdrop-blur-sm">
      <InputSearch />
      <UserTab />
    </header>
  );
};
