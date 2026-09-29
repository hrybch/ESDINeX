import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, Trash2, Play } from 'lucide-react';
import { AppDefinition } from '../../types/os';
import { AppIcon } from '../common/AppIcon';
import { useOS } from '../../context/OSContext';

interface DesktopIconProps {
  app: AppDefinition;
  isSelected?: boolean;
  onSelect?: () => void;
  onOpen: (appId: string) => void;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({ 
  app, 
  isSelected = false, 
  onSelect, 
  onOpen 
}) => {
  const { deleteApp } = useOS();
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.();
    setContextMenuPos(null);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpen(app.id);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect?.();
    // Position menu within viewport boundaries
    const posX = Math.min(e.clientX, window.innerWidth - 180);
    const posY = Math.min(e.clientY, window.innerHeight - 120);
    setContextMenuPos({ x: posX, y: posY });
  };

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenuPos(null);
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setContextMenuPos(null);
    if (confirm(`Deseja realmente remover o atalho "${app.title}" do ESDINeX?\n\nEle será removido da Área de Trabalho e da barra de tarefas.`)) {
      deleteApp(app.id);
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        className={`group w-24 p-2 flex flex-col items-center gap-1.5 rounded-lg cursor-pointer transition-all select-none ${
          isSelected
            ? 'bg-blue-600/30 ring-1 ring-blue-400 shadow-lg scale-[1.02]'
            : 'hover:bg-slate-800/40 hover:ring-1 hover:ring-slate-700/50'
        }`}
        title={
          app.embedType === 'executable'
            ? `${app.title}\nAtalho para executável local (.exe)\n${app.executablePath || ''}\n(Clique com botão direito para opções)`
            : `${app.title}\n(Clique com botão direito para opções)`
        }
      >
        {/* Icon Capsule with subtle depth */}
        <div className={`relative w-12 h-12 rounded-xl border shadow-lg flex items-center justify-center transition-all ${
          isSelected 
            ? 'bg-blue-900/50 border-blue-400 text-white ring-2 ring-blue-500/30' 
            : 'bg-slate-900/90 border-slate-700/60 text-blue-400 group-hover:scale-105 group-hover:text-blue-300'
        }`}>
          <AppIcon name={app.iconName} className="w-6 h-6" />

          {/* Badge para Aplicativo Executável Local */}
          {app.embedType === 'executable' && (
            <div 
              className="absolute -bottom-1 -right-1 px-1 py-0.2 bg-blue-600 border border-slate-900 rounded-[4px] text-[8px] font-mono font-bold text-white shadow-sm flex items-center gap-0.5"
              title="Programa Local (.exe)"
            >
              <span>EXE</span>
            </div>
          )}

          {/* Badge para Link Externo */}
          {app.blocksIframe && app.embedType !== 'executable' && (
            <div 
              className="absolute -bottom-1 -right-1 p-0.5 bg-slate-800 border border-slate-700 rounded-[4px] text-slate-300 shadow-sm"
              title="Abre em nova aba"
            >
              <ExternalLink className="w-2.5 h-2.5" />
            </div>
          )}
        </div>

        {/* Label with anti-aliased readability and shadow */}
        <span className={`text-[11px] font-medium text-center leading-tight line-clamp-2 px-1 rounded transition-colors ${
          isSelected 
            ? 'bg-blue-600 text-white shadow-sm' 
            : 'text-slate-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
        }`}>
          {app.title}
        </span>
      </div>

      {/* Right-click Context Menu */}
      {contextMenuPos && (
        <div
          ref={menuRef}
          style={{ top: `${contextMenuPos.y}px`, left: `${contextMenuPos.x}px` }}
          className="fixed z-[99999] w-48 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-lg shadow-2xl py-1 text-xs text-slate-200 divide-y divide-slate-800/80 animate-in fade-in-50 duration-100"
          onClick={e => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 font-semibold text-[10px] text-slate-400 uppercase tracking-wider truncate">
            {app.title}
          </div>

          <div className="py-1">
            <button
              onClick={() => {
                setContextMenuPos(null);
                onOpen(app.id);
              }}
              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-colors text-left"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>Abrir Aplicativo</span>
            </button>
          </div>

          <div className="py-1">
            <button
              onClick={handleDelete}
              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-rose-600 hover:text-white text-rose-400 transition-colors text-left"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir Atalho</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
