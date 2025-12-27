import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  apiService,
  type Game,
  type GameUser,
  type PlayerBalance,
} from "../services/api";
import { storage } from "../services/storage";
import "./SalaDetalhes.css";

export default function SalaDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = storage.getUser();

  const [game, setGame] = useState<Game | null>(null);
  const [gameUsers, setGameUsers] = useState<GameUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [joining, setJoining] = useState(false);
  const [isUserInGame, setIsUserInGame] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [playersBalance, setPlayersBalance] = useState<PlayerBalance[]>([]);
  const [showGameMenu, setShowGameMenu] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showBankruptcyModal, setShowBankruptcyModal] = useState(false);
  const [declaringBankruptcy, setDeclaringBankruptcy] = useState(false);
  const [showStartGameModal, setShowStartGameModal] = useState(false);
  const [initialBalance, setInitialBalance] = useState("1500");

  const loadPlayersBalance = useCallback(async () => {
    if (!id) return;

    try {
      const balances = await apiService.getPlayersBalance(id);
      setPlayersBalance(balances);
    } catch (err) {
      console.error("Erro ao carregar saldos:", err);
    }
  }, [id]);

  const loadGameData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const [gameData, usersData] = await Promise.all([
        apiService.getGame(id),
        apiService.getGameUsers(id),
      ]);

      setGame(gameData);
      setGameUsers(usersData);

      // Verificar se o usuário atual está no jogo
      const userInGame = usersData.some(
        (gu) => gu.userId === user?.id && !gu.deletedAt
      );
      setIsUserInGame(userInGame);

      // Se não estiver no jogo, mostrar modal de senha
      if (!userInGame) {
        setShowPasswordModal(true);
      }

      // Se o jogo estiver iniciado ou finalizado, carregar saldos
      if (
        (gameData.status === "STARTED" || gameData.status === "FINISHED") &&
        userInGame
      ) {
        await loadPlayersBalance();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar sala");
    } finally {
      setLoading(false);
    }
  }, [id, user?.id, loadPlayersBalance]);

  useEffect(() => {
    const token = storage.getToken();
    if (!token || !id) {
      navigate("/");
      return;
    }

    loadGameData();
  }, [id, navigate, loadGameData]);

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim() || !id) {
      setError("Por favor, digite a senha");
      return;
    }

    setJoining(true);
    setError(null);

    try {
      await apiService.addUserToGame({
        gameId: id,
        password: password.trim(),
      });

      setShowPasswordModal(false);
      setPassword("");
      await loadGameData(); // Recarregar dados para atualizar lista de usuários
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar no jogo");
    } finally {
      setJoining(false);
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

  const handleToggleGameStatus = async () => {
    if (!game || !id || updatingStatus) return;

    // Se está iniciando pela primeira vez (PENDING -> STARTED), mostrar modal
    if (game.status === "PENDING") {
      setShowStartGameModal(true);
      return;
    }

    // Para pausar/retomar, fazer direto
    setUpdatingStatus(true);
    setError(null);

    try {
      const newStatus: Game["status"] =
        game.status === "STARTED" ? "PAUSED" : "STARTED";

      const updatedGame = await apiService.updateGame(id, {
        status: newStatus,
      });
      setGame(updatedGame);

      // Se iniciou o jogo, carregar saldos
      if (newStatus === "STARTED") {
        await loadPlayersBalance();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao atualizar status do jogo"
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleStartGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!game || !id || updatingStatus) return;

    const balance = parseFloat(initialBalance);
    if (isNaN(balance) || balance <= 0) {
      setError("Valor inválido. O saldo inicial deve ser maior que zero.");
      return;
    }

    setUpdatingStatus(true);
    setError(null);

    try {
      // Chamar start-game com o saldo inicial informado
      await apiService.startGame(id, balance);

      const updatedGame = await apiService.updateGame(id, {
        status: "STARTED",
      });
      setGame(updatedGame);
      setShowStartGameModal(false);
      setInitialBalance("1500"); // Reset para o próximo jogo

      // Carregar saldos após iniciar
      await loadPlayersBalance();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao iniciar jogo");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeclareBankruptcy = async () => {
    if (!id) return;

    setDeclaringBankruptcy(true);
    setError(null);

    try {
      await apiService.declareBankruptcy(id);
      setShowBankruptcyModal(false);
      setShowGameMenu(false);
      await loadGameData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao declarar falência"
      );
    } finally {
      setDeclaringBankruptcy(false);
    }
  };

  const handleFinishGame = async () => {
    if (!game || !id || updatingStatus) return;

    if (!confirm("Tem certeza que deseja finalizar o jogo?")) {
      return;
    }

    setUpdatingStatus(true);
    setError(null);

    try {
      const updatedGame = await apiService.updateGame(id, {
        status: "FINISHED",
      });
      setGame(updatedGame);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao finalizar jogo");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const canToggleStatus = () => {
    if (!game) return false;
    return (
      game.status === "PENDING" ||
      game.status === "STARTED" ||
      game.status === "PAUSED"
    );
  };

  const getActionButtonLabel = () => {
    if (!game) return "";
    if (game.status === "PENDING" || game.status === "PAUSED") {
      return "Iniciar Jogo";
    }
    if (game.status === "STARTED") {
      return "Pausar Jogo";
    }
    return "";
  };

  const getPlayerBalance = (userId: string): number | null => {
    if (game?.status !== "STARTED" && game?.status !== "FINISHED") return null;
    const player = playersBalance.find((p) => p.userId === userId);
    return player ? player.balance : null;
  };

  const getRankedPlayers = () => {
    // Ordenar por ranking quando o jogo está STARTED ou FINISHED
    if (game?.status !== "STARTED" && game?.status !== "FINISHED") {
      return gameUsers;
    }

    // Ordenar por ranking
    return [...gameUsers].sort((a, b) => {
      const balanceA = getPlayerBalance(a.userId) || 0;
      const balanceB = getPlayerBalance(b.userId) || 0;

      // Primeiro ordena por saldo (maior saldo = melhor posição)
      if (balanceB !== balanceA) {
        return balanceB - balanceA;
      }

      // Se saldo igual, ordena por finishedAt
      // Quem não tem finishedAt (não perdeu) fica em primeiro
      if (!a.finishedAt && !b.finishedAt) return 0;
      if (!a.finishedAt) return -1; // A não perdeu, fica acima
      if (!b.finishedAt) return 1; // B não perdeu, fica acima

      // Ambos perderam: quem perdeu por último (data mais recente) fica acima
      const dateA = new Date(a.finishedAt).getTime();
      const dateB = new Date(b.finishedAt).getTime();
      return dateB - dateA; // Data mais recente = perdeu por último = melhor posição
    });
  };

  if (loading) {
    return (
      <div className="sala-detalhes-container">
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

  if (!game) {
    return (
      <div className="sala-detalhes-container">
        <div className="error-state">
          <p>Sala não encontrada</p>
          <button onClick={() => navigate("/salas")} className="back-button">
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sala-detalhes-container">
      <header className="sala-header">
        <div className="header-top-row">
          <button
            className="back-button-header"
            onClick={() => navigate("/salas")}
            aria-label="Voltar"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          {isUserInGame && canToggleStatus() && (
            <button
              className="menu-button-header"
              onClick={() => setShowGameMenu(true)}
            >
              ⋯
            </button>
          )}
        </div>
        <div className="header-content">
          <h1>{game.name}</h1>
          <span
            className="status-badge-header"
            style={{ backgroundColor: getStatusColor(game.status) }}
          >
            {getStatusLabel(game.status)}
          </span>
        </div>
      </header>

      <main className="sala-main">
        {error && <div className="error-banner">{error}</div>}

        {game.description && (
          <div className="description-section">
            <button
              className="description-toggle"
              onClick={() => setShowDescription(!showDescription)}
            >
              <h2>Descrição</h2>
              <span className="toggle-icon">{showDescription ? "▼" : "▶"}</span>
            </button>
            {showDescription && (
              <div className="description-content">
                <p>{game.description}</p>
              </div>
            )}
          </div>
        )}

        <div className="players-section">
          <h2>
            {game?.status === "FINISHED"
              ? "Ranking Final"
              : game?.status === "STARTED"
              ? "Ranking"
              : "Jogadores"}{" "}
            ({gameUsers.length})
          </h2>
          {gameUsers.length === 0 ? (
            <p className="empty-players">Nenhum jogador ainda</p>
          ) : (
            <div className="players-list">
              {getRankedPlayers().map((gameUser, index) => {
                const balance = getPlayerBalance(gameUser.userId);
                const rank =
                  game?.status === "FINISHED" || game?.status === "STARTED"
                    ? index + 1
                    : null;
                return (
                  <div key={gameUser.id} className="player-balance-card">
                    {rank && (
                      <div className="rank-badge">
                        {rank === 1
                          ? "🥇"
                          : rank === 2
                          ? "🥈"
                          : rank === 3
                          ? "🥉"
                          : rank}
                      </div>
                    )}
                    <div className="player-avatar-small">
                      {gameUser.user?.nickname?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="player-balance-info">
                      <span className="player-name">
                        {gameUser.user?.nickname || "Usuário"}
                        {gameUser.userId === user?.id && (
                          <span className="you-badge">Você</span>
                        )}
                      </span>
                      {balance !== null && (
                        <span
                          className={`player-balance ${
                            balance < 0 ? "negative" : ""
                          }`}
                        >
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(balance)}
                        </span>
                      )}
                      {game?.status === "FINISHED" && gameUser.finishedAt && (
                        <span className="finished-date">
                          Perdeu em{" "}
                          {new Date(gameUser.finishedAt).toLocaleDateString(
                            "pt-BR",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {!isUserInGame && (
          <div className="info-card warning">
            <p>Você ainda não está nesta sala. Digite a senha para entrar.</p>
          </div>
        )}
      </main>

      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => {}}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Entrar na Sala</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowPasswordModal(false);
                  navigate("/salas");
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleJoinGame} className="modal-form">
              <div className="form-group">
                <label>Senha da Sala</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha"
                  required
                  disabled={joining}
                  autoFocus
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    navigate("/salas");
                  }}
                  disabled={joining}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="confirm-button"
                  disabled={joining || !password.trim()}
                >
                  {joining ? "Entrando..." : "Entrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Menu de Opções do Jogo */}
      {showGameMenu && (
        <div className="modal-overlay" onClick={() => setShowGameMenu(false)}>
          <div className="game-menu-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Opções do Jogo</h2>
              <button
                className="modal-close"
                onClick={() => setShowGameMenu(false)}
              >
                ×
              </button>
            </div>

            <div className="game-menu-options">
              <button
                className="menu-option-button primary"
                onClick={() => {
                  handleToggleGameStatus();
                  setShowGameMenu(false);
                }}
                disabled={updatingStatus || game.status === "FINISHED"}
              >
                <span className="menu-icon">
                  {game.status === "PENDING" || game.status === "PAUSED"
                    ? "▶"
                    : "⏸"}
                </span>
                <div className="menu-option-info">
                  <span className="menu-option-title">
                    {updatingStatus ? "Atualizando..." : getActionButtonLabel()}
                  </span>
                </div>
              </button>

              {(game.status === "STARTED" || game.status === "FINISHED") && (
                <>
                  <button
                    className="menu-option-button extract"
                    onClick={() => {
                      navigate(`/extrato/${id}`);
                      setShowGameMenu(false);
                    }}
                  >
                    <span className="menu-icon">📄</span>
                    <div className="menu-option-info">
                      <span className="menu-option-title">Extratos</span>
                      <span className="menu-option-subtitle">
                        Ver extratos de todos os jogadores
                      </span>
                    </div>
                  </button>
                </>
              )}

              {game.status === "STARTED" && (
                <>
                  <button
                    className="menu-option-button bank"
                    onClick={() => {
                      navigate(`/banco/${id}`);
                      setShowGameMenu(false);
                    }}
                  >
                    <span className="menu-icon">🏦</span>
                    <div className="menu-option-info">
                      <span className="menu-option-title">Banco</span>
                      <span className="menu-option-subtitle">
                        Transferir e fazer empréstimos
                      </span>
                    </div>
                  </button>

                  {!gameUsers.find(
                    (gu) => gu.userId === user?.id && gu.finishedAt
                  ) && (
                    <button
                      className="menu-option-button danger"
                      onClick={() => {
                        setShowGameMenu(false);
                        setShowBankruptcyModal(true);
                      }}
                      disabled={updatingStatus}
                    >
                      <span className="menu-icon">💸</span>
                      <div className="menu-option-info">
                        <span className="menu-option-title">
                          Declarar Falência
                        </span>
                        <span className="menu-option-subtitle">
                          Sair da partida
                        </span>
                      </div>
                    </button>
                  )}

                  <button
                    className="menu-option-button secondary"
                    onClick={() => {
                      setShowGameMenu(false);
                      handleFinishGame();
                    }}
                    disabled={updatingStatus}
                  >
                    <span className="menu-icon">🏁</span>
                    <div className="menu-option-info">
                      <span className="menu-option-title">Finalizar Jogo</span>
                      <span className="menu-option-subtitle">
                        Encerrar a partida
                      </span>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Falência */}
      {showBankruptcyModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowBankruptcyModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Declarar Falência</h2>
              <button
                className="modal-close"
                onClick={() => setShowBankruptcyModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <p className="warning-text">
                Tem certeza que deseja declarar falência? Esta ação não pode ser
                desfeita e você sairá da partida.
              </p>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => setShowBankruptcyModal(false)}
                disabled={declaringBankruptcy}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="confirm-button danger"
                onClick={handleDeclareBankruptcy}
                disabled={declaringBankruptcy}
              >
                {declaringBankruptcy ? "Declarando..." : "Confirmar Falência"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Iniciar Jogo */}
      {showStartGameModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowStartGameModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Iniciar Jogo</h2>
              <button
                className="modal-close"
                onClick={() => setShowStartGameModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleStartGame} className="modal-form">
              <div className="form-group">
                <label>Saldo Inicial dos Jogadores</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  placeholder="1500"
                  required
                  disabled={updatingStatus}
                />
                <span className="form-hint">
                  Valor padrão do Monopoly: R$ 1.500,00
                </span>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowStartGameModal(false)}
                  disabled={updatingStatus}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="confirm-button"
                  disabled={updatingStatus}
                >
                  {updatingStatus ? "Iniciando..." : "Iniciar Jogo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
