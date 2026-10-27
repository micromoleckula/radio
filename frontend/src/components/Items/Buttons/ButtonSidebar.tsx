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
      `rounded px-3 py-2 text-left transition-colors hover:bg-white/10 hover:text-white ${isActive ? "bg-white/10 text-white" : "text-zinc-400"}`
    }
  >
    {children}
  </NavLink>
);
