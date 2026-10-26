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
    <div className="flex items-center gap-2">
      {adminToken && (
        <ButtonIcon onClick={lockAudioManager}>Lock manager</ButtonIcon>
      )}
      {token && <ButtonIcon onClick={handleLogout}>Log out</ButtonIcon>}
    </div>
  );
};
