
import { useAuth } from "./AuthProvider";
import { useNavigate } from "react-router-dom";

const LoginButton = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return user ? (
    <button
      onClick={() => navigate("/profile")}
      className="px-4 py-2 rounded-md bg-teal text-white hover:bg-teal-700 transition-colors"
    >
      Meu Perfil
    </button>
  ) : (
    <button
      onClick={() => navigate("/auth")}
      className="px-4 py-2 rounded-md bg-teal text-white hover:bg-teal-700 transition-colors"
    >
      Entrar
    </button>
  );
};

export default LoginButton;
