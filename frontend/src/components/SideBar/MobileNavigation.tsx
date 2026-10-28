import { NavLink } from "react-router-dom";

const navigationItems = [
  { to: "/home", label: "Home", icon: "⌂" },
  { to: "/search", label: "Search", icon: "⌕" },
  { to: "/library", label: "Library", icon: "♫" },
  { to: "/edit-audios", label: "Manage", icon: "⚙" },
];

export function MobileNavigation() {
  return (
    <nav
      aria-label="Main navigation"
      className="grid grid-cols-4 gap-1 rounded-xl bg-zinc-900 p-1 md:hidden"
    >
      {navigationItems.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex min-w-0 flex-col items-center gap-0.5 rounded-lg px-2 py-2 text-[11px] transition-colors ${isActive ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-200"}`
          }
        >
          <span aria-hidden="true" className="text-base leading-5">
            {icon}
          </span>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
