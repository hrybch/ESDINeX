import React, { useState } from 'react';
import { 
  PlusSquare, 
  Trash2, 
  ExternalLink, 
  Play, 
  Check, 
  Globe, 
  Server, 
  Database, 
  KeyRound, 
  Terminal, 
  Headphones, 
  Shield, 
  FileText, 
  Monitor, 
  Receipt,
  Layers,
  Sparkles
} from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { AppDefinition, AppCategory, UserRole } from '../../types/os';
import { AppIcon } from '../common/AppIcon';

const AVAILABLE_ICONS = [
  'Globe',
  'Server',
  'Database',
  'KeyRound',
  'Terminal',
  'Headphones',
  'Shield',
  'FileText',
  'Monitor',
  'Receipt',
  'Layers',
  'PlusSquare',
];

export const CadastrarNovoApp: React.FC = () => {
  const { allApps, registerApp, removeCustomApp, openWindow } = useOS();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [url, setUrl] = useState('');
  const [iconName, setIconName] = useState('Globe');
  const [category, setCategory] = useState<AppCategory>('sistema');
  const [embedMode, setEmbedMode] = useState<'iframe' | 'external'>('iframe');
  const [onDesktop, setOnDesktop] = useState(true);
  const [pinnedToDock, setPinnedToDock] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([
    'SUPORTE_N1',
    'SUPORTE_N2_ADMIN',
  ]);

  const handleRoleToggle = (role: UserRole) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      alert('Preencha pelo menos o Nome e a URL do aplicativo.');
      return;
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const newApp: AppDefinition = {
      id: `app_custom_${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim() || formattedUrl,
      category,
      iconName,
      allowedRoles: selectedRoles.length > 0 ? selectedRoles : ['SUPORTE_N1', 'SUPORTE_N2_ADMIN'],
      embedType: 'iframe',
      url: formattedUrl,
      blocksIframe: embedMode === 'external',
      defaultWidth: 960,
      defaultHeight: 620,
      pinnedToDock,
      onDesktop,
      isCustom: true,
    };

    registerApp(newApp);

    // Reset form
    setTitle('');
    setSubtitle('');
    setUrl('');
    alert(`Aplicativo "${newApp.title}" cadastrado com sucesso no ESDINeX! O ícone já está disponível na Área de Trabalho e no Menu.`);
  };

  // Custom apps registered by user
  const customApps = allApps.filter(a => a.isCustom);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans">
      {/* Top Header */}
      <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <PlusSquare className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Cadastrar Novo Aplicativo / Ferramenta Web
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Adicione sistemas notariais, portais corporativos ou links de intranet ao WebOS
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Dados da Aplicação</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Nome do Aplicativo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Siscart Web, Painel Backup, Colégio Notarial"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Subtítulo / Descrição Curta</label>
                <input
                  type="text"
                  placeholder="Ex: Sistema de Automação Cartorária"
                  value={subtitle}
                  onChange={e => setSubtitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">URL Completa do Sistema *</label>
              <input
                type="text"
                required
                placeholder="https://sistema.cartorio.com.br/login"
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Icon Picker */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Ícone do Sistema</label>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                {AVAILABLE_ICONS.map(name => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setIconName(name)}
                    className={`h-9 flex items-center justify-center rounded-lg border transition-colors ${
                      iconName === name
                        ? 'bg-blue-600 border-blue-500 text-white shadow-sm ring-2 ring-blue-500/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <AppIcon name={name} className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Category and Embed Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Categoria</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as AppCategory)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="sistema">Sistema Cartorário (Siscart, Escriba, etc.)</option>
                  <option value="atendimento">Atendimento & Chamados</option>
                  <option value="infra">Infraestrutura & Redes</option>
                  <option value="utilitarios">Utilitários Gerais</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Modo de Abertura</label>
                <select
                  value={embedMode}
                  onChange={e => setEmbedMode(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="iframe">Janela Flutuante (Iframe Sandboxed)</option>
                  <option value="external">Nova Aba (Recomendado se bloquear Iframe)</option>
                </select>
              </div>
            </div>

            {/* RBAC Roles checkboxes */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">
                Perfis com Acesso Permitido (RBAC)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'SUPORTE_N1', label: 'Suporte N1' },
                  { id: 'SUPORTE_N2_ADMIN', label: 'Suporte N2/Admin' },
                  { id: 'FINANCEIRO', label: 'Financeiro' },
                  { id: 'GESTOR_CARTORIO', label: 'Tabelião/Gestor' },
                ].map(r => {
                  const checked = selectedRoles.includes(r.id as UserRole);
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleRoleToggle(r.id as UserRole)}
                      className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-medium flex items-center justify-between transition-colors ${
                        checked
                          ? 'bg-blue-600/20 border-blue-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>{r.label}</span>
                      {checked && <Check className="w-3 h-3 text-blue-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Checkboxes: Desktop & Dock */}
            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={onDesktop}
                  onChange={e => setOnDesktop(e.target.checked)}
                  className="rounded border-slate-800 text-blue-600 focus:ring-0"
                />
                <span>Criar Ícone na Área de Trabalho</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={pinnedToDock}
                  onChange={e => setPinnedToDock(e.target.checked)}
                  className="rounded border-slate-800 text-blue-600 focus:ring-0"
                />
                <span>Fixar na Barra de Tarefas (Dock)</span>
              </label>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-sm transition-colors text-xs"
              >
                <PlusSquare className="w-4 h-4" />
                <span>Salvar e Instanciar no WebOS</span>
              </button>
            </div>
          </form>
        </div>

        {/* Custom Registered Apps Column */}
        <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Aplicativos Personalizados ({customApps.length})
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 max-h-[460px]">
            {customApps.length === 0 ? (
              <div className="py-12 px-4 text-center text-slate-500 text-xs space-y-2">
                <p>Nenhum aplicativo personalizado cadastrado ainda.</p>
                <p className="text-[11px] text-slate-600">
                  Preencha o formulário ao lado para adicionar portais de cartório, sistemas web ou links internos.
                </p>
              </div>
            ) : (
              customApps.map(app => (
                <div key={app.id} className="py-3 flex items-center justify-between gap-3 group">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 shrink-0">
                      <AppIcon name={app.iconName} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-200 truncate">{app.title}</div>
                      <div className="text-[10px] text-slate-500 truncate font-mono">{app.url}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => openWindow(app.id)}
                      title="Abrir Janela"
                      className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
                    >
                      <Play className="w-3 h-3 fill-current" />
                    </button>
                    <button
                      onClick={() => removeCustomApp(app.id)}
                      title="Excluir Aplicativo"
                      className="p-1.5 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
