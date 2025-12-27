import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  apiService,
  type Game,
  type Transaction,
  type GameUser,
} from "../services/api";
import { storage } from "../services/storage";
import "./ExtratoPartida.css";

export default function ExtratoPartida() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = storage.getUser();

  const [game, setGame] = useState<Game | null>(null);
  const [gameUsers, setGameUsers] = useState<GameUser[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(
    new Set()
  );

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

      if (gameData.status !== "STARTED" && gameData.status !== "FINISHED") {
        navigate(`/sala/${id}`);
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const loadTransactions = useCallback(async () => {
    if (!id) return;

    try {
      setLoadingTransactions(true);
      const data = await apiService.getGameTransactions(id);
      setTransactions(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar transações"
      );
    } finally {
      setLoadingTransactions(false);
    }
  }, [id]);

  useEffect(() => {
    const token = storage.getToken();
    if (!token || !id) {
      navigate("/");
      return;
    }

    loadGameData();
  }, [id, navigate, loadGameData]);

  useEffect(() => {
    if (game && (game.status === "STARTED" || game.status === "FINISHED")) {
      loadTransactions();
    }
  }, [game, loadTransactions]);

  const getTransactionsByPlayer = () => {
    const grouped: Record<string, Transaction[]> = {};

    transactions.forEach((transaction) => {
      const userId = transaction.userId;
      if (!grouped[userId]) {
        grouped[userId] = [];
      }
      grouped[userId].push(transaction);
    });

    // Ordenar transações de cada jogador por data (mais recente primeiro)
    Object.keys(grouped).forEach((userId) => {
      grouped[userId].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

    return grouped;
  };

  const getPlayerName = (userId: string) => {
    const gameUser = gameUsers.find((gu) => gu.userId === userId);
    return gameUser?.user?.nickname || "Usuário";
  };

  const togglePlayerExpanded = (userId: string) => {
    const newExpanded = new Set(expandedPlayers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedPlayers(newExpanded);
  };

  const getPlayerBalance = (userId: string) => {
    return transactions
      .filter((t) => t.userId === userId)
      .reduce((sum, t) => sum + Number(t.amount), 0);
  };

  const transactionsByPlayer = getTransactionsByPlayer();
  const playerIds = Object.keys(transactionsByPlayer);

  if (loading) {
    return (
      <div className="extrato-partida-container">
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
    <div className="extrato-partida-container">
      <header className="extrato-header">
        <button
          className="back-button-header"
          onClick={() => navigate(`/sala/${id}`)}
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
        <h1>Extrato da Partida</h1>
        {game && (
          <span
            className="status-badge-header"
            style={{
              backgroundColor:
                game.status === "FINISHED" ? "#6b7280" : "#10b981",
            }}
          >
            {game.status === "FINISHED" ? "Finalizado" : "Em andamento"}
          </span>
        )}
      </header>

      <main className="extrato-main">
        {error && <div className="error-banner">{error}</div>}

        {loadingTransactions ? (
          <div className="loading-transactions">
            <div className="loading-spinner-small">
              <div className="spinner-ring-small"></div>
              <div className="spinner-ring-small"></div>
              <div className="spinner-ring-small"></div>
            </div>
          </div>
        ) : playerIds.length === 0 ? (
          <div className="empty-extracts">
            <div className="empty-icon">📄</div>
            <p>Nenhuma transação encontrada</p>
          </div>
        ) : (
          <div className="players-extracts-list">
            {playerIds.map((userId) => {
              const playerTransactions = transactionsByPlayer[userId];
              const isExpanded = expandedPlayers.has(userId);
              const playerBalance = getPlayerBalance(userId);
              const playerName = getPlayerName(userId);
              const isCurrentUser = userId === user?.id;

              return (
                <div key={userId} className="player-extract-card">
                  <button
                    className="player-extract-header-button"
                    onClick={() => togglePlayerExpanded(userId)}
                  >
                    <div className="player-extract-header-info">
                      <div className="player-avatar-medium">
                        {playerName[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="player-extract-header-text">
                        <h3 className="player-extract-name">
                          {playerName}
                          {isCurrentUser && (
                            <span className="you-badge">Você</span>
                          )}
                        </h3>
                        <div className="player-extract-summary">
                          <span className="transaction-count">
                            {playerTransactions.length}{" "}
                            {playerTransactions.length === 1
                              ? "transação"
                              : "transações"}
                          </span>
                          <span
                            className={`player-balance-summary ${
                              playerBalance < 0 ? "negative" : ""
                            }`}
                          >
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(playerBalance)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="expand-icon">{isExpanded ? "▼" : "▶"}</div>
                  </button>

                  {isExpanded && (
                    <div className="player-transactions-list">
                      {playerTransactions.map((transaction) => (
                        <div key={transaction.id} className="transaction-item">
                          <div className="transaction-icon">
                            {transaction.amount > 0 ? "➕" : "➖"}
                          </div>
                          <div className="transaction-info">
                            <span className="transaction-description">
                              {transaction.description || "Transação"}
                            </span>
                            <span className="transaction-date">
                              {new Date(
                                transaction.createdAt
                              ).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <span
                            className={`transaction-amount ${
                              transaction.amount > 0 ? "positive" : "negative"
                            }`}
                          >
                            {transaction.amount > 0 ? "+" : ""}
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(transaction.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
