import React, { useState, useEffect } from 'react';
import { LayoutGrid } from 'lucide-react';
import { useDesktopStore } from '../../stores/useDesktopStore';

export const Taskbar: React.FC = () => {
    const { windows, activeWindowId, focusWindow, minimizeWindow } = useDesktopStore();
    const [time, setTime] = useState<string>('');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
        };
        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <footer className="absolute bottom-0 left-0 right-0 h-12 bg-slate-900/90 backdrop-blur-xl border-t border-slate-700/60 z-50 flex items-center justify-between px-3">
            {/* Botão Menu Iniciar */}
            <div className="flex items-center space-x-2">
                <button
                    className="flex items-center justify-center w-9 h-9 rounded-md bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-400 hover:text-white border border-indigo-500/40 transition-all shadow-sm"
                    title="Menu ESDINEX"
                >
                    <LayoutGrid className="w-5 h-5" />
                </button>

                {/* Lista de Janelas Ativas na Barra */}
                <div className="flex items-center space-x-1 overflow-x-auto max-w-[70vw] scrollbar-none">
                    {windows.map((w) => {
                        const isActive = activeWindowId === w.id && !w.isMinimized;
                        return (
                            <button
                                key={w.id}
                                onClick={() => {
                                    if (isActive) {
                                        minimizeWindow(w.id);
                                    } else {
                                        focusWindow(w.id);
                                    }
                                }}
                                className={`flex items-center space-x-2 px-3 h-8 rounded-md text-xs font-medium transition-all max-w-[160px] truncate ${
                                    isActive
                                        ? 'bg-slate-700/80 text-white border-b-2 border-indigo-400 shadow-inner'
                                        : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800/70 border border-slate-700/30'
                                }`}
                            >
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                <span className="truncate">{w.title}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Relógio e Status */}
            <div className="flex items-center space-x-3 text-slate-400 text-xs font-mono select-none px-2">
                <span>{time}</span>
            </div>
        </footer>
    );
};