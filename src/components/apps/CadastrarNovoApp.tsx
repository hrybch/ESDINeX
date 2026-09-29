import React, { useState, useEffect } from 'react';
import { 
  PlusSquare, 
  Trash2, 
  Play, 
  Check, 
  Globe, 
  Monitor, 
  HardDrive, 
  Server, 
  Database, 
  Terminal, 
  Headphones, 
  Shield, 
  FileText, 
  Receipt,
  Layers,
  Sparkles,
  FolderOpen,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { AppDefinition, AppCategory, UserRole } from '../../types/os';
import { AppIcon } from '../common/AppIcon';

const AVAILABLE_ICONS = [
  'Monitor',
  'HardDrive',
  'Terminal',
  'Server',
  'Database',
  'Headphones',
  'Globe',
  'Shield',
  'FileText',
  'Receipt',
  'Layers',
  'PlusSquare',
];

interface DetectedApp {
  id: string;
  title: string;
  paths: string[];
  protocolUri?: string;
  iconName: string;
  category: AppCategory;
  subtitle: string;
  isInstalled: boolean;
  resolvedPath: string;
}

export const CadastrarNovoApp: React.FC = () => {
  const { allApps, registerApp, deleteApp, restoreDefaultApps, launchLocalExecutable } = useOS();

  // Mode: Web or Local Executable
  const [appType, setAppType] = useState<'web' | 'executable'>('executable');
  const [filterType, setFilterType] = useState<'all' | 'executable' | 'web'>('all');

  // Form Fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [url, setUrl] = useState('');
  const [executablePath, setExecutablePath] = useState('');
  const [executableArgs, setExecutableArgs] = useState('');
  const [protocolUri, setProtocolUri] = useState('');
  const [iconName, setIconName] = useState('Monitor');
  const [category, setCategory] = useState<AppCategory>('infra');
  const [embedMode, setEmbedMode] = useState<'iframe' | 'external'>('iframe');
  const [onDesktop, setOnDesktop] = useState(true);
  const [pinnedToDock, setPinnedToDock] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([
    'SUPORTE_N1',
    'SUPORTE_N2_ADMIN',
    'GESTOR_TI',
    'GESTOR_CARTORIO',
  ]);

  // Detected apps from Windows system via local API
  const [detectedApps, setDetectedApps] = useState<DetectedApp[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [testFeedback, setTestFeedback] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    // Fetch detected common apps from backend
    fetch('/api/detect-apps')
      .then(res => res.json())
      .then(data => {
        if (data.apps) {
          setDetectedApps(data.apps);
        }
      })
      .catch(() => {
        // Fallback default list if API not reachable
        setDetectedApps([
          {
            id: 'teamviewer',
            title: 'TeamViewer',
            paths: ['C:\\Program Files\\TeamViewer\\TeamViewer.exe'],
            protocolUri: 'teamviewer:',
            iconName: 'Monitor',
            category: 'infra',
            subtitle: 'Acesso Remoto Rápido',
            isInstalled: true,
            resolvedPath: 'C:\\Program Files\\TeamViewer\\TeamViewer.exe',
          },
          {
            id: 'anydesk',
            title: 'AnyDesk',
            paths: ['C:\\Program Files (x86)\\AnyDesk\\AnyDesk.exe'],
            protocolUri: 'anydesk:',
            iconName: 'Monitor',
            category: 'infra',
            subtitle: 'Conexão Remota Alternativa',
            isInstalled: true,
            resolvedPath: 'C:\\Program Files (x86)\\AnyDesk\\AnyDesk.exe',
          },
          {
            id: 'mstsc',
            title: 'Área de Trabalho Remota (RDP)',
            paths: ['C:\\Windows\\System32\\mstsc.exe'],
            iconName: 'Server',
            category: 'infra',
            subtitle: 'Conexão Nativa Windows RDP',
            isInstalled: true,
            resolvedPath: 'C:\\Windows\\System32\\mstsc.exe',
          },
        ]);
      });
  }, []);

  const handleRoleToggle = (role: UserRole) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  // Pre-fill form when user clicks a detected app preset
  const selectPreset = (app: DetectedApp) => {
    setTitle(app.title);
    setSubtitle(app.subtitle);
    setExecutablePath(app.resolvedPath);
    setProtocolUri(app.protocolUri || '');
    setIconName(app.iconName);
    setCategory(app.category);
    setAppType('executable');
    setTestFeedback(null);
  };

  // Handle file picker selection (.exe, .lnk)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      if (!title) {
        setTitle(fileNameWithoutExt);
      }
      if (!subtitle) {
        setSubtitle(`Atalho para ${file.name}`);
      }
      // If user selected a known file, suggest standard path if path is empty
      if (file.name.toLowerCase().includes('teamviewer')) {
        setExecutablePath('C:\\Program Files\\TeamViewer\\TeamViewer.exe');
        setProtocolUri('teamviewer:');
        setIconName('Monitor');
      } else if (file.name.toLowerCase().includes('anydesk')) {
        setExecutablePath('C:\\Program Files (x86)\\AnyDesk\\AnyDesk.exe');
        setProtocolUri('anydesk:');
        setIconName('Monitor');
      } else {
        // Fallback: put file name or prompt for full path
        setExecutablePath(prev => prev || `C:\\Program Files\\${file.name}`);
      }
    }
  };

  // Test launching the program immediately
  const handleTestRun = async () => {
    if (!executablePath.trim() && !protocolUri.trim()) {
      setTestFeedback({
        success: false,
        message: 'Preencha o caminho do executável ou o protocolo para testar.',
      });
      return;
    }

    setIsTesting(true);
    setTestFeedback(null);

    const args = executableArgs.trim() ? executableArgs.trim().split(' ') : [];
    const res = await launchLocalExecutable({
      title: title || 'Teste Executável',
      executablePath: executablePath.trim(),
      executableArgs: args,
      protocolUri: protocolUri.trim(),
    });

    setIsTesting(false);
    if (res.success) {
      setTestFeedback({
        success: true,
        message: res.message || 'Comando enviado ao Windows com sucesso! O programa deve abrir na máquina.',
      });
    } else {
      setTestFeedback({
        success: false,
        message: res.error || 'Não foi possível iniciar o programa. Verifique se o caminho existe.',
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Por favor, informe o Nome do Aplicativo.');
      return;
    }

    if (appType === 'executable') {
      if (!executablePath.trim() && !protocolUri.trim()) {
        alert('Informe o Caminho do Executável (.exe) ou o Protocolo do Sistema.');
        return;
      }

      const args = executableArgs.trim() ? executableArgs.trim().split(' ') : [];
      const newApp: AppDefinition = {
        id: `app_exe_${Date.now()}`,
        title: title.trim(),
        subtitle: subtitle.trim() || `Executável: ${executablePath.trim()}`,
        category,
        iconName,
        allowedRoles: selectedRoles.length > 0 ? selectedRoles : ['SUPORTE_N1', 'SUPORTE_N2_ADMIN'],
        embedType: 'executable',
        executablePath: executablePath.trim(),
        executableArgs: args,
        protocolUri: protocolUri.trim() || undefined,
        pinnedToDock,
        onDesktop,
        isCustom: true,
      };

      registerApp(newApp);
      alert(`Atalho para "${newApp.title}" cadastrado com sucesso! O ícone com indicador [EXE] já está no seu Desktop.`);
    } else {
      if (!url.trim()) {
        alert('Informe a URL completa do sistema web.');
        return;
      }

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
      alert(`Aplicativo Web "${newApp.title}" cadastrado com sucesso!`);
    }

    // Reset Form
    setTitle('');
    setSubtitle('');
    setUrl('');
    setExecutablePath('');
    setExecutableArgs('');
    setProtocolUri('');
    setTestFeedback(null);
  };

  const customApps = allApps.filter(a => a.isCustom);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans">
      {/* Top Header */}
      <div className="p-4 bg-slate-900/70 border-b border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <PlusSquare className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Cadastrar Aplicativo / Atalho no WebOS
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Adicione atalhos para programas instalados na máquina (.exe) ou sistemas web para a equipe técnica de cartórios
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => { setAppType('executable'); setIconName('Monitor'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              appType === 'executable'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Programa Instalado (.exe)</span>
          </button>
          <button
            type="button"
            onClick={() => { setAppType('web'); setIconName('Globe'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              appType === 'web'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Sistema Web / URL</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          {/* Quick Presets for Installed Executables */}
          {appType === 'executable' && detectedApps.length > 0 && (
            <div className="space-y-2 pb-3 border-b border-slate-800/80">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Programas Comuns de TI & Suporte Detectados:</span>
                <span className="text-blue-400 text-[10px] lowercase font-normal">clique para preencher rápido</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {detectedApps.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectPreset(item)}
                    className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-blue-500/60 hover:bg-slate-900 text-left transition-all group flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-slate-800/80 text-blue-400 group-hover:text-blue-300">
                        <AppIcon name={item.iconName} className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-white group-hover:text-blue-300 truncate">
                        {item.title}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      {item.isInstalled ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-mono">
                          <CheckCircle2 className="w-3 h-3" /> Instalado
                        </span>
                      ) : (
                        <span className="text-slate-500">Padrão</span>
                      )}
                      <span className="text-slate-500 font-mono text-[9px] truncate max-w-[80px]">
                        .exe
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Nome do Aplicativo *</label>
                <input
                  type="text"
                  required
                  placeholder={appType === 'executable' ? 'Ex: TeamViewer Suporte, AnyDesk' : 'Ex: Siscart Web, Painel TJ'}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Subtítulo / Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Acesso Remoto aos Cartórios"
                  value={subtitle}
                  onChange={e => setSubtitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Type Specific Fields */}
            {appType === 'executable' ? (
              <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
                {/* File picker button */}
                <div className="flex items-center justify-between pb-1">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <FolderOpen className="w-4 h-4 text-blue-400" />
                    <span>Caminho do Executável na Máquina *</span>
                  </span>
                  <label className="cursor-pointer px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-blue-200 rounded text-[11px] font-medium border border-slate-700 flex items-center gap-1.5 transition-colors">
                    <span>Selecionar .exe...</span>
                    <input
                      type="file"
                      accept=".exe,.lnk,.bat,.cmd"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <input
                  type="text"
                  required
                  placeholder="C:\Program Files\TeamViewer\TeamViewer.exe"
                  value={executablePath}
                  onChange={e => setExecutablePath(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-mono text-[11px] placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <p className="text-[10px] text-slate-400">
                  Dica: Você pode digitar caminhos com espaços como <code className="text-blue-400">C:\Program Files\TeamViewer\TeamViewer.exe</code> ou comandos padrão do Windows como <code className="text-blue-400">mstsc.exe</code>, <code className="text-blue-400">calc.exe</code>.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[11px]">Parâmetros / Argumentos (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Ex: -i 12345678 ou /v:servidor"
                      value={executableArgs}
                      onChange={e => setExecutableArgs(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-slate-200 font-mono text-[11px] focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 text-[11px]">Protocolo Fallback (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Ex: teamviewer: ou anydesk:"
                      value={protocolUri}
                      onChange={e => setProtocolUri(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-slate-200 font-mono text-[11px] focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Test Launch Button & Feedback */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleTestRun}
                    disabled={isTesting || (!executablePath.trim() && !protocolUri.trim())}
                    className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 hover:text-white rounded-lg font-medium transition-colors border border-slate-700 flex items-center justify-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isTesting ? 'Iniciando programa no Windows...' : 'Testar Abertura do Executável Agora'}</span>
                  </button>

                  {testFeedback && (
                    <div className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                      testFeedback.success
                        ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                    }`}>
                      {testFeedback.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <span>{testFeedback.message}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">URL Completa do Sistema Web *</label>
                <input
                  type="text"
                  required
                  placeholder="https://sistema.cartorio.com.br/login"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            {/* Icon Picker */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Ícone do Atalho</label>
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
                  <option value="infra">Infraestrutura, Redes & Acesso Remoto</option>
                  <option value="sistema">Sistema Cartorário (Siscart, Escriba, etc.)</option>
                  <option value="atendimento">Atendimento & Chamados</option>
                  <option value="utilitarios">Utilitários Gerais</option>
                </select>
              </div>

              {appType === 'web' && (
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
              )}
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
                  { id: 'GESTOR_TI', label: 'Gestor TI' },
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
                  className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0"
                />
                <span>Criar Ícone na Área de Trabalho</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={pinnedToDock}
                  onChange={e => setPinnedToDock(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0"
                />
                <span>Fixar na Barra de Tarefas (Dock)</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 mt-4 text-xs"
            >
              <PlusSquare className="w-4 h-4" />
              <span>
                {appType === 'executable' ? 'Cadastrar Atalho do Executável no WebOS' : 'Cadastrar Sistema Web no WebOS'}
              </span>
            </button>
          </form>
        </div>

        {/* All Registered Apps Column */}
        <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col h-full">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Gerenciar Aplicativos ({allApps.length})</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Exclua atalhos indesejados ou teste a abertura direta
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (confirm('Deseja restaurar todos os aplicativos originais padrão do ESDINeX?')) {
                  restoreDefaultApps();
                }
              }}
              title="Restaurar aplicativos originais que foram excluídos"
              className="text-[10px] font-medium text-blue-400 hover:text-blue-300 underline"
            >
              Restaurar Padrões
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 pt-3 pb-1 text-[11px]">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-2 py-1 rounded transition-colors ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white font-medium shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos ({allApps.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('executable')}
              className={`px-2 py-1 rounded transition-colors ${
                filterType === 'executable'
                  ? 'bg-blue-600 text-white font-medium shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              Executáveis ({allApps.filter(a => a.embedType === 'executable').length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('web')}
              className={`px-2 py-1 rounded transition-colors ${
                filterType === 'web'
                  ? 'bg-blue-600 text-white font-medium shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              Web ({allApps.filter(a => a.embedType !== 'executable').length})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto mt-2 space-y-2 pr-1">
            {allApps
              .filter(app => {
                if (filterType === 'executable') return app.embedType === 'executable';
                if (filterType === 'web') return app.embedType !== 'executable';
                return true;
              })
              .map(app => (
                <div
                  key={app.id}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between gap-3 group hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 shrink-0">
                      <AppIcon name={app.iconName} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-white truncate">{app.title}</span>
                        {app.embedType === 'executable' ? (
                          <span className="px-1 py-0.2 bg-blue-600/30 border border-blue-500/40 text-[9px] font-mono text-blue-300 rounded">
                            EXE
                          </span>
                        ) : (
                          <span className="px-1 py-0.2 bg-emerald-600/20 border border-emerald-500/30 text-[9px] font-mono text-emerald-300 rounded">
                            WEB
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono truncate">
                        {app.embedType === 'executable' ? (app.executablePath || 'Comando do Windows') : app.url}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {app.embedType === 'executable' && (
                      <button
                        type="button"
                        onClick={() => launchLocalExecutable(app)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded transition-colors"
                        title="Testar Execução no Windows"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Atenção: Tem certeza de que deseja remover o aplicativo "${app.title}" do ESDINeX?\n\nEle será removido da Área de Trabalho, Dock e Menu Iniciar.`)) {
                          deleteApp(app.id);
                        }
                      }}
                      className="p-1.5 hover:bg-rose-950/50 text-slate-500 hover:text-rose-400 rounded transition-colors"
                      title="Excluir Aplicativo do Sistema"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
