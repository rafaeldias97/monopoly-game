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

// Fazer backup do token e usuário
const backupData = () => {
  if (!ensureLocalStorage()) return;
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = localStorage.getItem(USER_KEY);
    if (token) {
      localStorage.setItem(TOKEN_BACKUP_KEY, token);
    }
    if (user) {
      localStorage.setItem(USER_BACKUP_KEY, user);
    }
  } catch (error) {
    console.error('Erro ao fazer backup:', error);
  }
};

// Restaurar token e usuário do backup
const restoreFromBackup = () => {
  if (!ensureLocalStorage()) return;
  try {
    const backupToken = localStorage.getItem(TOKEN_BACKUP_KEY);
    const backupUser = localStorage.getItem(USER_BACKUP_KEY);
    
    if (backupToken && !localStorage.getItem(TOKEN_KEY)) {
      localStorage.setItem(TOKEN_KEY, backupToken);
    }
    if (backupUser && !localStorage.getItem(USER_KEY)) {
      localStorage.setItem(USER_KEY, backupUser);
    }
  } catch (error) {
    console.error('Erro ao restaurar backup:', error);
  }
};

// Restaurar ao carregar o módulo
if (typeof window !== 'undefined') {
  restoreFromBackup();
  
  // Fazer backup periodicamente
  setInterval(backupData, 5000); // A cada 5 segundos
  
  // Fazer backup antes de fechar
  window.addEventListener('beforeunload', backupData);
  window.addEventListener('pagehide', backupData);
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

