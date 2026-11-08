import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { MusicPlayer } from "../../features/player/components/MusicPlayer";
import { MobileNavigation } from "./MobileNavigation";
import { Sidebar } from "./SideBar";

export const Layout = () => {
  return (
    <div className="flex h-dvh w-full flex-col gap-2 overflow-hidden bg-black p-2 font-sans text-white">
      <div className="flex min-h-0 flex-1 gap-2 overflow-hidden">
        <Sidebar />

        <div className="relative flex flex-1 flex-col overflow-hidden rounded-xl bg-zinc-900">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>

      <MobileNavigation />
      <MusicPlayer />
    </div>
  );
};
