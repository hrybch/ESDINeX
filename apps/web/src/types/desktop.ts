export type LaunchMode = 'window_iframe' | 'new_tab' | 'internal_component';

export type UserRole = 'ADMIN' | 'SUPORTE_N1' | 'SUPORTE_N2' | 'FINANCEIRO';

export interface AppMetadata {
    id: string;
    title: string;
    icon: string; // Nome do ícone Lucide ou URL do SVG
    url?: string; // URL do sistema web ou painel
    launchMode: LaunchMode;
    allowedRoles: UserRole[];
    defaultWidth?: number;
    defaultHeight?: number;
    isExternalTarget?: boolean;
}

export interface WindowInstance {
    id: string; // Identificador da janela ativa
    appId: string;
    title: string;
    url?: string;
    icon: string;
    isMinimized: boolean;
    isMaximized: boolean;
    zIndex: number;
    position: { x: number; y: number };
    size: { width: number; height: number };
}