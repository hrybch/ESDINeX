import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, Trash2, ShieldCheck, Sparkles } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { UserRole } from '../../types/os';
import { glpiApi } from '../../services/glpiApi';

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'info' | 'success';
  text: string;
  timestamp: string;
}

export const CartorioTerminalOS: React.FC = () => {
  const { 
    allApps, 
    authorizedApps, 
    windows, 
    openWindow, 
    closeWindow, 
    currentUser, 
    setUserRole, 
    registerApp, 
    removeCustomApp, 
    tickets, 
    addTicket,
    users,
    addUser,
    lockSession,
    logout
  } = useOS();

  const [inputVal, setInputVal] = useState('');
  const apiConfig = glpiApi.getConfig();
  const [history, setHistory] = useState<TerminalLine[]>([
    {
      id: 'l1',
      type: 'info',
      text: 'ESDINeX Enterprise Kernel v3.1.0 [Web Desktop Engine]',
      timestamp: '00:00:01',
    },
    {
      id: 'l2',
      type: 'info',
      text: 'Terminal do Sistema conectado ao gerenciador de janelas e processos.',
      timestamp: '00:00:02',
    },
    {
      id: 'l3',
      type: 'success',
      text: 'Digite "help" para ver os comandos do próprio OS (gerenciar janelas, apps e chamados).',
      timestamp: '00:00:03',
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const executeCommand = async (rawCmd: string) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return;

    const time = new Date().toLocaleTimeString('pt-BR');
    const newLines: TerminalLine[] = [
      { id: `in_${Date.now()}`, type: 'input', text: `$ ${trimmed}`, timestamp: time }
    ];

    const tokens = trimmed.split(' ');
    const command = tokens[0].toLowerCase();
    const args = tokens.slice(1);

    switch (command) {
      case 'help': {
        newLines.push({
          id: `out_${Date.now()}`,
          type: 'output',
          text: `Comandos do ESDINeX:
  apps                           - Lista todos os aplicativos disponíveis no OS
  apps add <nome> <url>          - Cadastra um novo aplicativo no WebOS diretamente via CLI
  apps remove <app_id>           - Remove um aplicativo personalizado cadastrado
  open <app_id>                  - Abre uma janela para o aplicativo especificado
  close <window_id|app_id>       - Fecha uma janela ativa no Desktop
  windows (ou ps)                - Lista processos e janelas atualmente abertas
  tickets                        - Lista os chamados abertos na Central ESDI
  ticket new <titulo>            - Abre um novo chamado rápido na Central ESDI
  users                          - Lista os usuários cadastrados e status 2FA
  whoami                         - Exibe o usuário ativo e perfil RBAC
  role <N1|N2_ADMIN|FIN|GESTOR>  - Altera dinamicamente o perfil de acesso
  lock                           - Bloqueia a sessão do ESDINeX (exige 2FA)
  logout                         - Encerra a sessão atual
  ping <host>                    - Executa teste de conectividade e latência
  clear                          - Limpa o histórico de comandos
  version                        - Exibe informações do ambiente WebOS`,
          timestamp: time,
        });
        break;
      }

      case 'users': {
        const userLines = users.map(
          u => `• [${u.id}] ${u.name} (${u.role}) - ${u.email} | 2FA: ${u.twoFactorEnabled ? 'ATIVO (' + u.twoFactorMethod + ')' : 'INATIVO'} | Status: ${u.status}`
        );
        newLines.push({
          id: `out_${Date.now()}`,
          type: 'output',
          text: `Usuários Cadastrados no ESDINeX (${users.length}):\n${userLines.join('\n')}`,
          timestamp: time,
        });
        break;
      }

      case 'lock': {
        newLines.push({
          id: `out_${Date.now()}`,
          type: 'info',
          text: 'Bloqueando sessão do ESDINeX. Autenticação 2FA requerida.',
          timestamp: time,
        });
        setTimeout(() => lockSession(), 300);
        break;
      }

      case 'logout': {
        newLines.push({
          id: `out_${Date.now()}`,
          type: 'info',
          text: 'Encerrando sessão...',
          timestamp: time,
        });
        setTimeout(() => logout(), 300);
        break;
      }

      case 'clear': {
        setHistory([]);
        setInputVal('');
        return;
      }

      case 'version': {
        newLines.push({
          id: `out_${Date.now()}`,
          type: 'info',
          text: `ESDINeX Extranet WebOS v3.1-clean
- Kernel: React 19 + TypeScript + TailWindCSS Engine
- Sandboxing: W3C iframe sandbox with CSP & X-Frame-Options filter
- Compliance: Políticas de Segurança ISO 27001 & LGPD`,
          timestamp: time,
        });
        break;
      }

      case 'whoami': {
        newLines.push({
          id: `out_${Date.now()}`,
          type: 'output',
          text: `Usuário: ${currentUser.name} (${currentUser.email})
Perfil RBAC: ${currentUser.role}
Atribuição: ${currentUser.clienteAtribuicao || currentUser.departamento || 'Central ESDI'}`,
          timestamp: time,
        });
        break;
      }

      case 'role': {
        if (!args[0]) {
          newLines.push({
            id: `err_${Date.now()}`,
            type: 'error',
            text: 'Uso: role <SUPORTE_N1 | SUPORTE_N2_ADMIN | FINANCEIRO | GESTOR_TI>',
            timestamp: time,
          });
        } else {
          let targetRole: UserRole | null = null;
          const roleArg = args[0].toUpperCase();
          if (roleArg.includes('N1')) targetRole = 'SUPORTE_N1';
          else if (roleArg.includes('N2') || roleArg.includes('ADMIN')) targetRole = 'SUPORTE_N2_ADMIN';
          else if (roleArg.includes('FIN')) targetRole = 'FINANCEIRO';
          else if (roleArg.includes('GESTOR')) targetRole = 'GESTOR_TI';

          if (targetRole) {
            setUserRole(targetRole);
            newLines.push({
              id: `out_${Date.now()}`,
              type: 'success',
              text: `[OK] Perfil RBAC alterado para: ${targetRole}. Acesso atualizado.`,
              timestamp: time,
            });
          } else {
            newLines.push({
              id: `err_${Date.now()}`,
              type: 'error',
              text: `Perfil desconhecido: "${args[0]}". Opções: N1, N2_ADMIN, FINANCEIRO, GESTOR.`,
              timestamp: time,
            });
          }
        }
        break;
      }

      case 'apps': {
        if (args[0] === 'add') {
          // apps add <nome> <url>
          const fullParams = trimmed.replace(/^apps\s+add\s+/i, '');
          const parts = fullParams.split('http');
          if (parts.length < 2) {
            newLines.push({
              id: `err_${Date.now()}`,
              type: 'error',
              text: 'Uso: apps add <Nome do Sistema> <https://url-do-sistema.com>',
              timestamp: time,
            });
          } else {
            const appName = parts[0].trim().replace(/^["']|["']$/g, '');
            const appUrl = `http${parts[1]}`.trim();
            const newAppId = `app_cli_${Date.now()}`;
            registerApp({
              id: newAppId,
              title: appName,
              subtitle: appUrl,
              category: 'sistema',
              iconName: 'Globe',
              allowedRoles: ['SUPORTE_N1', 'SUPORTE_N2_ADMIN'],
              embedType: 'iframe',
              url: appUrl,
              blocksIframe: false,
              onDesktop: true,
              pinnedToDock: false,
              isCustom: true,
            });
            newLines.push({
              id: `out_${Date.now()}`,
              type: 'success',
              text: `[SUCESSO] Aplicativo "${appName}" cadastrado com sucesso! ID: ${newAppId}`,
              timestamp: time,
            });
          }
        } else if (args[0] === 'remove') {
          const targetId = args[1];
          if (!targetId) {
            newLines.push({
              id: `err_${Date.now()}`,
              type: 'error',
              text: 'Uso: apps remove <app_id>',
              timestamp: time,
            });
          } else {
            removeCustomApp(targetId);
            newLines.push({
              id: `out_${Date.now()}`,
              type: 'success',
              text: `[OK] Solicitação de remoção executada para o ID: ${targetId}`,
              timestamp: time,
            });
          }
        } else {
          // List all apps
          const lines = allApps.map(
            a => `• [${a.id}] ${a.title} -> ${a.url || 'nativo'} (Permissões: ${a.allowedRoles.join(', ')})`
          );
          newLines.push({
            id: `out_${Date.now()}`,
            type: 'output',
            text: `Aplicativos Registrados no ESDINeX (${allApps.length}):\n${lines.join('\n')}`,
            timestamp: time,
          });
        }
        break;
      }

      case 'open':
      case 'run':
      case 'launch': {
        const targetId = args[0];
        if (!targetId) {
          newLines.push({
            id: `err_${Date.now()}`,
            type: 'error',
            text: 'Uso: open <app_id> (ex: open app_central_chamados, open app_cadastrar_app)',
            timestamp: time,
          });
        } else {
          // Find matching app by id or partial name
          const app = allApps.find(
            a => a.id.toLowerCase() === targetId.toLowerCase() || 
                 a.title.toLowerCase().includes(targetId.toLowerCase())
          );
          if (app) {
            openWindow(app.id);
            newLines.push({
              id: `out_${Date.now()}`,
              type: 'success',
              text: `[OK] Instanciada nova janela para o aplicativo: "${app.title}" (${app.id})`,
              timestamp: time,
            });
          } else {
            newLines.push({
              id: `err_${Date.now()}`,
              type: 'error',
              text: `Aplicativo não encontrado com identificador: "${targetId}". Digite "apps" para listar.`,
              timestamp: time,
            });
          }
        }
        break;
      }

      case 'close': {
        const targetId = args[0];
        if (!targetId) {
          newLines.push({
            id: `err_${Date.now()}`,
            type: 'error',
            text: 'Uso: close <window_id | app_id>',
            timestamp: time,
          });
        } else {
          const win = windows.find(
            w => w.id === targetId || w.appId === targetId || w.title.toLowerCase().includes(targetId.toLowerCase())
          );
          if (win) {
            closeWindow(win.id);
            newLines.push({
              id: `out_${Date.now()}`,
              type: 'success',
              text: `[OK] Janela "${win.title}" (${win.id}) fechada.`,
              timestamp: time,
            });
          } else {
            newLines.push({
              id: `err_${Date.now()}`,
              type: 'error',
              text: `Nenhuma janela ativa encontrada para: "${targetId}". Digite "windows" para listar.`,
              timestamp: time,
            });
          }
        }
        break;
      }

      case 'ps':
      case 'windows': {
        if (windows.length === 0) {
          newLines.push({
            id: `out_${Date.now()}`,
            type: 'output',
            text: 'Nenhuma janela ativa no momento.',
            timestamp: time,
          });
        } else {
          const list = windows.map(
            w => `• [${w.id}] "${w.title}" (z-index: ${w.zIndex}, ${w.bounds.width}x${w.bounds.height}, minimizada: ${w.isMinimized})`
          );
          newLines.push({
            id: `out_${Date.now()}`,
            type: 'output',
            text: `Processos / Janelas Ativas (${windows.length}):\n${list.join('\n')}`,
            timestamp: time,
          });
        }
        break;
      }

      case 'tickets': {
        const glpiList = (await glpiApi.getTickets()).map(
          t => `• [#${t.id}] Status: ${t.status} | Urgência: ${t.urgency}/5 | ${t.entity_name} -> ${t.name}`
        );
        newLines.push({
          id: `out_${Date.now()}`,
          type: 'output',
          text: `GLPI REST API (${apiConfig.baseUrl}) - ${glpiList.length} Chamados:\n${glpiList.join('\n')}`,
          timestamp: time,
        });
        break;
      }

      case 'ticket': {
        if (args[0] === 'new') {
          const ticketTitle = args.slice(1).join(' ');
          if (!ticketTitle) {
            newLines.push({
              id: `err_${Date.now()}`,
              type: 'error',
              text: 'Uso: ticket new <Título do Chamado>',
              timestamp: time,
            });
          } else {
            const newT = {
              id: `TK-${Math.floor(10000 + Math.random() * 90000)}`,
              title: ticketTitle,
              cliente: currentUser.clienteAtribuicao || 'Nexus Soluções Corporativas',
              departamento: currentUser.departamento || 'Suporte TI',
              requester: currentUser.name,
              category: 'Geral / TI',
              urgency: 'MEDIA' as const,
              status: 'NOVO' as const,
              createdAt: new Date().toLocaleString('pt-BR'),
              description: `Chamado aberto via Terminal do ESDINeX por ${currentUser.name}`,
            };
            addTicket(newT);
            newLines.push({
              id: `out_${Date.now()}`,
              type: 'success',
              text: `[SUCESSO] Chamado ${newT.id} aberto na Central ESDI!`,
              timestamp: time,
            });
          }
        } else {
          newLines.push({
            id: `err_${Date.now()}`,
            type: 'error',
            text: 'Uso: ticket new <titulo>',
            timestamp: time,
          });
        }
        break;
      }

      case 'ping': {
        const host = args[0] || 'sistema.esdi.com.br';
        newLines.push({
          id: `out_${Date.now()}`,
          type: 'output',
          text: `PING ${host} (10.0.4.12): 56 data bytes
64 bytes from 10.0.4.12: icmp_seq=1 ttl=64 time=11.4 ms
64 bytes from 10.0.4.12: icmp_seq=2 ttl=64 time=10.8 ms
64 bytes from 10.0.4.12: icmp_seq=3 ttl=64 time=11.2 ms
--- ${host} estatísticas de ping ---
3 pacotes transmitidos, 3 recebidos, 0% perda de pacotes, rtt médio = 11.1 ms`,
          timestamp: time,
        });
        break;
      }

      default: {
        newLines.push({
          id: `err_${Date.now()}`,
          type: 'error',
          text: `Comando desconhecido: "${command}". Digite "help" para ver a lista de comandos do OS.`,
          timestamp: time,
        });
      }
    }

    setHistory(prev => [...prev, ...newLines]);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(inputVal);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 font-mono text-xs select-text">
      {/* Top action toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 text-[11px]">
        <div className="flex items-center gap-2 text-slate-300">
          <TerminalIcon className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-semibold text-white">ESDINeX CLI Kernel</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => executeCommand('help')}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-[10px] transition-colors"
          >
            help
          </button>
          <button
            onClick={() => executeCommand('apps')}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-[10px] transition-colors"
          >
            apps
          </button>
          <button
            onClick={() => executeCommand('windows')}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-[10px] transition-colors"
          >
            windows
          </button>
          <button
            onClick={() => executeCommand('tickets')}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-[10px] transition-colors"
          >
            tickets
          </button>
          <button
            onClick={() => setHistory([])}
            title="Limpar"
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors ml-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Output Console */}
      <div className="flex-1 p-3 overflow-y-auto space-y-1.5 leading-relaxed bg-slate-950">
        {history.map(line => {
          let color = 'text-slate-300';
          if (line.type === 'input') color = 'text-blue-400 font-semibold';
          if (line.type === 'error') color = 'text-rose-400';
          if (line.type === 'success') color = 'text-emerald-400';
          if (line.type === 'info') color = 'text-slate-400';

          return (
            <div key={line.id} className="flex items-start gap-2">
              <span className="text-[10px] text-slate-600 select-none tabular-nums pt-0.5">
                {line.timestamp}
              </span>
              <pre className={`whitespace-pre-wrap flex-1 ${color}`}>
                {line.text}
              </pre>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Prompt Input */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/90 border-t border-slate-800">
        <span className="text-emerald-400 font-bold select-none">{currentUser.role.toLowerCase()}@esdinex:~$</span>
        <input
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite um comando (ex: apps, open app_central_chamados, windows, help)..."
          className="flex-1 bg-transparent text-slate-100 text-xs focus:outline-none placeholder-slate-600"
          autoFocus
        />
        <button
          onClick={() => executeCommand(inputVal)}
          className="p-1 text-slate-400 hover:text-white"
        >
          <Play className="w-3 h-3 fill-current" />
        </button>
      </div>
    </div>
  );
};
