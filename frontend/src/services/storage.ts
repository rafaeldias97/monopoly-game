const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const TOKEN_BACKUP_KEY = '__token_backup__';
const USER_BACKUP_KEY = '__user_backup__';

// Garantir que o localStorage persista
const ensureLocalStorage = () => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

// Fazer backup do token e usuário (localStorage + sessionStorage)
const backupData = () => {
  if (!ensureLocalStorage()) return;
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = localStorage.getItem(USER_KEY);
    
    if (token) {
      // Backup em localStorage
      localStorage.setItem(TOKEN_BACKUP_KEY, token);
      // Backup também em sessionStorage como fallback
      try {
        sessionStorage.setItem(TOKEN_BACKUP_KEY, token);
      } catch (e) {
        // sessionStorage pode estar cheio, ignorar
      }
    }
    
    if (user) {
      // Backup em localStorage
      localStorage.setItem(USER_BACKUP_KEY, user);
      // Backup também em sessionStorage como fallback
      try {
        sessionStorage.setItem(USER_BACKUP_KEY, user);
      } catch (e) {
        // sessionStorage pode estar cheio, ignorar
      }
    }
  } catch (error) {
    console.error('Erro ao fazer backup:', error);
  }
};

// Restaurar token e usuário do backup (tenta localStorage primeiro, depois sessionStorage)
const restoreFromBackup = () => {
  if (!ensureLocalStorage()) return;
  try {
    // Tentar restaurar do localStorage backup
    let backupToken = localStorage.getItem(TOKEN_BACKUP_KEY);
    let backupUser = localStorage.getItem(USER_BACKUP_KEY);
    
    // Se não encontrar no localStorage, tentar sessionStorage
    if (!backupToken) {
      try {
        backupToken = sessionStorage.getItem(TOKEN_BACKUP_KEY);
      } catch (e) {
        // sessionStorage não disponível
      }
    }
    
    if (!backupUser) {
      try {
        backupUser = sessionStorage.getItem(USER_BACKUP_KEY);
      } catch (e) {
        // sessionStorage não disponível
      }
    }
    
    // Restaurar se encontrar backup e não tiver valor principal
    if (backupToken && !localStorage.getItem(TOKEN_KEY)) {
      localStorage.setItem(TOKEN_KEY, backupToken);
      // Atualizar backup também
      localStorage.setItem(TOKEN_BACKUP_KEY, backupToken);
    }
    
    if (backupUser && !localStorage.getItem(USER_KEY)) {
      localStorage.setItem(USER_KEY, backupUser);
      // Atualizar backup também
      localStorage.setItem(USER_BACKUP_KEY, backupUser);
    }
  } catch (error) {
    console.error('Erro ao restaurar backup:', error);
  }
};

// Restaurar ao carregar o módulo
if (typeof window !== 'undefined') {
  // Restaurar imediatamente ao carregar
  restoreFromBackup();
  
  // Fazer backup periodicamente
  setInterval(backupData, 3000); // A cada 3 segundos (mais frequente)
  
  // Fazer backup antes de fechar
  window.addEventListener('beforeunload', backupData);
  window.addEventListener('pagehide', backupData);
  window.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      backupData(); // Fazer backup quando app vai para background
    } else {
      restoreFromBackup(); // Restaurar quando app volta ao foreground
    }
  });
  
  // Restaurar quando a página fica visível novamente
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      restoreFromBackup();
    }
  });
}

export const storage = {
  setToken(token: string): void {
    if (ensureLocalStorage()) {
      try {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(TOKEN_BACKUP_KEY, token); // Backup imediato
      } catch (error) {
        console.error('Erro ao salvar token:', error);
      }
    }
  },

  getToken(): string | null {
    if (!ensureLocalStorage()) return null;
    try {
      let token = localStorage.getItem(TOKEN_KEY);
      
      // Se não encontrar, tentar restaurar do backup
      if (!token) {
        restoreFromBackup();
        token = localStorage.getItem(TOKEN_KEY);
      }
      
      return token;
    } catch (error) {
      console.error('Erro ao ler token:', error);
      return null;
    }
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  setUser(user: { id: string; nickname: string }): void {
    if (ensureLocalStorage()) {
      try {
        const userStr = JSON.stringify(user);
        localStorage.setItem(USER_KEY, userStr);
        localStorage.setItem(USER_BACKUP_KEY, userStr); // Backup imediato
      } catch (error) {
        console.error('Erro ao salvar usuário:', error);
      }
    }
  },

  getUser(): { id: string; nickname: string } | null {
    if (!ensureLocalStorage()) return null;
    try {
      let userStr = localStorage.getItem(USER_KEY);
      
      // Se não encontrar, tentar restaurar do backup
      if (!userStr) {
        restoreFromBackup();
        userStr = localStorage.getItem(USER_KEY);
      }
      
      if (!userStr) return null;
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Erro ao ler usuário:', error);
      return null;
    }
  },

  removeUser(): void {
    localStorage.removeItem(USER_KEY);
  },

  clear(): void {
    this.removeToken();
    this.removeUser();
  },
};

