import React, { useState } from 'react';
import { 
  Bell, 
  Wifi, 
  ShieldCheck, 
  ChevronUp, 
  Check, 
  X, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { UserRole } from '../../types/os';
import { INITIAL_USERS } from '../../data/appsData';

export const SystemTray: React.FC = () => {
  const { 
    currentUser, 
    setUserRole, 
    notifications, 
    markNotificationAsRead, 
    systemTime 
  } = useOS();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const roles: { role: UserRole; label: string }[] = [
    { role: 'SUPORTE_N1', label: 'Suporte Nível 1' },
    { role: 'SUPORTE_N2_ADMIN', label: 'Suporte N2 / Admin' },
    { role: 'FINANCEIRO', label: 'Financeiro' },
    { role: 'GESTOR_CARTORIO', label: 'Tabelião / Gestor' },
  ];

  return (
    <div className="relative flex items-center gap-1.5 h-full px-2 select-none text-xs">
      {/* Notifications Popover */}
      {showNotifications && (
        <div 
          onClick={e => e.stopPropagation()}
          className="absolute bottom-12 right-2 w-80 max-h-96 flex flex-col bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-[9999] overflow-hidden"
        >
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <span className="font-semibold text-white text-xs">Notificações do Sistema</span>
            <span className="text-[10px] text-slate-400 font-mono">{unreadCount} não lidas</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
            {notifications.map(n => (
              <div 
                key={n.id} 
                onClick={() => markNotificationAsRead(n.id)}
                className={`p-2.5 rounded-lg transition-colors cursor-pointer ${
                  n.read ? 'bg-slate-900/20 text-slate-400' : 'bg-slate-900/60 text-slate-200 border-l-2 border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="text-xs font-semibold text-white">{n.title}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{n.timestamp}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Role Switcher Popover */}
      {showRoleMenu && (
        <div 
          onClick={e => e.stopPropagation()}
          className="absolute bottom-12 right-16 w-56 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-[9999] p-2 space-y-1"
        >
          <div className="px-2 py-1 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            Alternar Perfil RBAC
          </div>
          {roles.map(r => (
            <button
              key={r.role}
              onClick={() => {
                setUserRole(r.role);
                setShowRoleMenu(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                currentUser.role === r.role
                  ? 'bg-blue-600/20 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span>{r.label}</span>
              {currentUser.role === r.role && <Check className="w-3.5 h-3.5 text-blue-400" />}
            </button>
          ))}
        </div>
      )}

      {/* Role Indicator Button */}
      <button
        onClick={() => {
          setShowRoleMenu(prev => !prev);
          setShowNotifications(false);
        }}
        className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-800/80 text-slate-300 text-[11px] transition-colors"
        title="Perfil RBAC Ativo (Clique para alternar)"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="font-mono text-[11px] font-medium max-w-[110px] truncate">
          {currentUser.role}
        </span>
        <ChevronUp className="w-3 h-3 text-slate-500" />
      </button>

      {/* Network / VPN badge */}
      <div 
        className="flex items-center gap-1 px-1.5 py-1 text-slate-400 hover:text-slate-200 transition-colors" 
        title="WireGuard VPN Conectada com Serventias"
      >
        <Wifi className="w-3.5 h-3.5 text-emerald-400" />
      </div>

      {/* Notification Bell */}
      <button
        onClick={() => {
          setShowNotifications(prev => !prev);
          setShowRoleMenu(false);
        }}
        className="relative p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded transition-colors"
        title="Notificações"
      >
        <Bell className="w-3.5 h-3.5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
        )}
      </button>

      {/* System Clock */}
      <div className="px-2 py-1 text-slate-300 font-mono text-xs tabular-nums text-right">
        <div>{systemTime}</div>
      </div>
    </div>
  );
};
