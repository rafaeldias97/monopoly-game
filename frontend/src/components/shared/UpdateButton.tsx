import { usePWAUpdate } from "../../hooks/usePWAUpdate";
import "./UpdateButton.css";

export default function UpdateButton() {
  const { updateAvailable, isUpdating, updateServiceWorker } = usePWAUpdate();

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="update-banner">
      <div className="update-banner-content">
        <div className="update-banner-text">
          <span className="update-icon">🔄</span>
          <span>Nova versão disponível!</span>
        </div>
        <button
          className="update-button"
          onClick={updateServiceWorker}
          disabled={isUpdating}
        >
          {isUpdating ? "Atualizando..." : "Atualizar Agora"}
        </button>
      </div>
    </div>
  );
}
