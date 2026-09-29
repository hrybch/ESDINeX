import React from 'react';
import { useOS } from '../../context/OSContext';
import { DesktopIcon } from './DesktopIcon';
import { WindowFrame } from '../window/WindowFrame';
import { Taskbar } from '../dock/Taskbar';
import { ShieldCheck, PlusSquare, Users, Lock, LogOut } from 'lucide-react';
import { Login2FAScreen } from '../auth/Login2FAScreen';

export const Desktop: React.FC = () => {
  const { 
    authorizedApps, 
    openWindow, 
    windows, 
    closeStartMenu,
    currentUser,
    isAuthenticated,
    isLocked,
    lockSession,
    logout
  } = useOS();

  // If user is unauthenticated or session is locked, render the 2FA login screen
  if (!isAuthenticated || isLocked) {
    return <Login2FAScreen />;
  }

  // Desktop icons (only apps that belong to currentUser.role and flagged for desktop)
  const desktopApps = authorizedApps.filter(app => app.onDesktop);

  const handleDesktopClick = () => {
    closeStartMenu();
  };

  return (
    <div 
      onClick={handleDesktopClick}
      className="relative w-screen h-screen overflow-hidden select-none bg-slate-950 flex flex-col font-sans"
    >
      {/* Wallpaper Image with gradient overlays and crisp depth */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src="/src/assets/images/cartorio_os_wallpaper_1790688528097.jpg"
          alt="ESDINeX Wallpaper"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/80" />
      </div>

      {/* Top OS System Bar */}
      <header className="relative z-10 h-8 px-4 bg-slate-950/70 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-300">
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-white tracking-tight">ESDINeX</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400">Extranet & Central de Suporte de TI</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-500 font-mono text-[10px]">sistema.esdi.com.br</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Action Button: Gerenciador de Usuários */}
          <button
            onClick={() => openWindow('app_gerenciador_usuarios')}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium transition-colors border border-slate-700 text-[11px]"
            title="Abrir Gerenciador de Usuários e 2FA"
          >
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>Usuários</span>
          </button>

          {/* Quick Action Button: Cadastrar Aplicativo */}
          <button
            onClick={() => openWindow('app_cadastrar_app')}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors shadow-sm text-[11px]"
          >
            <PlusSquare className="w-3.5 h-3.5" />
            <span>Cadastrar Aplicativo</span>
          </button>

          <span className="text-slate-700">|</span>

          {/* Security status */}
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[10px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>2FA Ativo</span>
          </div>

          <span className="text-slate-700">·</span>

          {/* User info */}
          <div className="text-slate-400 text-[11px] flex items-center gap-1">
            <span>{currentUser.name.split(' ')[0]}</span>
            <span className="text-blue-400 font-mono font-medium">({currentUser.role})</span>
          </div>

          <span className="text-slate-700">|</span>

          {/* Lock Session (2FA) */}
          <button
            onClick={lockSession}
            title="Bloquear sessão com senha e 2FA"
            className="flex items-center gap-1 px-2 py-0.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors"
          >
            <Lock className="w-3 h-3 text-amber-400" />
            <span className="text-[10px]">Bloquear</span>
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            title="Encerrar sessão"
            className="p-1 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 rounded transition-colors"
          >
            <LogOut className="w-3 h-3" />
          </button>
        </div>
      </header>

      {/* Desktop Workspace Area */}
      <main className="relative flex-1 p-6 z-10 overflow-hidden">
        {/* Desktop Icons Grid */}
        <div className="flex flex-col flex-wrap items-start content-start gap-5 h-full max-h-[calc(100vh-120px)] w-fit z-10">
          {desktopApps.map(app => (
            <DesktopIcon key={app.id} app={app} onOpen={openWindow} />
          ))}
        </div>

        {/* Windows Layer */}
        {windows.map(win => (
          <WindowFrame key={win.id} windowData={win} />
        ))}
      </main>

      {/* Taskbar / Dock Container at the bottom */}
      <Taskbar />
    </div>
  );
};
