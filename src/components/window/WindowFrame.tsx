import React, { useState, useRef } from 'react';
import { Minus, Square, Copy, X } from 'lucide-react';
import { WindowInstance } from '../../types/os';
import { useOS } from '../../context/OSContext';
import { AppIcon } from '../common/AppIcon';
import { CentralChamadosEsdi } from '../apps/CentralChamadosEsdi';
import { CadastrarNovoApp } from '../apps/CadastrarNovoApp';
import { CartorioTerminalOS } from '../apps/CartorioTerminalOS';
import { GerenciadorUsuarios } from '../apps/GerenciadorUsuarios';
import { IframeViewer } from '../apps/IframeViewer';

interface WindowFrameProps {
  windowData: WindowInstance;
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export const WindowFrame: React.FC<WindowFrameProps> = ({ windowData }) => {
  const { 
    activeWindowId, 
    focusWindow, 
    closeWindow, 
    minimizeWindow, 
    toggleMaximizeWindow, 
    updateWindowBounds 
  } = useOS();

  const isFocused = activeWindowId === windowData.id;
  const isMaximized = windowData.isMaximized;

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; winX: number; winY: number }>({
    mouseX: 0,
    mouseY: 0,
    winX: 0,
    winY: 0,
  });

  // Resizing state
  const [resizingDir, setResizingDir] = useState<ResizeDirection | null>(null);
  const resizeStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    x: number;
    y: number;
    w: number;
    h: number;
  }>({ mouseX: 0, mouseY: 0, x: 0, y: 0, w: 0, h: 0 });

  // 1. DRAG HANDLERS
  const handleTitlePointerDown = (e: React.PointerEvent) => {
    if (isMaximized || e.button !== 0) return;
    focusWindow(windowData.id);
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      winX: windowData.bounds.x,
      winY: windowData.bounds.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleTitlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.mouseX;
    const deltaY = e.clientY - dragStartRef.current.mouseY;

    // Bounds safety: Keep window header accessible within viewport
    const newX = Math.max(-windowData.bounds.width + 100, Math.min(dragStartRef.current.winX + deltaX, window.innerWidth - 100));
    const newY = Math.max(0, Math.min(dragStartRef.current.winY + deltaY, window.innerHeight - 70));

    updateWindowBounds(windowData.id, { x: newX, y: newY });
  };

  const handleTitlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  // 2. RESIZE HANDLERS
  const handleResizePointerDown = (dir: ResizeDirection, e: React.PointerEvent) => {
    if (isMaximized || e.button !== 0) return;
    e.stopPropagation();
    focusWindow(windowData.id);
    setResizingDir(dir);
    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      x: windowData.bounds.x,
      y: windowData.bounds.y,
      w: windowData.bounds.width,
      h: windowData.bounds.height,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleResizePointerMove = (e: React.PointerEvent) => {
    if (!resizingDir) return;
    const deltaX = e.clientX - resizeStartRef.current.mouseX;
    const deltaY = e.clientY - resizeStartRef.current.mouseY;

    const minW = 380;
    const minH = 260;
    let { x, y, w, h } = resizeStartRef.current;

    if (resizingDir.includes('e')) {
      w = Math.max(minW, w + deltaX);
    }
    if (resizingDir.includes('s')) {
      h = Math.max(minH, h + deltaY);
    }
    if (resizingDir.includes('w')) {
      const possibleW = w - deltaX;
      if (possibleW >= minW) {
        w = possibleW;
        x = x + deltaX;
      }
    }
    if (resizingDir.includes('n')) {
      const possibleH = h - deltaY;
      if (possibleH >= minH) {
        h = possibleH;
        y = y + deltaY;
      }
    }

    updateWindowBounds(windowData.id, { x, y, width: w, height: h });
  };

  const handleResizePointerUp = (e: React.PointerEvent) => {
    if (resizingDir) {
      setResizingDir(null);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  // Routing clean core apps
  const renderAppContent = () => {
    switch (windowData.appId) {
      case 'app_central_chamados':
        return <CentralChamadosEsdi />;
      case 'app_cadastrar_app':
        return <CadastrarNovoApp />;
      case 'app_gerenciador_usuarios':
        return <GerenciadorUsuarios />;
      case 'app_terminal_os':
        return <CartorioTerminalOS />;
      default:
        return (
          <IframeViewer
            url={windowData.url}
            title={windowData.title}
            blocksIframe={windowData.blocksIframe}
          />
        );
    }
  };

  if (windowData.isMinimized) {
    return null;
  }

  const { x, y, width, height } = windowData.bounds;

  return (
    <div
      onPointerDown={() => focusWindow(windowData.id)}
      style={{
        transform: `translate3d(${x}px, ${y}px, 0)`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex: windowData.zIndex,
      }}
      className={`fixed top-0 left-0 flex flex-col rounded-xl overflow-hidden border shadow-2xl transition-shadow ${
        isFocused
          ? 'border-slate-700/90 ring-1 ring-blue-500/30 shadow-blue-950/40 bg-slate-950'
          : 'border-slate-800/80 shadow-black/60 opacity-95 bg-slate-950'
      }`}
    >
      {/* Window Title Bar */}
      <div
        onPointerDown={handleTitlePointerDown}
        onPointerMove={handleTitlePointerMove}
        onPointerUp={handleTitlePointerUp}
        onDoubleClick={() => toggleMaximizeWindow(windowData.id)}
        className={`h-10 px-3.5 flex items-center justify-between border-b select-none cursor-move transition-colors ${
          isFocused
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-slate-900/80 border-slate-800/70 text-slate-400'
        }`}
      >
        {/* Left: Icon & Title */}
        <div className="flex items-center gap-2.5 min-w-0 pr-3">
          <div className="w-5 h-5 flex items-center justify-center text-blue-400 shrink-0">
            <AppIcon name={windowData.iconName} className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold tracking-tight truncate">
            {windowData.title}
          </span>
        </div>

        {/* Right: Window Controls */}
        <div className="flex items-center gap-1 shrink-0" onPointerDown={e => e.stopPropagation()}>
          {/* Minimize */}
          <button
            onClick={() => minimizeWindow(windowData.id)}
            title="Minimizar"
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Maximize / Restore */}
          <button
            onClick={() => toggleMaximizeWindow(windowData.id)}
            title={isMaximized ? 'Restaurar' : 'Maximizar'}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            {isMaximized ? (
              <Copy className="w-3 h-3" />
            ) : (
              <Square className="w-3 h-3" />
            )}
          </button>

          {/* Close */}
          <button
            onClick={() => closeWindow(windowData.id)}
            title="Fechar"
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-rose-600 hover:text-white text-slate-400 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Window Body Container */}
      <div className="relative flex-1 overflow-hidden bg-slate-950">
        {/* Transparent overlay during drag/resize to prevent iframe event stealing */}
        {(isDragging || resizingDir) && (
          <div className="absolute inset-0 z-50 cursor-move bg-transparent" />
        )}
        {renderAppContent()}
      </div>

      {/* Resize Handles (8 directions) - only visible when not maximized */}
      {!isMaximized && (
        <>
          {/* North */}
          <div
            onPointerDown={e => handleResizePointerDown('n', e)}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            className="absolute top-0 left-2 right-2 h-1.5 cursor-ns-resize hover:bg-blue-500/20 z-40"
          />
          {/* South */}
          <div
            onPointerDown={e => handleResizePointerDown('s', e)}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            className="absolute bottom-0 left-2 right-2 h-1.5 cursor-ns-resize hover:bg-blue-500/20 z-40"
          />
          {/* East */}
          <div
            onPointerDown={e => handleResizePointerDown('e', e)}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            className="absolute top-2 bottom-2 right-0 w-1.5 cursor-ew-resize hover:bg-blue-500/20 z-40"
          />
          {/* West */}
          <div
            onPointerDown={e => handleResizePointerDown('w', e)}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            className="absolute top-2 bottom-2 left-0 w-1.5 cursor-ew-resize hover:bg-blue-500/20 z-40"
          />
          {/* North-West */}
          <div
            onPointerDown={e => handleResizePointerDown('nw', e)}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            className="absolute top-0 left-0 w-3 h-3 cursor-nwse-resize hover:bg-blue-500/30 z-50"
          />
          {/* North-East */}
          <div
            onPointerDown={e => handleResizePointerDown('ne', e)}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            className="absolute top-0 right-0 w-3 h-3 cursor-nesw-resize hover:bg-blue-500/30 z-50"
          />
          {/* South-West */}
          <div
            onPointerDown={e => handleResizePointerDown('sw', e)}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            className="absolute bottom-0 left-0 w-3 h-3 cursor-nesw-resize hover:bg-blue-500/30 z-50"
          />
          {/* South-East */}
          <div
            onPointerDown={e => handleResizePointerDown('se', e)}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize hover:bg-blue-500/30 z-50"
          />
        </>
      )}
    </div>
  );
};
