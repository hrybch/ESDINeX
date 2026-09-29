import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { 
  AppDefinition, 
  WindowInstance, 
  UserRole, 
  UserProfile, 
  WindowBounds, 
  SystemNotification,
  EsdiTicket
} from '../types/os';
import { DEFAULT_APPS_REGISTRY, INITIAL_USERS, INITIAL_ESDI_TICKETS } from '../data/appsData';

interface OSContextType {
  // Authentication & 2FA
  isAuthenticated: boolean;
  isLocked: boolean;
  loginWith2FA: (credentials: { email: string; password?: string; token2fa: string; method?: string }) => boolean;
  logout: () => void;
  lockSession: () => void;
  unlockSession: (token2fa: string) => boolean;

  // Users Management
  users: UserProfile[];
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  addUser: (user: UserProfile) => void;
  updateUser: (id: string, updates: Partial<UserProfile>) => void;
  deleteUser: (id: string) => { success: boolean; message: string };
  setUserRole: (role: UserRole) => void;

  // Apps & Window Management
  allApps: AppDefinition[];
  authorizedApps: AppDefinition[];
  registerApp: (app: AppDefinition) => void;
  removeCustomApp: (appId: string) => void;
  deleteApp: (appId: string) => boolean;
  restoreDefaultApps: () => void;
  windows: WindowInstance[];
  activeWindowId: string | null;
  openWindow: (appId: string, customData?: Record<string, unknown>) => void;
  closeWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  toggleMaximizeWindow: (windowId: string) => void;
  focusWindow: (windowId: string) => void;
  updateWindowBounds: (windowId: string, bounds: Partial<WindowBounds>) => void;
  isStartMenuOpen: boolean;
  toggleStartMenu: () => void;
  closeStartMenu: () => void;
  notifications: SystemNotification[];
  addNotification: (notification: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  systemTime: string;
  launchLocalExecutable: (app: Partial<AppDefinition>) => Promise<{ success: boolean; message?: string; error?: string }>;

  // Central Tickets
  tickets: EsdiTicket[];
  addTicket: (ticket: EsdiTicket) => void;
  resolveTicket: (ticketId: string) => void;
}

const OSContext = createContext<OSContextType | null>(null);

let zIndexCounter = 100;

export const OSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistent users list in localStorage
  const [users, setUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('esdinex_users_registry');
      return saved ? JSON.parse(saved) : Object.values(INITIAL_USERS);
    } catch {
      return Object.values(INITIAL_USERS);
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('esdinex_users_registry', JSON.stringify(users));
    } catch {
      // ignore
    }
  }, [users]);

  // Current active user
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    return users[0] || INITIAL_USERS.SUPORTE_N1;
  });

  // Auth & 2FA State (checks sessionStorage)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('esdinex_auth_state') === 'true';
    } catch {
      return false;
    }
  });

  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Custom apps stored in localStorage
  const [customApps, setCustomApps] = useState<AppDefinition[]>(() => {
    try {
      const saved = localStorage.getItem('cartorio_os_custom_apps');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Tickets stored in localStorage
  const [tickets, setTickets] = useState<EsdiTicket[]>(() => {
    try {
      const saved = localStorage.getItem('cartorio_os_esdi_tickets');
      return saved ? JSON.parse(saved) : INITIAL_ESDI_TICKETS;
    } catch {
      return INITIAL_ESDI_TICKETS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cartorio_os_esdi_tickets', JSON.stringify(tickets));
    } catch {
      // ignore
    }
  }, [tickets]);

  useEffect(() => {
    try {
      localStorage.setItem('cartorio_os_custom_apps', JSON.stringify(customApps));
    } catch {
      // ignore
    }
  }, [customApps]);

  // Deleted app ids blacklist stored in localStorage
  const [deletedAppIds, setDeletedAppIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cartorio_os_deleted_app_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cartorio_os_deleted_app_ids', JSON.stringify(deletedAppIds));
    } catch {
      // ignore
    }
  }, [deletedAppIds]);

  const allApps = useMemo(() => {
    return [...DEFAULT_APPS_REGISTRY, ...customApps].filter(
      app => !deletedAppIds.includes(app.id)
    );
  }, [customApps, deletedAppIds]);

  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);

  const [systemTime, setSystemTime] = useState<string>(() => {
    const d = new Date();
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setSystemTime(d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: 'notif_1',
      title: 'Central de Chamados ESDI',
      message: 'Sessão conectada à API REST do GLPI (sistema.esdi.com.br).',
      type: 'info',
      timestamp: '09:00',
      read: false,
    },
    {
      id: 'notif_2',
      title: 'Autenticação 2FA Ativa',
      message: 'Sessão validada com sucesso com dois fatores de autenticação.',
      type: 'success',
      timestamp: '08:58',
      read: true,
    }
  ]);

  // RBAC: Filter apps allowed explicitly for current active role
  const authorizedApps = useMemo(() => {
    return allApps.filter(app => app.allowedRoles.includes(currentUser.role));
  }, [allApps, currentUser.role]);

  // 2FA Auth Handlers
  const loginWith2FA = useCallback((credentials: { email: string; password?: string; token2fa: string; method?: string }): boolean => {
    const matchedUser = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase()) || users[0];
    
    if (matchedUser.status === 'bloqueado') {
      return false;
    }

    const updatedUser = {
      ...matchedUser,
      lastLogin: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' de hoje',
    };

    setCurrentUser(updatedUser);
    setIsAuthenticated(true);
    setIsLocked(false);

    try {
      sessionStorage.setItem('esdinex_auth_state', 'true');
    } catch {
      // ignore
    }

    return true;
  }, [users]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setIsLocked(false);
    try {
      sessionStorage.removeItem('esdinex_auth_state');
    } catch {
      // ignore
    }
  }, []);

  const lockSession = useCallback(() => {
    setIsLocked(true);
  }, []);

  const unlockSession = useCallback((token2fa: string): boolean => {
    if (token2fa) {
      setIsLocked(false);
      return true;
    }
    return false;
  }, []);

  // User Management Handlers
  const addUser = useCallback((newUser: UserProfile) => {
    setUsers(prev => [newUser, ...prev]);
  }, []);

  const updateUser = useCallback((id: string, updates: Partial<UserProfile>) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === id) {
          const updated = { ...u, ...updates };
          if (currentUser.id === id) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
  }, [currentUser.id]);

  const deleteUser = useCallback((id: string): { success: boolean; message: string } => {
    // 1. Regra de Segurança: Não permitir excluir a própria conta logada
    if (id === currentUser.id) {
      return {
        success: false,
        message: 'Você não pode excluir a sua própria conta enquanto estiver logado com ela.',
      };
    }

    // 2. Regra de Segurança: Não permitir excluir o último usuário do sistema
    if (users.length <= 1) {
      return {
        success: false,
        message: 'O sistema deve possuir pelo menos um usuário técnico ativo cadastrado.',
      };
    }

    const userToDelete = users.find(u => u.id === id);
    if (!userToDelete) {
      return {
        success: false,
        message: 'Usuário não encontrado.',
      };
    }

    setUsers(prev => {
      const remaining = prev.filter(u => u.id !== id);
      try {
        localStorage.setItem('esdinex_users_registry', JSON.stringify(remaining));
      } catch {
        // ignore
      }
      return remaining;
    });

    // Notificação de auditoria
    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        title: 'Usuário Removido',
        message: `O cadastro do usuário "${userToDelete.name}" (${userToDelete.email}) foi removido.`,
        type: 'warning',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        read: false,
      },
      ...prev,
    ]);

    return {
      success: true,
      message: `Usuário "${userToDelete.name}" excluído com sucesso do sistema.`,
    };
  }, [currentUser.id, users]);

  const setUserRole = useCallback((role: UserRole) => {
    const user = users.find(u => u.role === role) || {
      ...currentUser,
      role,
    };
    setCurrentUser(user);
  }, [users, currentUser]);

  const registerApp = useCallback((newApp: AppDefinition) => {
    // Se o ID estava na lista de deletados, remove da lista de deletados
    setDeletedAppIds(prev => prev.filter(id => id !== newApp.id));
    setCustomApps(prev => {
      const filtered = prev.filter(a => a.id !== newApp.id);
      return [...filtered, newApp];
    });
  }, []);

  const deleteApp = useCallback((appId: string): boolean => {
    const targetApp = allApps.find(a => a.id === appId);

    // 1. Adiciona à lista de deletados (para apps padrão ou customizados)
    setDeletedAppIds(prev => Array.from(new Set([...prev, appId])));

    // 2. Remove da lista de customizados
    setCustomApps(prev => prev.filter(a => a.id !== appId));

    // 3. Fecha todas as janelas abertas deste aplicativo
    setWindows(prev => prev.filter(w => w.appId !== appId));

    // 4. Reseta a janela ativa se pertencia ao app excluído
    setActiveWindowId(currentActive => {
      const activeWindow = windows.find(w => w.id === currentActive);
      return activeWindow?.appId === appId ? null : currentActive;
    });

    // 5. Emite notificação de auditoria
    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        title: 'Aplicativo Excluído',
        message: `O atalho "${targetApp?.title || appId}" foi removido do ESDINeX.`,
        type: 'warning',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        read: false,
      },
      ...prev,
    ]);

    return true;
  }, [allApps, windows]);

  const removeCustomApp = useCallback((appId: string) => {
    deleteApp(appId);
  }, [deleteApp]);

  const restoreDefaultApps = useCallback(() => {
    setDeletedAppIds([]);
    try {
      localStorage.removeItem('cartorio_os_deleted_app_ids');
    } catch {
      // ignore
    }
    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        title: 'Aplicativos Padrão Restaurados',
        message: 'Todos os aplicativos padrão do ESDINeX foram restaurados.',
        type: 'success',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        read: false,
      },
      ...prev,
    ]);
  }, []);

  const addTicket = useCallback((ticket: EsdiTicket) => {
    setTickets(prev => [ticket, ...prev]);
  }, []);

  const resolveTicket = useCallback((ticketId: string) => {
    setTickets(prev =>
      prev.map(t => (t.id === ticketId ? { ...t, status: 'SOLUCIONADO' } : t))
    );
  }, []);

  const focusWindow = useCallback((windowId: string) => {
    zIndexCounter += 1;
    setWindows(prev =>
      prev.map(w =>
        w.id === windowId
          ? { ...w, zIndex: zIndexCounter, isMinimized: false }
          : w
      )
    );
    setActiveWindowId(windowId);
  }, []);

  const launchLocalExecutable = useCallback(async (app: Partial<AppDefinition>): Promise<{ success: boolean; message?: string; error?: string }> => {
    const targetPath = app.executablePath || app.url || '';
    const args = app.executableArgs || [];

    try {
      const response = await fetch('/api/launch-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: targetPath,
          args,
          protocolUri: app.protocolUri,
          title: app.title || 'Aplicativo Local',
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setNotifications(prev => [
          {
            id: `notif_${Date.now()}`,
            title: `${app.title || 'Aplicativo'} Iniciado`,
            message: `Executado na máquina local: ${targetPath}`,
            type: 'success',
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            read: false,
          },
          ...prev,
        ]);
        return { success: true, message: data.message };
      } else {
        throw new Error(data.error || 'Falha ao executar via API local');
      }
    } catch (err: any) {
      if (app.protocolUri) {
        window.location.href = app.protocolUri;
        setNotifications(prev => [
          {
            id: `notif_${Date.now()}`,
            title: `Iniciando ${app.title || 'Aplicativo'}`,
            message: `Tentativa disparada via protocolo: ${app.protocolUri}`,
            type: 'info',
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            read: false,
          },
          ...prev,
        ]);
        return { success: true, message: `Disparado via protocolo ${app.protocolUri}` };
      }

      setNotifications(prev => [
        {
          id: `notif_${Date.now()}`,
          title: `Falha ao Abrir ${app.title || 'Programa'}`,
          message: `Não foi possível iniciar "${targetPath}". Verifique se o executável existe nesta máquina.`,
          type: 'alert',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          read: false,
        },
        ...prev,
      ]);
      return { success: false, error: err?.message || 'Erro ao executar o programa' };
    }
  }, []);

  const openWindow = useCallback((appId: string, customData?: Record<string, unknown>) => {
    const app = allApps.find(a => a.id === appId);
    if (!app) return;

    setIsStartMenuOpen(false);

    // Se for atalho para executável instalado na máquina local
    if (app.embedType === 'executable') {
      launchLocalExecutable(app);
      return;
    }

    // If already open, bring to front
    const existing = windows.find(w => w.appId === appId);
    if (existing) {
      focusWindow(existing.id);
      return;
    }

    zIndexCounter += 1;
    const offset = (windows.length % 5) * 36;
    const defaultW = Math.min(app.defaultWidth || 900, window.innerWidth - 60);
    const defaultH = Math.min(app.defaultHeight || 600, window.innerHeight - 100);

    const initialX = Math.max(30, Math.min(60 + offset, window.innerWidth - defaultW - 30));
    const initialY = Math.max(30, Math.min(40 + offset, window.innerHeight - defaultH - 60));

    const newWindow: WindowInstance = {
      id: `win_${app.id}_${Date.now()}`,
      appId: app.id,
      title: app.title,
      iconName: app.iconName,
      bounds: {
        x: initialX,
        y: initialY,
        width: defaultW,
        height: defaultH,
      },
      isMinimized: false,
      isMaximized: false,
      zIndex: zIndexCounter,
      embedType: app.embedType,
      url: app.url,
      blocksIframe: app.blocksIframe,
      customData,
    };

    setWindows(prev => [...prev, newWindow]);
    setActiveWindowId(newWindow.id);
  }, [allApps, windows, focusWindow]);

  const closeWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.filter(w => w.id !== windowId));
    setActiveWindowId(prev => (prev === windowId ? null : prev));
  }, []);

  const minimizeWindow = useCallback((windowId: string) => {
    setWindows(prev =>
      prev.map(w => (w.id === windowId ? { ...w, isMinimized: true } : w))
    );
    setActiveWindowId(prev => (prev === windowId ? null : prev));
  }, []);

  const toggleMaximizeWindow = useCallback((windowId: string) => {
    setWindows(prev =>
      prev.map(w => {
        if (w.id !== windowId) return w;
        if (w.isMaximized) {
          return {
            ...w,
            isMaximized: false,
            bounds: w.previousBounds || w.bounds,
          };
        } else {
          return {
            ...w,
            isMaximized: true,
            previousBounds: { ...w.bounds },
            bounds: {
              x: 0,
              y: 0,
              width: window.innerWidth,
              height: window.innerHeight - 48,
            },
          };
        }
      })
    );
  }, []);

  const updateWindowBounds = useCallback((windowId: string, newBounds: Partial<WindowBounds>) => {
    setWindows(prev =>
      prev.map(w => {
        if (w.id !== windowId) return w;
        return {
          ...w,
          bounds: { ...w.bounds, ...newBounds },
        };
      })
    );
  }, []);

  const toggleStartMenu = useCallback(() => {
    setIsStartMenuOpen(prev => !prev);
  }, []);

  const closeStartMenu = useCallback(() => {
    setIsStartMenuOpen(false);
  }, []);

  const addNotification = useCallback((notif: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: SystemNotification = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  // Open Central de Chamados by default on first load
  useEffect(() => {
    if (windows.length === 0) {
      openWindow('app_central_chamados');
    }
  }, []);

  return (
    <OSContext.Provider
      value={{
        isAuthenticated,
        isLocked,
        loginWith2FA,
        logout,
        lockSession,
        unlockSession,
        users,
        currentUser,
        setCurrentUser,
        addUser,
        updateUser,
        deleteUser,
        setUserRole,
        allApps,
        authorizedApps,
        registerApp,
        removeCustomApp,
        deleteApp,
        restoreDefaultApps,
        windows,
        activeWindowId,
        openWindow,
        closeWindow,
        minimizeWindow,
        toggleMaximizeWindow,
        focusWindow,
        updateWindowBounds,
        isStartMenuOpen,
        toggleStartMenu,
        closeStartMenu,
        notifications,
        addNotification,
        markNotificationAsRead,
        systemTime,
        launchLocalExecutable,
        tickets,
        addTicket,
        resolveTicket,
      }}
    >
      {children}
    </OSContext.Provider>
  );
};

export const useOS = (): OSContextType => {
  const context = useContext(OSContext);
  if (!context) {
    throw new Error('useOS must be used within an OSProvider');
  }
  return context;
};
