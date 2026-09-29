import React, { useMemo } from 'react';
import { Server, Database, FileText, HelpCircle, HardDrive } from 'lucide-react';
import { AppMetadata, UserRole } from '../../types/desktop';
import { useDesktopStore } from '../../stores/useDesktopStore';
import { WindowFrame } from './WindowFrame';
import { Taskbar } from './Taskbar';

// Catálogo Mock inicial simulando ferramentas de TI de Cartórios
const INITIAL_REGISTRY: AppMetadata[] = [
    {
        id: 'siscart',
        title: 'Painel de Suporte Cartorário',
        icon: 'Database',
        url: 'https://example.org', // Sistema interno que aceita iframe
        launchMode: 'window_iframe',
        allowedRoles: ['ADMIN', 'SUPORTE_N1', 'SUPORTE_N2'],
        defaultWidth: 1024,
        defaultHeight: 650,
    },
    {
        id: 'portal-extrajudicial',
        title: 'Portal Extrajudicial (CNJ)',
        icon: 'FileText',
        url: 'https://corregedoria.pje.jus.br/', // Sistema externo com bloqueio de iframe
        launchMode: 'new_tab',
        allowedRoles: ['ADMIN', 'SUPORTE_N2'],
    },
    {
        id: 'server-status',
        title: 'Monitor de Certificados Digitais',
        icon: 'Server',
        launchMode: 'window_iframe',
        allowedRoles: ['ADMIN', 'SUPORTE_N1'],
        defaultWidth: 800,
        defaultHeight: 500,
    },
];

// Helper para mapear ícones
const renderAppIcon = (iconName: string) => {
    switch (iconName) {
        case 'Database': return <Database className="w-8 h-8 text-sky-400" />;
        case 'Server': return <Server className="w-8 h-8 text-amber-400" />;
        case 'FileText': return <FileText className="w-8 h-8 text-emerald-400" />;
        default: return <HardDrive className="w-8 h-8 text-indigo-400" />;
    }
};

export const Desktop: React.FC = () => {
    const { windows, openApp } = useDesktopStore();

    // Simulação do usuário logado (ex: Suporte Nível 1)
    const currentUserRole: UserRole = 'SUPORTE_N1';

    // REGRA DE SEGURANÇA (RBAC): Filtra estritamente os ícones permitidos
    const authorizedApps = useMemo(() => {
        return INITIAL_REGISTRY.filter((app) =>
            app.allowedRoles.includes(currentUserRole)
        );
    }, [currentUserRole]);

    return (
        <main className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 select-none">
            {/* Efeito de Wallpaper Corporativo Sutil */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

            {/* Grid de Ícones da Área de Trabalho */}
            <div className="relative z-10 p-6 grid grid-flow-col grid-rows-6 gap-6 w-max">
                {authorizedApps.map((app) => (
                    <button
                        key={app.id}
                        onDoubleClick={() => openApp(app)}
                        className="group flex flex-col items-center justify-center w-24 h-24 p-2 rounded-xl transition-all duration-150 hover:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        title={`${app.title} (${app.launchMode === 'new_tab' ? 'Abre em nova aba' : 'Janela interna'})`}
                    >
                        <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 group-hover:scale-105 group-hover:shadow-lg group-hover:border-indigo-500/40 transition-all">
                            {renderAppIcon(app.icon)}
                        </div>
                        <span className="mt-2 text-xs font-medium text-slate-300 text-center tracking-wide line-clamp-2 leading-tight group-hover:text-white drop-shadow-md">
              {app.title}
            </span>
                    </button>
                ))}
            </div>

            {/* Renderizador de Janelas Flutuantes */}
            <section aria-label="Janelas do Sistema">
                {windows.map((win) => (
                    <WindowFrame key={win.id} instance={win} />
                ))}
            </section>

            {/* Barra de Tarefas */}
            <Taskbar />
        </main>
    );
};