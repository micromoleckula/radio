import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";

export const AuthGuard = () => {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export const GuestGuard = () => {
  const token = useAuthStore((state) => state.token);

  if (token) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};
