import React from 'react';
import { Shield, LayoutGrid } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { AppIcon } from '../common/AppIcon';
import { SystemTray } from './SystemTray';
import { StartMenu } from './StartMenu';

export const Taskbar: React.FC = () => {
  const { 
    windows, 
    activeWindowId, 
    focusWindow, 
    minimizeWindow, 
    isStartMenuOpen, 
    toggleStartMenu,
    authorizedApps,
    openWindow
  } = useOS();

  // Pinned apps from authorized apps
  const pinnedApps = authorizedApps.filter(app => app.pinnedToDock);

  const handleWindowItemClick = (windowId: string, isMinimized: boolean) => {
    if (isMinimized) {
      focusWindow(windowId);
    } else if (activeWindowId === windowId) {
      minimizeWindow(windowId);
    } else {
      focusWindow(windowId);
    }
  };

  return (
    <div className="relative w-full h-12 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 flex items-center justify-between px-2 select-none z-[9000]">
      {/* Start Menu Popup */}
      {isStartMenuOpen && <StartMenu />}

      {/* Left: Start Button & App Launchers */}
      <div className="flex items-center gap-1.5 h-full">
        {/* Start Button */}
        <button
          onClick={toggleStartMenu}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
            isStartMenuOpen
              ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800'
          }`}
        >
          <div className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center text-blue-400">
            <Shield className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="text-xs font-bold tracking-tight">ESDINeX</span>
        </button>

        <div className="h-5 w-[1px] bg-slate-800 mx-1" />

        {/* Pinned / Quick Launch Shortcuts */}
        <div className="hidden sm:flex items-center gap-1">
          {pinnedApps.slice(0, 4).map(app => {
            const isRunning = windows.some(w => w.appId === app.id);
            return (
              <button
                key={app.id}
                onClick={() => openWindow(app.id)}
                title={app.title}
                className={`p-1.5 rounded-lg transition-colors relative group ${
                  isRunning ? 'bg-slate-800/60' : 'hover:bg-slate-900'
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center text-slate-300 group-hover:text-blue-400 transition-colors">
                  <AppIcon name={app.iconName} className="w-4 h-4" />
                </div>
                {isRunning && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-0.5 bg-blue-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Separator if there are running windows */}
        {windows.length > 0 && <div className="h-5 w-[1px] bg-slate-800 mx-1" />}

        {/* Running Windows Tabs in Taskbar */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-xl">
          {windows.map(win => {
            const isActive = activeWindowId === win.id && !win.isMinimized;

            return (
              <button
                key={win.id}
                onClick={() => handleWindowItemClick(win.id, win.isMinimized)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs max-w-[180px] transition-all truncate ${
                  isActive
                    ? 'bg-slate-800 text-white border-slate-700 shadow-sm'
                    : win.isMinimized
                    ? 'bg-slate-950/40 text-slate-500 border-slate-900 hover:bg-slate-900'
                    : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800/80'
                }`}
              >
                <div className="w-4 h-4 shrink-0 text-blue-400">
                  <AppIcon name={win.iconName} className="w-3.5 h-3.5" />
                </div>
                <span className="truncate text-[11px] font-medium">{win.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: System Tray */}
      <SystemTray />
    </div>
  );
};
