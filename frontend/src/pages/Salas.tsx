import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService, type Game } from "../services/api";
import { storage } from "../services/storage";
import "./Salas.css";

export default function Salas() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    description: "",
  });
  const navigate = useNavigate();

  const user = storage.getUser();

  useEffect(() => {
    const token = storage.getToken();
    if (!token) {
      navigate("/");
      return;
    }

    loadGames();
  }, [navigate]);

  const loadGames = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllGames();
      setGames(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar salas");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.password.trim()) {
      setError("Nome e senha são obrigatórios");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      await apiService.createGame({
        name: formData.name.trim(),
        password: formData.password.trim(),
        description: formData.description.trim() || undefined,
      });
      setShowCreateModal(false);
      setFormData({ name: "", password: "", description: "" });
      await loadGames();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar sala");
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status: Game["status"]) => {
    switch (status) {
      case "PENDING":
        return "#f59e0b";
      case "STARTED":
        return "#10b981";
      case "PAUSED":
        return "#6366f1";
      case "FINISHED":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status: Game["status"]) => {
    switch (status) {
      case "PENDING":
        return "Aguardando";
      case "STARTED":
        return "Em andamento";
      case "PAUSED":
        return "Pausado";
      case "FINISHED":
        return "Finalizado";
      default:
        return status;
    }
  };

  const getStatusOrder = (status: Game["status"]): number => {
    switch (status) {
      case "PENDING":
        return 1;
      case "STARTED":
        return 2;
      case "PAUSED":
        return 3;
      case "FINISHED":
        return 4;
      default:
        return 5;
    }
  };

  const sortedGames = [...games].sort((a, b) => {
    const orderA = getStatusOrder(a.status);
    const orderB = getStatusOrder(b.status);
    return orderA - orderB;
  });

  if (loading && games.length === 0) {
    return (
      <div className="salas-container">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="salas-container">
      <header className="salas-header">
        <div className="header-content">
          <div>
            <h1>Salas de Jogo</h1>
            <p className="user-name">Olá, {user?.nickname || "Usuário"}</p>
          </div>
          <button
            className="create-button"
            onClick={() => setShowCreateModal(true)}
          >
            + Nova Sala
          </button>
        </div>
      </header>

      <main className="salas-main">
        {error && <div className="error-banner">{error}</div>}

        {games.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎮</div>
            <h2>Nenhuma sala encontrada</h2>
            <p>Crie uma nova sala para começar a jogar</p>
          </div>
        ) : (
          <div className="games-list">
            {sortedGames.map((game) => (
              <div
                key={game.id}
                className="game-card"
                onClick={() => navigate(`/sala/${game.id}`)}
              >
                <div className="game-card-header">
                  <h3>{game.name}</h3>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(game.status) }}
                  >
                    {getStatusLabel(game.status)}
                  </span>
                </div>
                {game.description && (
                  <p className="game-description">{game.description}</p>
                )}
                <div className="game-card-footer">
                  <span className="game-date">
                    Criada em{" "}
                    {new Date(game.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Criar Nova Sala</h2>
              <button
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateGame} className="modal-form">
              <div className="form-group">
                <label>Nome da Sala</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ex: Partida dos Amigos"
                  required
                  disabled={creating}
                />
              </div>

              <div className="form-group">
                <label>Senha</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Digite uma senha"
                  required
                  disabled={creating}
                />
              </div>

              <div className="form-group">
                <label>Descrição (opcional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Descreva sua sala..."
                  rows={3}
                  disabled={creating}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="confirm-button"
                  disabled={creating}
                >
                  {creating ? "Criando..." : "Criar Sala"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
