import { useQuery } from "@tanstack/react-query";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthLayout } from "./components/Login/AuthLayout";
import { apiGet } from "./shared/api";
import { queryKeys } from "./shared/queryKeys";
import { useAuthStore } from "./store/auth.store";
import { AuthGuard, GuestGuard } from "./pages/Guards/AuthGuards";
import { HomePage } from "./pages/HomePage";
import { EditAudiosPage } from "./pages/EditAudiosPage";
import { LibraryPage } from "./pages/LibraryPage";
import { LoginPage } from "./pages/LoginPage";
import { PlaylistPage } from "./pages/PlaylistPage";
import { RegisterPage } from "./pages/RegisterPage";
import { SearchPage } from "./pages/SearchPage";

export const App = () => {
  const token = useAuthStore((state) => state.token);

  useQuery({
    queryKey: queryKeys.authSession,
    queryFn: () => apiGet<{ userId: number; email: string }>("/auth/me", true),
    enabled: Boolean(token),
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  return (
    <Routes>
      <Route path="/edit-audios" element={<EditAudiosPage />} />

      <Route element={<GuestGuard />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<RegisterPage />} />
        </Route>
      </Route>

      <Route element={<AuthGuard />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/library/:playlistId" element={<PlaylistPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};