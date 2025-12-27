import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  apiService,
  type Game,
  type PlayerBalance,
  type Transaction,
} from "../services/api";
import { storage } from "../services/storage";
import "./Banco.css";

export default function Banco() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = storage.getUser();

  const [, setGame] = useState<Game | null>(null);
  const [playersBalance, setPlayersBalance] = useState<PlayerBalance[]>([]);
  const [myBalance, setMyBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUserFinished, setIsUserFinished] = useState(false);
  const [activeTab, setActiveTab] = useState<"transfer" | "loan" | "extract">(
    "transfer"
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [transferData, setTransferData] = useState({
    toUserId: "",
    amount: "",
    description: "",
  });
  const [loanData, setLoanData] = useState({
    amount: "",
    description: "",
  });
  const [processing, setProcessing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadTransactions = useCallback(async () => {
    if (!id) return;

    try {
      setLoadingTransactions(true);
      const data = await apiService.getGameTransactions(id);
      // Filtrar apenas transações do usuário atual
      const myTransactions = data.filter(
        (t) => t.userId === user?.id && t.status === "PAID"
      );
      setTransactions(myTransactions);
    } catch (err) {
      console.error("Erro ao carregar transações:", err);
    } finally {
      setLoadingTransactions(false);
    }
  }, [id, user?.id]);

  const loadGameData = useCallback(
    async (showLoading = true) => {
      if (!id) return;

      try {
        if (showLoading) {
          setLoading(true);
        }

        const [gameData, balances, gameUsers] = await Promise.all([
          apiService.getGame(id),
          apiService.getPlayersBalance(id),
          apiService.getGameUsers(id),
        ]);

        setGame(gameData);
        setPlayersBalance(balances);

        // Encontrar saldo do usuário atual
        const myPlayer = balances.find((p) => p.userId === user?.id);
        setMyBalance(myPlayer?.balance || 0);

        // Verificar se o usuário está finalizado
        const myGameUser = gameUsers.find((gu) => gu.userId === user?.id);
        setIsUserFinished(!!myGameUser?.finishedAt);

        // Se o jogo não estiver STARTED, redirecionar
        if (gameData.status !== "STARTED") {
          navigate(`/sala/${id}`);
          return;
        }
      } catch (err) {
        // Só mostra erro se não for polling silencioso
        if (showLoading) {
          setError(
            err instanceof Error ? err.message : "Erro ao carregar dados"
          );
        }
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [id, user?.id, navigate]
  );

  useEffect(() => {
    const token = storage.getToken();
    if (!token || !id) {
      navigate("/");
      return;
    }

    // Primeira carga com loading
    loadGameData(true);

    // Limpar intervalo anterior se existir
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Polling a cada minuto (60000ms) - sem loading para não piscar
    intervalRef.current = setInterval(() => {
      loadGameData(false); // Polling silencioso
    }, 60000);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [id, navigate, loadGameData]);

  useEffect(() => {
    if (activeTab === "extract" && id) {
      loadTransactions();
    }
  }, [activeTab, id, loadTransactions]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !transferData.toUserId || !transferData.amount) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    const amount = parseFloat(transferData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError("Valor inválido");
      return;
    }

    if (amount > myBalance) {
      setError("Saldo insuficiente");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      await apiService.transferMoney(
        id,
        transferData.toUserId,
        amount,
        transferData.description || undefined
      );
      setShowTransferModal(false);
      setTransferData({ toUserId: "", amount: "", description: "" });
      await loadGameData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao transferir dinheiro"
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleLoan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !loanData.amount || !loanData.description.trim()) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    const amount = parseFloat(loanData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError("Valor inválido");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      await apiService.receiveFromBank(id, amount, loanData.description.trim());
      setShowLoanModal(false);
      setLoanData({ amount: "", description: "" });
      await loadGameData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer empréstimo");
    } finally {
      setProcessing(false);
    }
  };

  const otherPlayers = playersBalance.filter((p) => p.userId !== user?.id);

  if (loading) {
    return (
      <div className="banco-container">
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
    <div className="banco-container">
      <header className="banco-header">
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
        <h1>Banco</h1>
      </header>

      <div className="balance-card">
        <div className="balance-label">Seu Saldo</div>
        <div className={`balance-amount ${myBalance < 0 ? "negative" : ""}`}>
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(myBalance)}
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === "transfer" ? "active" : ""}`}
          onClick={() => setActiveTab("transfer")}
        >
          Transferir
        </button>
        <button
          className={`tab ${activeTab === "loan" ? "active" : ""}`}
          onClick={() => setActiveTab("loan")}
        >
          Empréstimo
        </button>
        <button
          className={`tab ${activeTab === "extract" ? "active" : ""}`}
          onClick={() => setActiveTab("extract")}
        >
          Extrato
        </button>
      </div>

      <main className="banco-main">
        {error && <div className="error-banner">{error}</div>}

        {activeTab === "transfer" && (
          <div className="tab-content">
            {isUserFinished ? (
              <div className="disabled-action-message">
                <div className="disabled-icon">🚫</div>
                <p>
                  Você declarou falência e não pode mais transferir dinheiro
                </p>
              </div>
            ) : (
              <button
                className="action-card-button"
                onClick={() => setShowTransferModal(true)}
              >
                <div className="action-icon">💸</div>
                <div className="action-info">
                  <h3>Transferir Dinheiro</h3>
                  <p>Enviar dinheiro para outro jogador</p>
                </div>
                <div className="action-arrow">→</div>
              </button>
            )}
          </div>
        )}

        {activeTab === "loan" && (
          <div className="tab-content">
            {isUserFinished ? (
              <div className="disabled-action-message">
                <div className="disabled-icon">🚫</div>
                <p>Você declarou falência e não pode mais fazer empréstimos</p>
              </div>
            ) : (
              <button
                className="action-card-button"
                onClick={() => setShowLoanModal(true)}
              >
                <div className="action-icon">🏦</div>
                <div className="action-info">
                  <h3>Fazer Empréstimo</h3>
                  <p>Solicitar dinheiro do banco</p>
                </div>
                <div className="action-arrow">→</div>
              </button>
            )}
          </div>
        )}

        {activeTab === "extract" && (
          <div className="tab-content">
            {loadingTransactions ? (
              <div className="loading-transactions">
                <div className="loading-spinner-small">
                  <div className="spinner-ring-small"></div>
                  <div className="spinner-ring-small"></div>
                  <div className="spinner-ring-small"></div>
                </div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="empty-extract">
                <div className="empty-icon">📄</div>
                <p>Nenhuma transação encontrada</p>
              </div>
            ) : (
              <div className="transactions-list">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="transaction-item">
                    <div className="transaction-icon">
                      {transaction.amount > 0 ? "➕" : "➖"}
                    </div>
                    <div className="transaction-info">
                      <span className="transaction-description">
                        {transaction.description || "Transação"}
                      </span>
                      <span className="transaction-date">
                        {new Date(transaction.createdAt).toLocaleDateString(
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
        )}

        <div className="players-section">
          <h2>Saldo dos Jogadores</h2>
          <div className="players-list">
            {playersBalance.map((player) => (
              <div key={player.userId} className="player-balance-card">
                <div className="player-avatar-small">
                  {player.user?.nickname?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="player-balance-info">
                  <span className="player-name">
                    {player.user?.nickname || "Usuário"}
                    {player.userId === user?.id && (
                      <span className="you-badge">Você</span>
                    )}
                  </span>
                  <span
                    className={`player-balance ${
                      player.balance < 0 ? "negative" : ""
                    }`}
                  >
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(player.balance)}
                  </span>
                </div>
                {player.finishedAt && (
                  <span className="finished-badge-small">Finalizado</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modal de Transferência */}
      {showTransferModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowTransferModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Transferir Dinheiro</h2>
              <button
                className="modal-close"
                onClick={() => setShowTransferModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleTransfer} className="modal-form">
              <div className="form-group">
                <label>Para quem?</label>
                <select
                  value={transferData.toUserId}
                  onChange={(e) =>
                    setTransferData({
                      ...transferData,
                      toUserId: e.target.value,
                    })
                  }
                  required
                  disabled={processing}
                >
                  <option value="">Selecione um jogador</option>
                  {otherPlayers.map((player) => (
                    <option key={player.userId} value={player.userId}>
                      {player.user?.nickname || "Usuário"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Valor</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={myBalance}
                  value={transferData.amount}
                  onChange={(e) =>
                    setTransferData({ ...transferData, amount: e.target.value })
                  }
                  placeholder="0,00"
                  required
                  disabled={processing}
                />
                <span className="form-hint">
                  Saldo disponível:{" "}
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(myBalance)}
                </span>
              </div>

              <div className="form-group">
                <label>Descrição (opcional)</label>
                <textarea
                  value={transferData.description}
                  onChange={(e) =>
                    setTransferData({
                      ...transferData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Motivo da transferência..."
                  rows={3}
                  disabled={processing}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowTransferModal(false)}
                  disabled={processing}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="confirm-button"
                  disabled={processing}
                >
                  {processing ? "Transferindo..." : "Transferir"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Empréstimo */}
      {showLoanModal && (
        <div className="modal-overlay" onClick={() => setShowLoanModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Fazer Empréstimo</h2>
              <button
                className="modal-close"
                onClick={() => setShowLoanModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleLoan} className="modal-form">
              <div className="form-group">
                <label>Valor do Empréstimo</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={loanData.amount}
                  onChange={(e) =>
                    setLoanData({ ...loanData, amount: e.target.value })
                  }
                  placeholder="0,00"
                  required
                  disabled={processing}
                />
              </div>

              <div className="form-group">
                <label>Motivo do Empréstimo *</label>
                <textarea
                  value={loanData.description}
                  onChange={(e) =>
                    setLoanData({ ...loanData, description: e.target.value })
                  }
                  placeholder="Descreva o motivo do empréstimo..."
                  rows={4}
                  required
                  disabled={processing}
                />
                <span className="form-hint">
                  É obrigatório informar o motivo do empréstimo
                </span>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowLoanModal(false)}
                  disabled={processing}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="confirm-button"
                  disabled={processing}
                >
                  {processing ? "Processando..." : "Solicitar Empréstimo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
