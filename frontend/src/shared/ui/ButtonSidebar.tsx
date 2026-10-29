import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";

interface ButtonSidebarProps {
  to: string;
  children: ReactNode;
}

export const ButtonSidebar = ({ to, children }: ButtonSidebarProps) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `relative rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-white-6 hover:text-white ${isActive ? "bg-white-8 font-medium text-white before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-emerald-400" : "text-zinc-400"}`
    }
  >
    {children}
  </NavLink>
);
