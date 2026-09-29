import React, { useState } from 'react';
import { 
  Search, 
  Shield, 
  User, 
  PlusSquare, 
  Terminal, 
  Headphones,
  ChevronRight,
  ExternalLink,
  Users,
  Lock,
  LogOut
} from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { AppIcon } from '../common/AppIcon';
import { AppCategory, UserRole } from '../../types/os';
import { INITIAL_USERS } from '../../data/appsData';

const CATEGORY_LABELS: Record<AppCategory, string> = {
  atendimento: 'Atendimento & Chamados (ESDI)',
  infra: 'Infraestrutura & Linha de Comando',
  sistema: 'Sistemas Web & Portais Corporativos',
  utilitarios: 'Ferramentas do Sistema & Usuários',
};

export const StartMenu: React.FC = () => {
  const { 
    currentUser, 
    setUserRole, 
    authorizedApps, 
    openWindow, 
    closeStartMenu,
    lockSession,
    logout
  } = useOS();

  const [searchTerm, setSearchTerm] = useState('');
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const filteredApps = authorizedApps.filter(app =>
    app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (CATEGORY_LABELS[app.category] && CATEGORY_LABELS[app.category].toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const categories = Array.from(new Set(filteredApps.map(a => a.category))) as AppCategory[];

  return (
    <div 
      onClick={e => e.stopPropagation()}
      className="absolute bottom-12 left-2 w-[480px] max-h-[580px] flex flex-col bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl z-[9999] overflow-hidden"
    >
      {/* User Header */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-semibold text-sm">
            {(currentUser?.name || 'TI').split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>{currentUser?.name || 'Usuário'}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                2FA
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className="font-mono text-blue-400 font-medium">{currentUser?.role || 'SUPORTE_N1'}</span>
              <span>·</span>
              <span className="truncate max-w-[200px]">{currentUser.clienteAtribuicao || currentUser.departamento || 'Central ESDI'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowRoleSwitcher(prev => !prev)}
            className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
          >
            {showRoleSwitcher ? 'Fechar' : 'Perfis'}
          </button>
        </div>
      </div>

      {/* Role Switcher Drawer */}
      {showRoleSwitcher && (
        <div className="p-3 bg-slate-900/70 border-b border-slate-800 space-y-1.5">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Simular Login com Perfil RBAC:
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {(Object.keys(INITIAL_USERS) as UserRole[]).map(r => (
              <button
                key={r}
                onClick={() => {
                  setUserRole(r);
                  setShowRoleSwitcher(false);
                }}
                className={`p-2 text-left rounded border transition-colors ${
                  currentUser.role === r
                    ? 'bg-blue-600/20 border-blue-500 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="text-xs font-semibold">{r}</div>
                <div className="text-[10px] truncate text-slate-500">{INITIAL_USERS[r].name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-900/40">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Pesquisar ferramentas do OS ou sistemas..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            autoFocus
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* App List by Category */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 max-h-[340px]">
        {filteredApps.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">
            Nenhuma aplicação autorizada encontrada para esta busca.
          </div>
        ) : (
          categories.map(cat => {
            const appsInCat = filteredApps.filter(a => a.category === cat);
            return (
              <div key={cat} className="space-y-1.5">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2">
                  {CATEGORY_LABELS[cat] || cat}
                </div>
                <div className="space-y-1">
                  {appsInCat.map(app => (
                    <button
                      key={app.id}
                      onClick={() => openWindow(app.id)}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/60 transition-colors group text-left"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform shrink-0">
                          <AppIcon name={app.iconName} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-200 truncate group-hover:text-white">
                            {app.title}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {app.subtitle}
                          </div>
                        </div>
                      </div>

                      <div className="text-slate-500 group-hover:text-slate-300">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer bar with quick actions */}
      <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openWindow('app_gerenciador_usuarios')}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors text-[11px]"
            title="Gerenciar Usuários e 2FA"
          >
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>Usuários</span>
          </button>

          <button
            onClick={() => openWindow('app_cadastrar_app')}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded border border-blue-500/30 transition-colors text-[11px]"
          >
            <PlusSquare className="w-3.5 h-3.5" />
            <span>Cadastrar App</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => { closeStartMenu(); lockSession(); }}
            title="Bloquear Sessão com 2FA"
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-amber-400 rounded transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => { closeStartMenu(); logout(); }}
            title="Sair / Encerrar Sessão"
            className="p-1.5 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 rounded transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
