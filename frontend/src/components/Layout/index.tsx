import type { ReactNode } from "react";
import { Header } from "../Header";
import { MusicPlayer } from "../Player/MusicPlayer";
import { MobileNavigation } from "../SideBar/MobileNavigation";
import { Sidebar } from "../SideBar";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex h-dvh w-full flex-col gap-2 overflow-hidden bg-black p-2 font-sans text-white">
      <div className="flex min-h-0 flex-1 gap-2 overflow-hidden">
        <Sidebar />

        <div className="relative flex flex-1 flex-col overflow-hidden rounded-xl bg-zinc-900">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>

      <MobileNavigation />
      <MusicPlayer />
    </div>
  );
};
