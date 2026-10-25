import { useNavigate } from "react-router-dom";
import { ButtonIcon } from "../Items/Buttons/ButtonIcon";
import { useAuthStore } from "../../store/auth.store";

export const UserTab = () => {
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    void navigate("/login", { replace: true });
  };

  return (
    <div>
      {token && <ButtonIcon onClick={handleLogout}>Log out</ButtonIcon>}
    </div>
  );
};
