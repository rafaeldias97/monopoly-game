import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import { storage } from "../services/storage";
import "./Login.css";

export default function Login() {
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nickname.trim()) {
      setError("Por favor, digite seu nome");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.createUser(nickname.trim());
      storage.setToken(response.token);
      storage.setUser({
        id: response.user.id,
        nickname: response.user.nickname,
      });
      navigate("/salas");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar usuário");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-header">
          <div className="logo">🎲</div>
          <h1>Monopoly</h1>
          <p>Digite seu nome para começar</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="input-group">
            <input
              type="text"
              placeholder="Seu nome"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              disabled={loading}
              autoFocus
              className="input-field"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !nickname.trim()}
            className="submit-button"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
