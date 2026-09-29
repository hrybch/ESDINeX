import { create } from 'zustand';
import { AppMetadata, WindowInstance } from '../types/desktop';

interface DesktopState {
    windows: WindowInstance[];
    activeWindowId: string | null;
    highestZIndex: number;
    openApp: (app: AppMetadata) => void;
    closeWindow: (windowId: string) => void;
    minimizeWindow: (windowId: string) => void;
    maximizeWindow: (windowId: string) => void;
    focusWindow: (windowId: string) => void;
    updateWindowBounds: (
        windowId: string,
        bounds: { position?: { x: number; y: number }; size?: { width: number; height: number } }
    ) => void;
}

export const useDesktopStore = create<DesktopState>((set, get) => ({
    windows: [],
    activeWindowId: null,
    highestZIndex: 100,

    openApp: (app: AppMetadata) => {
        // 1. Tratamento para links externos que bloqueiam iframes
        if (app.launchMode === 'new_tab' && app.url) {
            window.open(app.url, '_blank', 'noopener,noreferrer');
            return;
        }

        const { windows, highestZIndex } = get();
        const existing = windows.find((w) => w.appId === app.id);

        // Se a janela já existe, desminimiza e foca nela
        if (existing) {
            const nextZ = highestZIndex + 1;
            set({
                highestZIndex: nextZ,
                activeWindowId: existing.id,
                windows: windows.map((w) =>
                    w.id === existing.id
                        ? { ...w, isMinimized: false, zIndex: nextZ }
                        : w
                ),
            });
            return;
        }

        // Instancia uma nova janela em cascata
        const offset = (windows.length % 8) * 30;
        const nextZ = highestZIndex + 1;
        const newWindow: WindowInstance = {
            id: `win-${app.id}-${Date.now()}`,
            appId: app.id,
            title: app.title,
            url: app.url,
            icon: app.icon,
            isMinimized: false,
            isMaximized: false,
            zIndex: nextZ,
            position: { x: 100 + offset, y: 60 + offset },
            size: {
                width: app.defaultWidth || 950,
                height: app.defaultHeight || 600,
            },
        };

        set({
            windows: [...windows, newWindow],
            activeWindowId: newWindow.id,
            highestZIndex: nextZ,
        });
    },

    closeWindow: (windowId: string) => {
        set((state) => ({
            windows: state.windows.filter((w) => w.id !== windowId),
            activeWindowId:
                state.activeWindowId === windowId ? null : state.activeWindowId,
        }));
    },

    minimizeWindow: (windowId: string) => {
        set((state) => ({
            windows: state.windows.map((w) =>
                w.id === windowId ? { ...w, isMinimized: true } : w
            ),
            activeWindowId: state.activeWindowId === windowId ? null : state.activeWindowId,
        }));
    },

    maximizeWindow: (windowId: string) => {
        set((state) => ({
            windows: state.windows.map((w) =>
                w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w
            ),
        }));
    },

    focusWindow: (windowId: string) => {
        const { highestZIndex, windows } = get();
        const nextZ = highestZIndex + 1;
        set({
            highestZIndex: nextZ,
            activeWindowId: windowId,
            windows: windows.map((w) =>
                w.id === windowId ? { ...w, isMinimized: false, zIndex: nextZ } : w
            ),
        });
    },

    updateWindowBounds: (windowId, bounds) => {
        set((state) => ({
            windows: state.windows.map((w) =>
                w.id === windowId
                    ? {
                        ...w,
                        position: bounds.position || w.position,
                        size: bounds.size || w.size,
                    }
                    : w
            ),
        }));
    },
}));