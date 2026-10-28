import { useNavigate } from "react-router-dom";
import { ButtonIcon } from "../../Items/Buttons/ButtonIcon";
import { useAuthStore } from "../../../store/auth.store";
import { useAudioAdminStore } from "../../../store/audioAdmin.store";

export const UserTab = () => {
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const adminToken = useAudioAdminStore((state) => state.token);
  const lockAudioManager = useAudioAdminStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    void navigate("/login", { replace: true });
  };

  return (
    <div className="flex shrink-0 items-center gap-2">
      {adminToken && (
        <ButtonIcon
          className="rounded-full px-3 py-2 text-xs text-zinc-300 hover:bg-white/10"
          onClick={lockAudioManager}
        >
          Lock manager
        </ButtonIcon>
      )}
      {token && (
        <ButtonIcon
          className="rounded-full border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:bg-white/10"
          onClick={handleLogout}
        >
          Log out
        </ButtonIcon>
      )}
    </div>
  );
};
