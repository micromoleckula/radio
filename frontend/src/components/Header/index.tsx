import { InputSearch } from "../Items/Inputs/Search";
import { UserTab } from "./UserTab";

export const Header = () => {
  return (
    <header>
      <InputSearch />
      <UserTab />
    </header>
  );
};