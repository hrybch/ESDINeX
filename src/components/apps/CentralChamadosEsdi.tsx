import React, { useState, useEffect } from 'react';
import { 
  Headphones, 
  Search, 
  Plus, 
  Filter, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  MessageSquare, 
  Globe, 
  User, 
  RefreshCw,
  Send,
  Building,
  Tag,
  ArrowUpRight,
  Settings,
  BookOpen,
  Calendar,
  CheckSquare,
  Lock,
  Activity,
  Server,
  FileCode,
  ShieldCheck,
  ChevronRight,
  HardDrive
} from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { 
  GlpiTicket, 
  GlpiFollowup, 
  GlpiTask, 
  GlpiCategory, 
  GlpiEntity, 
  GlpiKnowbaseItem, 
  GlpiPlanningItem, 
  GlpiApiConfig 
} from '../../types/glpi';
import { glpiApi } from '../../services/glpiApi';
import { glpiService, GLPI_ENV, mapGlpiStatus, mapGlpiUrgency } from '../../services/glpiService';

export const CentralChamadosEsdi: React.FC = () => {
  const { currentUser } = useOS();

  // Navigation tabs matching GLPI Central tools
  const [activeTab, setActiveTab] = useState<'central' | 'tickets' | 'novo' | 'knowbase' | 'planejamento' | 'api_config'>('central');

  // GLPI API data state
  const [tickets, setTickets] = useState<GlpiTicket[]>([]);
  const [categories, setCategories] = useState<GlpiCategory[]>([]);
  const [entities, setEntities] = useState<GlpiEntity[]>([]);
  const [knowbase, setKnowbase] = useState<GlpiKnowbaseItem[]>([]);
  const [planning, setPlanning] = useState<GlpiPlanningItem[]>([]);
  const [apiConfig, setApiConfig] = useState<GlpiApiConfig>(glpiApi.getConfig());

  // Ticket detail view state
  const [selectedTicket, setSelectedTicket] = useState<GlpiTicket | null>(null);
  const [ticketSubTab, setTicketSubTab] = useState<'followups' | 'tasks' | 'solution' | 'assets'>('followups');
  const [followups, setFollowups] = useState<GlpiFollowup[]>([]);
  const [tasks, setTasks] = useState<GlpiTask[]>([]);

  // Followup form state
  const [newFollowupText, setNewFollowupText] = useState('');
  const [isPrivateFollowup, setIsPrivateFollowup] = useState(false);

  // Task form state
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskMinutes, setNewTaskMinutes] = useState(15);
  const [showAddTask, setShowAddTask] = useState(false);

  // Solution form state
  const [solutionText, setSolutionText] = useState('');
  const [showSolveModal, setShowSolveModal] = useState(false);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | 'ALL'>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<number | 'ALL'>('ALL');
  const [entityFilter, setEntityFilter] = useState<number | 'ALL'>('ALL');

  // Form states for new ticket
  const [newName, setNewName] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newEntityId, setNewEntityId] = useState<number>(1);
  const [newCategoryId, setNewCategoryId] = useState<number>(1);
  const [newUrgency, setNewUrgency] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [newType, setNewType] = useState<1 | 2>(1);
  const [newRequester, setNewRequester] = useState('');

  // API Test state
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<string | null>(null);
  const [configForm, setConfigForm] = useState({
    baseUrl: apiConfig.baseUrl,
    apiPath: apiConfig.apiPath,
    appToken: apiConfig.appToken,
    userToken: apiConfig.userToken,
  });

  // Load initial data from GLPI API using credentials from environment variables
  const refreshData = async () => {
    // 1. Fetch tickets directly via glpiService reading import.meta.env
    const normalizedTickets = await glpiService.fetchTickets();
    
    // Map to GlpiTicket interface for rich view
    const ticketList: GlpiTicket[] = normalizedTickets.map(nt => ({
      id: nt.id,
      name: nt.name,
      content: nt.content,
      status: nt.status as any,
      urgency: nt.urgency as any,
      impact: nt.urgency as any,
      priority: nt.priority as any,
      type: nt.type,
      date: nt.date,
      date_mod: nt.date_mod,
      solvedate: nt.solvedate,
      itilcategories_id: 1,
      category_name: nt.category_name,
      entities_id: 1,
      entity_name: nt.entity_name,
      cliente_unidade: nt.cliente_unidade,
      users_id_recipient: 101,
      requester_name: nt.requester_name,
      assigned_name: nt.assigned_name,
      followups_count: nt.followups_count,
      tasks_count: nt.tasks_count,
    }));

    setTickets(ticketList);
    setCategories(glpiApi.getCategories());
    setEntities(glpiApi.getEntities());
    setKnowbase(glpiApi.getKnowbaseItems());
    setPlanning(glpiApi.getPlanningItems());
    setApiConfig(glpiApi.getConfig());

    if (!selectedTicket && ticketList.length > 0) {
      setSelectedTicket(ticketList[0]);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Update followups & tasks when selected ticket changes
  useEffect(() => {
    if (selectedTicket) {
      setFollowups(glpiApi.getFollowups(selectedTicket.id));
      setTasks(glpiApi.getTasks(selectedTicket.id));
    }
  }, [selectedTicket]);

  // Handler: Add followup to ticket
  const handleAddFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFollowupText.trim() || !selectedTicket) return;

    await glpiApi.addFollowup(
      selectedTicket.id,
      newFollowupText.trim(),
      isPrivateFollowup,
      currentUser.name
    );

    setNewFollowupText('');
    setFollowups(glpiApi.getFollowups(selectedTicket.id));
    refreshData();
  };

  // Handler: Add task to ticket
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim() || !selectedTicket) return;

    await glpiApi.addTask(
      selectedTicket.id,
      newTaskText.trim(),
      newTaskMinutes * 60,
      currentUser.name
    );

    setNewTaskText('');
    setShowAddTask(false);
    setTasks(glpiApi.getTasks(selectedTicket.id));
    refreshData();
  };

  // Handler: Solve ticket (ITILSolution)
  const handleSolveTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solutionText.trim() || !selectedTicket) return;

    await glpiApi.addSolution(selectedTicket.id, solutionText.trim(), currentUser.name);

    setSolutionText('');
    setShowSolveModal(false);
    const updated = (await glpiApi.getTickets()).find(t => t.id === selectedTicket.id);
    if (updated) setSelectedTicket(updated);
    refreshData();
  };

  // Handler: Create new ticket via GLPI API
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newContent.trim()) {
      alert('Por favor, informe o título e a descrição do chamado.');
      return;
    }

    const created = await glpiApi.createTicket({
      name: newName.trim(),
      content: newContent.trim(),
      itilcategories_id: newCategoryId,
      entities_id: newEntityId,
      urgency: newUrgency,
      type: newType,
      requester_name: newRequester.trim() || currentUser.name,
    });

    // Reset form
    setNewName('');
    setNewContent('');
    setNewRequester('');

    await refreshData();
    setSelectedTicket(created);
    setActiveTab('tickets');
  };

  // Handler: Test GLPI REST API Connection
  const handleTestApi = async () => {
    setIsTestingApi(true);
    setApiTestResult(null);

    glpiApi.saveConfig(configForm);
    const result = await glpiApi.testConnection(configForm);

    setIsTestingApi(false);
    setApiTestResult(result.message);
    setApiConfig(glpiApi.getConfig());
  };

  // Statistics calculation for the Central Dashboard
  const stats = {
    total: tickets.length,
    novos: tickets.filter(t => t.status === 1).length,
    atribuidos: tickets.filter(t => t.status === 2 || t.status === 3).length,
    pendentes: tickets.filter(t => t.status === 4).length,
    solucionados: tickets.filter(t => t.status === 5 || t.status === 6).length,
  };

  // Filtered tickets
  const filteredTickets = tickets.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (t.entity_name && t.entity_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        t.id.toString().includes(searchTerm) ||
                        (t.category_name && t.category_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchEntity = entityFilter === 'ALL' || t.entities_id === entityFilter;
    const matchUrgency = urgencyFilter === 'ALL' || t.urgency === urgencyFilter;

    return matchSearch && matchStatus && matchEntity && matchUrgency;
  });

  const getStatusLabel = (status: number) => {
    const meta = mapGlpiStatus(status);
    return { label: meta.label, shortLabel: meta.shortLabel, color: `${meta.textColor} ${meta.badgeClass}` };
  };

  const getUrgencyLabel = (urgency: number) => {
    const meta = mapGlpiUrgency(urgency);
    return { label: meta.label, shortLabel: meta.shortLabel, color: `${meta.textColor} ${meta.badgeClass}` };
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-text">
      {/* Top GLPI Corporate Navigation Bar */}
      <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 select-none">
        {/* Brand & Instance */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md font-bold text-xs tracking-wider">
            GLPI
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">Central de Chamados ESDI</span>
              <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                GLPI API REST
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
              <span>{GLPI_ENV.baseUrl}</span>
              <span>·</span>
              <span className="text-slate-500">front/central.php</span>
              <span>·</span>
              <span className="text-emerald-400 text-[10px]">Env Credentials</span>
            </div>
          </div>
        </div>

        {/* GLPI Primary Tools Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('central')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              activeTab === 'central' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Central ITIL
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              activeTab === 'tickets' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Chamados ({stats.total})
          </button>

          <button
            onClick={() => setActiveTab('novo')}
            className={`flex items-center gap-1 px-3 py-1 font-medium rounded-md transition-colors ${
              activeTab === 'novo' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Chamado</span>
          </button>

          <button
            onClick={() => setActiveTab('knowbase')}
            className={`flex items-center gap-1 px-3 py-1 font-medium rounded-md transition-colors ${
              activeTab === 'knowbase' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>FAQ / Manuais</span>
          </button>

          <button
            onClick={() => setActiveTab('planejamento')}
            className={`flex items-center gap-1 px-3 py-1 font-medium rounded-md transition-colors ${
              activeTab === 'planejamento' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Planejamento</span>
          </button>

          <button
            onClick={() => setActiveTab('api_config')}
            className={`flex items-center gap-1 px-2.5 py-1 font-medium rounded-md transition-colors ${
              activeTab === 'api_config' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Configurações e Console da API REST do GLPI"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>API</span>
          </button>
        </div>

        {/* External Web Link */}
        <a
          href="https://sistema.esdi.com.br/front/central.php"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs border border-slate-700 transition-colors"
          title="Abrir GLPI Web Oficial em nova aba"
        >
          <span>Abrir GLPI Web</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* VIEW 1: CENTRAL / DASHBOARD ITIL */}
      {activeTab === 'central' && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header Overview */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Painel Geral da Central de Chamados (front/central.php)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitoramento consolidado de demandas de TI das serventias notariais e registrais
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={refreshData}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded text-xs transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sincronizar GLPI</span>
              </button>
            </div>
          </div>

          {/* Metric Cards (Single-Elevation, high contrast) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div 
              onClick={() => { setStatusFilter(1); setActiveTab('tickets'); }}
              className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Novos Incidentes</span>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-white mt-2">
                {stats.novos}
              </div>
              <div className="text-[11px] text-amber-400 mt-1">Aguardando atribuição inicial</div>
            </div>

            <div 
              onClick={() => { setStatusFilter(2); setActiveTab('tickets'); }}
              className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Em Atendimento</span>
                <span className="w-2 h-2 rounded-full bg-blue-400" />
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-white mt-2">
                {stats.atribuidos}
              </div>
              <div className="text-[11px] text-blue-400 mt-1">Técnicos N1/N2 atuando</div>
            </div>

            <div 
              onClick={() => { setStatusFilter(4); setActiveTab('tickets'); }}
              className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Pendentes</span>
                <span className="w-2 h-2 rounded-full bg-orange-400" />
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-white mt-2">
                {stats.pendentes}
              </div>
              <div className="text-[11px] text-orange-400 mt-1">Aguardando cartório / TJ</div>
            </div>

            <div 
              onClick={() => { setStatusFilter(5); setActiveTab('tickets'); }}
              className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Solucionados</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-white mt-2">
                {stats.solucionados}
              </div>
              <div className="text-[11px] text-emerald-400 mt-1">Atendimento concluído</div>
            </div>
          </div>

          {/* Quick Central Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Urgent Tickets Queue */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Chamados que Requerem Atenção Imediata</span>
                </h4>
                <button
                  onClick={() => setActiveTab('tickets')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                >
                  Ver todos →
                </button>
              </div>

              <div className="divide-y divide-slate-800/60">
                {tickets.slice(0, 3).map(ticket => {
                  const statusInfo = getStatusLabel(ticket.status);
                  return (
                    <div
                      key={ticket.id}
                      onClick={() => { setSelectedTicket(ticket); setActiveTab('tickets'); }}
                      className="py-3 cursor-pointer hover:bg-slate-900/50 rounded-lg px-2 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-400">#{ticket.id}</span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <h5 className="text-xs font-semibold text-white truncate mt-1">{ticket.name}</h5>
                        <p className="text-[11px] text-slate-400 truncate">{ticket.entity_name} · CNS {ticket.cartorio_cns}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono text-slate-500">{ticket.date.substring(0, 16)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Planning & Scheduled Interventions */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span>Planejamento & Intervenções em Serventias</span>
                </h4>
                <button
                  onClick={() => setActiveTab('planejamento')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                >
                  Agenda completa →
                </button>
              </div>

              <div className="space-y-2.5">
                {planning.map(item => (
                  <div key={item.id} className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{item.title}</span>
                      <span className="text-[10px] font-mono text-blue-400 px-1.5 py-0.5 bg-blue-500/10 rounded">
                        {item.type}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">{item.cliente}</div>
                    <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between pt-1">
                      <span>Início: {item.begin}</span>
                      <span>Resp: {item.technician}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CHAMADOS (TICKETS EXPLORER COM ABAS ITIL) */}
      {activeTab === 'tickets' && (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Tickets List */}
          <div className="w-full md:w-[440px] border-r border-slate-800 flex flex-col bg-slate-900/30">
            {/* Search & Filters Bar */}
            <div className="p-3 border-b border-slate-800 space-y-2.5 bg-slate-900/50">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Pesquisar por #ID, título, cliente ou falha..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Status & Urgency Filters */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 overflow-x-auto text-[10px]">
                  <span className="text-[10px] text-slate-500 font-mono pr-1">Status:</span>
                  {[
                    { id: 'ALL', label: 'Todos' },
                    { id: 1, label: 'Novos' },
                    { id: 2, label: 'Atendendo' },
                    { id: 4, label: 'Pendentes' },
                    { id: 5, label: 'Solucionados' },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setStatusFilter(item.id as any)}
                      className={`px-2 py-0.5 rounded transition-colors whitespace-nowrap ${
                        statusFilter === item.id
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 overflow-x-auto text-[10px]">
                  <span className="text-[10px] text-slate-500 font-mono pr-1">Urgência:</span>
                  {[
                    { id: 'ALL', label: 'Todas' },
                    { id: 5, label: '5-Crítica' },
                    { id: 4, label: '4-Alta' },
                    { id: 3, label: '3-Média' },
                    { id: 2, label: '2-Baixa' },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setUrgencyFilter(item.id as any)}
                      className={`px-2 py-0.5 rounded transition-colors whitespace-nowrap ${
                        urgencyFilter === item.id
                          ? 'bg-amber-600 text-white font-semibold'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tickets list */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
              {filteredTickets.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Nenhum chamado encontrado com os filtros atuais.
                </div>
              ) : (
                filteredTickets.map(ticket => {
                  const isSelected = selectedTicket?.id === ticket.id;
                  const statusInfo = getStatusLabel(ticket.status);
                  const urgencyInfo = getUrgencyLabel(ticket.urgency);

                  return (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`p-3.5 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-600/15 border-l-2 border-blue-500'
                          : 'hover:bg-slate-900/50 border-l-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[11px] font-bold text-blue-400">
                            #{ticket.id}
                          </span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${urgencyInfo.color}`}>
                            {urgencyInfo.shortLabel}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-500">
                          {ticket.date.substring(0, 10)}
                        </span>
                      </div>

                      <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">
                        {ticket.name}
                      </h4>

                      <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                        <span className="truncate max-w-[220px]">{ticket.entity_name}</span>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                          <span>💬 {ticket.followups_count || 0}</span>
                          <span>⚙ {ticket.tasks_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Full ITIL Ticket Details */}
          {selectedTicket ? (
            <div className="flex-1 flex flex-col overflow-y-auto bg-slate-950 p-6 space-y-5">
              {/* Ticket Header */}
              <div className="pb-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-bold text-blue-400">Chamado #{selectedTicket.id}</span>
                    <span className="text-slate-600">·</span>
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${getStatusLabel(selectedTicket.status).color}`}>
                      {getStatusLabel(selectedTicket.status).label}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${getUrgencyLabel(selectedTicket.urgency).color}`}>
                      Urgência: {getUrgencyLabel(selectedTicket.urgency).label}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs text-slate-400">{selectedTicket.category_name}</span>
                  </div>

                  <h3 className="text-base font-bold text-white tracking-tight mt-1.5">
                    {selectedTicket.name}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {selectedTicket.status !== 5 && selectedTicket.status !== 6 && (
                    <button
                      onClick={() => setShowSolveModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Registrar Solução GLPI</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Serventia and Requester Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Serventia / Cartório</div>
                  <div className="font-semibold text-slate-200 mt-0.5">{selectedTicket.entity_name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">CNS {selectedTicket.cartorio_cns}</div>
                </div>

                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Solicitante</div>
                  <div className="font-semibold text-slate-200 mt-0.5">{selectedTicket.requester_name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">Aberto em {selectedTicket.date}</div>
                </div>

                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Técnico Atribuído</div>
                  <div className="font-semibold text-slate-200 mt-0.5">
                    {selectedTicket.assigned_name || 'Fila Geral de Suporte N1'}
                  </div>
                  <div className="text-[10px] text-blue-400 font-mono">SLA Resolução: 4h</div>
                </div>
              </div>

              {/* Incident Full Description */}
              <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-lg space-y-2">
                <div className="text-xs font-semibold text-slate-300">Descrição do Incidente (Corpo do Chamado)</div>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedTicket.content}
                </p>
              </div>

              {/* ITIL Tabs: Acompanhamentos, Tarefas, Solução, Ativos */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-1 border-b border-slate-800 text-xs">
                  <button
                    onClick={() => setTicketSubTab('followups')}
                    className={`pb-2 px-3 font-semibold transition-colors border-b-2 ${
                      ticketSubTab === 'followups'
                        ? 'border-blue-500 text-white'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Acompanhamentos ({followups.length})
                  </button>

                  <button
                    onClick={() => setTicketSubTab('tasks')}
                    className={`pb-2 px-3 font-semibold transition-colors border-b-2 ${
                      ticketSubTab === 'tasks'
                        ? 'border-blue-500 text-white'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Tarefas Técnicas ({tasks.length})
                  </button>

                  <button
                    onClick={() => setTicketSubTab('assets')}
                    className={`pb-2 px-3 font-semibold transition-colors border-b-2 ${
                      ticketSubTab === 'assets'
                        ? 'border-blue-500 text-white'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Ativos da Serventia
                  </button>
                </div>

                {/* SUBTAB: FOLLOWUPS (ITILFollowup) */}
                {ticketSubTab === 'followups' && (
                  <div className="space-y-3">
                    {followups.map(f => (
                      <div
                        key={f.id}
                        className={`p-3.5 rounded-lg border text-xs space-y-1.5 ${
                          f.is_private
                            ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                            : 'bg-slate-900/50 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-semibold text-white flex items-center gap-1.5">
                            {f.author_name}
                            {f.is_private && (
                              <span className="text-[10px] font-mono text-amber-400 px-1 rounded bg-amber-500/10">
                                Nota Privada
                              </span>
                            )}
                          </span>
                          <span className="font-mono text-slate-500">{f.date}</span>
                        </div>
                        <p className="leading-relaxed">{f.content}</p>
                      </div>
                    ))}

                    {/* New Followup Input */}
                    <form onSubmit={handleAddFollowup} className="space-y-2 pt-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Adicionar Acompanhamento Técnico ao GLPI:</span>
                        <label className="flex items-center gap-1.5 cursor-pointer text-[11px]">
                          <input
                            type="checkbox"
                            checked={isPrivateFollowup}
                            onChange={e => setIsPrivateFollowup(e.target.checked)}
                            className="rounded border-slate-800 text-amber-500 focus:ring-0"
                          />
                          <span>Nota privada (visível apenas para equipe TI)</span>
                        </label>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={newFollowupText}
                          onChange={e => setNewFollowupText(e.target.value)}
                          placeholder="Digite a resposta ou atualização para o cliente..."
                          className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Enviar ao GLPI</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* SUBTAB: TASKS (TicketTask) */}
                {ticketSubTab === 'tasks' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Horas e tarefas de suporte técnico registradas:</span>
                      <button
                        onClick={() => setShowAddTask(prev => !prev)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Adicionar Tarefa</span>
                      </button>
                    </div>

                    {showAddTask && (
                      <form onSubmit={handleAddTask} className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-3">
                        <div className="text-xs font-semibold text-white">Nova Tarefa Técnica</div>
                        <input
                          type="text"
                          required
                          placeholder="Descrição da ação executada..."
                          value={newTaskText}
                          onChange={e => setNewTaskText(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                        />
                        <div className="flex items-center gap-3">
                          <label className="text-xs text-slate-400">Tempo gasto (minutos):</label>
                          <input
                            type="number"
                            min="5"
                            step="5"
                            value={newTaskMinutes}
                            onChange={e => setNewTaskMinutes(Number(e.target.value))}
                            className="w-20 px-2 py-1 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 font-mono"
                          />
                          <button
                            type="submit"
                            className="ml-auto px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded"
                          >
                            Registrar Horas
                          </button>
                        </div>
                      </form>
                    )}

                    {tasks.map(t => (
                      <div key={t.id} className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg text-xs flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-200">{t.content}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Executado por {t.author_name} · {t.date}</div>
                        </div>
                        <div className="font-mono text-emerald-400 text-xs font-bold">
                          {Math.round(t.actiontime / 60)} min
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* SUBTAB: ASSETS (Items do Cartório) */}
                {ticketSubTab === 'assets' && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Server className="w-4 h-4 text-blue-400" />
                        <div>
                          <div className="font-semibold text-slate-200">Servidor Principal de Notas (Dell PowerEdge R440)</div>
                          <div className="text-[10px] text-slate-500 font-mono">IP: 10.142.10.1 · SO: Ubuntu Server 24.04 LTS</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">Ativo Operacional</span>
                    </div>

                    <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <HardDrive className="w-4 h-4 text-cyan-400" />
                        <div>
                          <div className="font-semibold text-slate-200">Storage NAS QNAP RAID 5 (Backup Provimento 74)</div>
                          <div className="text-[10px] text-slate-500 font-mono">Volume: 8TB · Criptografia AES-256 Ativa</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">Imutável</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
              Selecione um chamado na lista para visualização completa.
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: NOVO CHAMADO GLPI */}
      {activeTab === 'novo' && (
        <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Abertura de Chamado via API GLPI (POST /Ticket)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Registra diretamente o incidente ou requisição na fila oficial da ESDI
              </p>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Título do Chamado *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Falha na validação de assinatura digital no Provimento 100"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Entidade / Serventia *</label>
                  <select
                    value={newEntityId}
                    onChange={e => setNewEntityId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    {entities.map(e => (
                      <option key={e.id} value={e.id}>{e.name} (CNS {e.cns})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Categoria ITIL *</label>
                  <select
                    value={newCategoryId}
                    onChange={e => setNewCategoryId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Tipo</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(Number(e.target.value) as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value={1}>Incidente (Falha / Parada)</option>
                    <option value={2}>Requisição (Configuração)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Urgência ITIL</label>
                  <select
                    value={newUrgency}
                    onChange={e => setNewUrgency(Number(e.target.value) as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value={1}>1 - Muito Baixa</option>
                    <option value={2}>2 - Baixa</option>
                    <option value={3}>3 - Média</option>
                    <option value={4}>4 - Alta</option>
                    <option value={5}>5 - Muito Alta (Crítica)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Solicitante</label>
                  <input
                    type="text"
                    placeholder="Nome do Solicitante / Contato no Cliente"
                    value={newRequester}
                    onChange={e => setNewRequester(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Descrição Detalhada do Incidente *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Relate com precisão mensagens de erro, códigos de status do TJ ou sintomas observados..."
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('tickets')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Registrar Chamado no GLPI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW 4: BASE DE CONHECIMENTO (KNOWBASE) */}
      {activeTab === 'knowbase' && (
        <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Base de Conhecimento & Procedimentos (KnowbaseItem)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Procedimentos operacionais padronizados para suporte aos clientes da ESDI
            </p>
          </div>

          <div className="space-y-3">
            {knowbase.map(item => (
              <div key={item.id} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{item.name}</span>
                  <span className="text-[10px] font-mono text-slate-500">Visualizações: {item.views}</span>
                </div>
                <div className="text-[10px] font-mono text-blue-400">{item.category_name}</div>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 5: PLANEJAMENTO (CALENDÁRIO GLPI) */}
      {activeTab === 'planejamento' && (
        <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Planejamento de Intervenções Técnicas
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Janelas de manutenção programadas em servidores e rotinas noturnas dos cartórios
            </p>
          </div>

          <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
            {planning.map(p => (
              <div key={p.id} className="p-4 space-y-1.5 hover:bg-slate-900/60 transition-colors">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white">{p.title}</h4>
                  <span className="text-[11px] font-mono text-blue-400 px-2 py-0.5 bg-blue-500/10 rounded">
                    {p.type}
                  </span>
                </div>
                <div className="text-xs text-slate-300">{p.cartorio}</div>
                <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between pt-1">
                  <span>Início: {p.begin} · Fim: {p.end}</span>
                  <span>Técnico: {p.technician}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 6: CONFIGURAÇÕES DA API GLPI */}
      {activeTab === 'api_config' && (
        <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full space-y-5">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                <span>Configuração da Integração GLPI REST API</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Parâmetros de autenticação HTTP para comunicação com o servidor ESDI
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">URL Base do Servidor GLPI</label>
                <input
                  type="text"
                  value={configForm.baseUrl}
                  onChange={e => setConfigForm({ ...configForm, baseUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Endpoint da API REST</label>
                <input
                  type="text"
                  value={configForm.apiPath}
                  onChange={e => setConfigForm({ ...configForm, apiPath: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">App-Token (Segurança de Aplicação)</label>
                <input
                  type="text"
                  value={configForm.appToken}
                  onChange={e => setConfigForm({ ...configForm, appToken: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">User-Token (Token Pessoal do Técnico)</label>
                <input
                  type="password"
                  value={configForm.userToken}
                  onChange={e => setConfigForm({ ...configForm, userToken: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTestApi}
                  disabled={isTestingApi}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-sm transition-colors text-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingApi ? 'animate-spin' : ''}`} />
                  <span>{isTestingApi ? 'Testando Conexão...' : 'Testar Conexão com GLPI REST API'}</span>
                </button>
              </div>

              {apiTestResult && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 font-mono text-[11px] leading-relaxed">
                  {apiTestResult}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Registrar Solução ITIL */}
      {showSolveModal && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4">
            <div>
              <h4 className="text-sm font-bold text-white">Registrar Solução no GLPI (Chamado #{selectedTicket.id})</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Descreva a correção técnica efetuada para encerramento formal do chamado
              </p>
            </div>

            <form onSubmit={handleSolveTicket} className="space-y-3 text-xs">
              <textarea
                rows={4}
                required
                placeholder="Ex: Atualizada cadeia de certificados no terminal balcão-04 e reinstalado driver SafeNet. Teste de assinatura com e-Notariado efetuado com sucesso."
                value={solutionText}
                onChange={e => setSolutionText(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSolveModal(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded shadow-sm"
                >
                  Confirmar e Solucionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
