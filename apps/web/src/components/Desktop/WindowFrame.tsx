import React, { useState } from 'react';
import { Rnd } from 'react-rnd';
import { Minus, Square, X, ExternalLink, ShieldCheck } from 'lucide-react';
import { WindowInstance } from '../../types/desktop';
import { useDesktopStore } from '../../stores/useDesktopStore';

interface WindowFrameProps {
    instance: WindowInstance;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({ instance }) => {
    const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, updateWindowBounds } =
        useDesktopStore();

    // Flag para ativar overlay invisível sobre o iframe durante resize ou drag
    const [isDraggingOrResizing, setIsDraggingOrResizing] = useState(false);

    if (instance.isMinimized) return null;

    return (
        <Rnd
            size={
                instance.isMaximized
                    ? { width: '100vw', height: 'calc(100vh - 48px)' }
                    : { width: instance.size.width, height: instance.size.height }
            }
            position={
                instance.isMaximized
                    ? { x: 0, y: 0 }
                    : { x: instance.position.x, y: instance.position.y }
            }
            disableDragging={instance.isMaximized}
            enableResizing={!instance.isMaximized}
            bounds="parent"
            minWidth={400}
            minHeight={250}
            style={{ zIndex: instance.zIndex }}
            onDragStart={() => {
                setIsDraggingOrResizing(true);
                focusWindow(instance.id);
            }}
            onDragStop={(_e, d) => {
                setIsDraggingOrResizing(false);
                updateWindowBounds(instance.id, { position: { x: d.x, y: d.y } });
            }}
            onResizeStart={() => {
                setIsDraggingOrResizing(true);
                focusWindow(instance.id);
            }}
            onResizeStop={(_e, _direction, ref, _delta, position) => {
                setIsDraggingOrResizing(false);
                updateWindowBounds(instance.id, {
                    size: { width: parseInt(ref.style.width, 10), height: parseInt(ref.style.height, 10) },
                    position,
                });
            }}
            onMouseDown={() => focusWindow(instance.id)}
            className="flex flex-col rounded-lg shadow-2xl overflow-hidden border border-slate-700/60 bg-slate-900/95 backdrop-blur-md"
        >
            {/* Barra de Título (Handle de arrasto) */}
            <div className="h-10 bg-slate-800/80 px-3 flex items-center justify-between select-none cursor-move border-b border-slate-700/50">
                <div className="flex items-center space-x-2 text-slate-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold tracking-wide truncate max-w-[200px] md:max-w-md">
            {instance.title}
          </span>
                </div>

                {/* Controles de Janela */}
                <div className="flex items-center space-x-1" onMouseDown={(e) => e.stopPropagation()}>
                    {instance.url && (
                        <button
                            onClick={() => window.open(instance.url, '_blank')}
                            title="Abrir em aba externa"
                            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-100 transition-colors"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <button
                        onClick={() => minimizeWindow(instance.id)}
                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-100 transition-colors"
                    >
                        <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => maximizeWindow(instance.id)}
                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-100 transition-colors"
                    >
                        <Square className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => closeWindow(instance.id)}
                        className="p-1 hover:bg-rose-600 rounded text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Conteúdo: Iframe com sandbox ou mensagem de contingência */}
            <div className="relative flex-1 w-full h-full bg-slate-950">
                {/* Overlay para evitar perda de captura do mouse durante drag */}
                {isDraggingOrResizing && (
                    <div className="absolute inset-0 z-50 bg-transparent cursor-move" />
                )}

                {instance.url ? (
                    <iframe
                        src={instance.url}
                        title={instance.title}
                        className="w-full h-full border-none"
                        sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-downloads"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
                        <p className="text-sm">Sistema corporativo carregado nativamente.</p>
                    </div>
                )}
            </div>
        </Rnd>
    );
};