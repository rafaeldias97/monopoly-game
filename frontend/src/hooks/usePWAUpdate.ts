import { useEffect, useState } from 'react';

export function usePWAUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      let refreshing = false;

      // Detectar quando a página está sendo atualizada
      const handleControllerChange = () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      };

      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

      // Registrar service worker e verificar atualizações
      navigator.serviceWorker.ready
        .then((reg) => {
          setRegistration(reg);

          // Verificar atualizações periodicamente (a cada 1 hora)
          const checkForUpdates = () => {
            reg.update().catch((err) => {
              console.error('Erro ao verificar atualizações:', err);
            });
          };

          const interval = setInterval(checkForUpdates, 60 * 60 * 1000);

          // Listener para quando uma nova versão é encontrada
          const handleUpdateFound = () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed') {
                  // Verificar se já existe um service worker ativo
                  if (navigator.serviceWorker.controller) {
                    // Nova versão disponível (service worker esperando)
                    setUpdateAvailable(true);
                  } else {
                    // Primeira instalação
                    console.log('Service Worker instalado pela primeira vez');
                  }
                }
              });
            }
          };

          // Verificar se já há um service worker esperando
          if (reg.waiting && navigator.serviceWorker.controller) {
            setUpdateAvailable(true);
          }

          // Adicionar listener para novas atualizações
          reg.addEventListener('updatefound', handleUpdateFound);

          // Verificar atualizações imediatamente
          checkForUpdates();

          return () => {
            clearInterval(interval);
            reg.removeEventListener('updatefound', handleUpdateFound);
            navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
          };
        })
        .catch((err) => {
          console.error('Erro ao registrar service worker:', err);
        });
    }
  }, []);

  const updateServiceWorker = async () => {
    if (!registration || !registration.waiting) {
      console.warn('Nenhum service worker esperando para atualizar');
      return;
    }

    setIsUpdating(true);
    try {
      // Enviar mensagem para o service worker esperando pular a espera
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });

      // Aguardar um pouco antes de recarregar
      setTimeout(() => {
        window.location.reload();
      }, 300);
    } catch (error) {
      console.error('Erro ao atualizar service worker:', error);
      setIsUpdating(false);
    }
  };

  return {
    updateAvailable,
    isUpdating,
    updateServiceWorker,
  };
}

