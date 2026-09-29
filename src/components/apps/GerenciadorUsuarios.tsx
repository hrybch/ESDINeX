import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  KeyRound, 
  Smartphone, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  RefreshCw, 
  Building2, 
  Filter, 
  UserCheck, 
  Mail, 
  Phone
} from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { UserProfile, UserRole } from '../../types/os';

export const GerenciadorUsuarios: React.FC = () => {
  const { 
    users, 
    currentUser, 
    setCurrentUser, 
    addUser, 
    updateUser, 
    deleteUser 
  } = useOS();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [twoFactorFilter, setTwoFactorFilter] = useState<string>('ALL');

  // Modal State for New User
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('SUPORTE_N1');
  const [newDepartamento, setNewDepartamento] = useState('NOC / Suporte N1');
  const [newCliente, setNewCliente] = useState('Central de Operações ESDI');
  const [newPhone, setNewPhone] = useState('(11) 98765-4321');
  const [new2faMethod, setNew2faMethod] = useState<'totp' | 'certificado_a3' | 'sms'>('totp');
  const [new2faEnabled, setNew2faEnabled] = useState(true);

  // Filtered users calculation
  const filteredUsers = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (u.clienteAtribuicao && u.clienteAtribuicao.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (u.departamento && u.departamento.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const match2fa = twoFactorFilter === 'ALL' || 
                     (twoFactorFilter === 'ENABLED' && u.twoFactorEnabled) ||
                     (twoFactorFilter === 'DISABLED' && !u.twoFactorEnabled);

    return matchSearch && matchRole && match2fa;
  });

  // Metrics
  const stats = {
    total: users.length,
    twoFactorActive: users.filter(u => u.twoFactorEnabled).length,
    admins: users.filter(u => u.role === 'SUPORTE_N2_ADMIN' || u.role === 'GESTOR_TI').length,
    blocked: users.filter(u => u.status === 'bloqueado').length,
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      alert('Informe ao menos o nome completo e o e-mail do técnico/operador.');
      return;
    }

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      role: newRole,
      clienteAtribuicao: newCliente.trim(),
      departamento: newDepartamento.trim(),
      phone: newPhone.trim(),
      twoFactorEnabled: new2faEnabled,
      twoFactorMethod: new2faMethod,
      status: 'ativo',
      lastLogin: 'Nunca acessou',
    };

    addUser(newUser);

    // Reset form
    setNewName('');
    setNewEmail('');
    setIsAddModalOpen(false);
    alert(`Usuário "${newUser.name}" cadastrado com sucesso com 2FA corporativo!`);
  };

  const handleToggleStatus = (user: UserProfile) => {
    if (user.id === currentUser.id) {
      alert('Você não pode bloquear o próprio usuário logado no momento.');
      return;
    }
    const nextStatus = user.status === 'ativo' ? 'bloqueado' : 'ativo';
    updateUser(user.id, { status: nextStatus });
  };

  const handleToggle2FA = (user: UserProfile) => {
    updateUser(user.id, { twoFactorEnabled: !user.twoFactorEnabled });
  };

  const handleReset2FASecret = (user: UserProfile) => {
    alert(`Chave secreta 2FA redefinida com sucesso para ${user.name}. Um novo provisionamento foi enviado para ${user.email}.`);
  };

  const handleImpersonate = (user: UserProfile) => {
    if (user.status === 'bloqueado') {
      alert('Esta conta está bloqueada e não pode iniciar sessão.');
      return;
    }
    setCurrentUser(user);
    alert(`Sessão alterada para: ${user.name} (${user.role}). O WebOS agora reflete as permissões desta conta.`);
  };

  const handleDeleteUser = (user: UserProfile) => {
    if (user.id === currentUser.id) {
      alert('Você não pode excluir a sua própria conta enquanto estiver logado com ela.');
      return;
    }
    if (confirm(`Atenção: Tem certeza de que deseja excluir o cadastro do usuário "${user.name}" (${user.email})?\n\nEsta ação removerá permanentemente as permissões dele do sistema.`)) {
      const res = deleteUser(user.id);
      alert(res.message);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'SUPORTE_N2_ADMIN':
        return { label: 'Admin TI N2', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
      case 'GESTOR_TI':
        return { label: 'Gestor de TI', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'SUPORTE_N1':
        return { label: 'Suporte N1', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      case 'FINANCEIRO':
        return { label: 'Financeiro', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      default:
        return { label: role, color: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  const get2faMethodLabel = (method: string) => {
    switch (method) {
      case 'totp': return 'App TOTP (Google/Microsoft)';
      case 'certificado_a3': return 'Certificado Digital A3';
      case 'sms': return 'SMS Token';
      default: return method;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-text">
      {/* Top Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md font-bold text-sm">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">Gerenciador de Usuários e Identidades TI</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                RBAC & 2FA
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Controle de acessos de analistas, permissões de suporte e credenciais de dois fatores
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar Novo Usuário</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/80 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Total de Usuários TI</div>
          <div className="text-xl font-bold font-mono text-white mt-1">{stats.total}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Analistas & Operadores</div>
        </div>

        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Compliance 2FA</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {stats.twoFactorActive} / {stats.total}
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-0.5">
            {Math.round((stats.twoFactorActive / (stats.total || 1)) * 100)}% das contas protegidas
          </div>
        </div>

        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Administradores & Gestão</div>
          <div className="text-xl font-bold font-mono text-blue-400 mt-1">{stats.admins}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Acesso administrativo total</div>
        </div>

        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Contas Bloqueadas</div>
          <div className={`text-xl font-bold font-mono mt-1 ${stats.blocked > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
            {stats.blocked}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Acesso suspenso</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Pesquisar por nome, e-mail, departamento ou cliente..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-slate-500 text-[11px]">Papel:</span>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 text-xs"
            >
              <option value="ALL">Todos os Papéis</option>
              <option value="SUPORTE_N1">Suporte N1</option>
              <option value="SUPORTE_N2_ADMIN">Admin N2</option>
              <option value="GESTOR_TI">Gestor de TI</option>
              <option value="FINANCEIRO">Financeiro</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-500 text-[11px]">2FA:</span>
            <select
              value={twoFactorFilter}
              onChange={e => setTwoFactorFilter(e.target.value)}
              className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 text-xs"
            >
              <option value="ALL">Todos</option>
              <option value="ENABLED">2FA Ativo</option>
              <option value="DISABLED">2FA Inativo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/30">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] text-slate-400 font-semibold select-none">
                <th className="py-2.5 px-3">Usuário / Analista</th>
                <th className="py-2.5 px-3">Cliente / Departamento</th>
                <th className="py-2.5 px-3">Papel RBAC</th>
                <th className="py-2.5 px-3">Status 2FA</th>
                <th className="py-2.5 px-3">Status Conta</th>
                <th className="py-2.5 px-3">Último Acesso</th>
                <th className="py-2.5 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    Nenhum usuário encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const roleBadge = getRoleBadge(user.role);
                  const isCurrent = user.id === currentUser.id;

                  return (
                    <tr key={user.id} className="hover:bg-slate-900/50 transition-colors">
                      {/* Name & Email */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                            isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {user.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {isCurrent && (
                                <span className="text-[9px] font-mono px-1.5 rounded bg-blue-500/20 text-blue-400">
                                  Você
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Cliente / Departamento */}
                      <td className="py-3 px-3">
                        <div className="text-slate-200">{user.clienteAtribuicao || 'Central ESDI'}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{user.departamento || 'Suporte Técnico'}</div>
                      </td>

                      {/* Role */}
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${roleBadge.color}`}>
                          {roleBadge.label}
                        </span>
                      </td>

                      {/* 2FA */}
                      <td className="py-3 px-3">
                        {user.twoFactorEnabled ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Ativo</span>
                            </span>
                            <div className="text-[10px] text-slate-500">{get2faMethodLabel(user.twoFactorMethod)}</div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-mono">
                            <ShieldAlert className="w-3 h-3" />
                            <span>Desativado</span>
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        {user.status === 'ativo' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>Ativo</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            <span>Bloqueado</span>
                          </span>
                        )}
                      </td>

                      {/* Last Login */}
                      <td className="py-3 px-3 font-mono text-[10px] text-slate-400">
                        {user.lastLogin || 'Nunca'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleImpersonate(user)}
                            title="Alternar para esta conta"
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggle2FA(user)}
                            title={user.twoFactorEnabled ? 'Desativar 2FA' : 'Ativar 2FA'}
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-blue-400 rounded transition-colors"
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleReset2FASecret(user)}
                            title="Redefinir chave secreta 2FA"
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-amber-400 rounded transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(user)}
                            title={user.status === 'ativo' ? 'Bloquear Usuário' : 'Desbloquear Usuário'}
                            className={`p-1 hover:bg-slate-800 rounded transition-colors ${
                              user.status === 'ativo' ? 'text-slate-400 hover:text-rose-400' : 'text-emerald-400'
                            }`}
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </button>

                          {!isCurrent && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              title="Excluir Usuário"
                              className="p-1 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Cadastrar Novo Usuário */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4 text-xs">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-400" />
                <span>Cadastrar Novo Usuário de TI</span>
              </h3>
              <p className="text-slate-400 mt-0.5">
                Crie o perfil de acesso com autenticação de dois fatores obrigatória
              </p>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mariana Duarte"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">E-mail Corporativo *</label>
                <input
                  type="email"
                  required
                  placeholder="mariana@esdi.com.br"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Cliente / Empresa Suportada</label>
                  <input
                    type="text"
                    value={newCliente}
                    onChange={e => setNewCliente(e.target.value)}
                    placeholder="Ex: Nexus Tecnologia"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Departamento / Setor</label>
                  <input
                    type="text"
                    value={newDepartamento}
                    onChange={e => setNewDepartamento(e.target.value)}
                    placeholder="Ex: Infraestrutura TI"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Perfil RBAC</label>
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="SUPORTE_N1">Suporte N1</option>
                    <option value="SUPORTE_N2_ADMIN">Suporte N2 / SysAdmin</option>
                    <option value="GESTOR_TI">Gestor de TI</option>
                    <option value="FINANCEIRO">Financeiro</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Método 2FA</label>
                  <select
                    value={new2faMethod}
                    onChange={e => setNew2faMethod(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="totp">App TOTP</option>
                    <option value="certificado_a3">Certificado Digital A3</option>
                    <option value="sms">SMS Token</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Telefone / Celular</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={new2faEnabled}
                    onChange={e => setNew2faEnabled(e.target.checked)}
                    className="rounded border-slate-800 text-blue-600 focus:ring-0"
                  />
                  <span>Exigir 2FA no login (Recomendado para Segurança da Informação)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded shadow-sm"
                >
                  Salvar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
