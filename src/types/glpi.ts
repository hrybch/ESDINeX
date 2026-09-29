export type GlpiTicketStatus = 
  | 1 // Novo (New)
  | 2 // Em atendimento (atribuído) (Processing assigned)
  | 3 // Em atendimento (planejado) (Processing planned)
  | 4 // Pendente (Pending)
  | 5 // Solucionado (Solved)
  | 6 // Fechado (Closed);

export type GlpiUrgency = 1 | 2 | 3 | 4 | 5; // 1: Muito Baixa, 2: Baixa, 3: Média, 4: Alta, 5: Muito Alta
export type GlpiImpact = 1 | 2 | 3 | 4 | 5;
export type GlpiPriority = 1 | 2 | 3 | 4 | 5; // Matriz Urgência x Impacto

export type GlpiTicketType = 1 | 2; // 1: Incidente, 2: Requisição

export interface GlpiTicket {
  id: number;
  name: string; // Título do chamado
  content: string; // Descrição HTML/texto
  status: GlpiTicketStatus;
  urgency: GlpiUrgency;
  impact: GlpiImpact;
  priority: GlpiPriority;
  type: GlpiTicketType;
  date: string; // Data de abertura
  date_mod: string;
  solvedate?: string;
  closedate?: string;
  time_to_resolve?: string;
  itilcategories_id: number;
  category_name?: string;
  entities_id: number;
  entity_name?: string;
  cliente_unidade?: string;
  users_id_recipient: number;
  requester_name?: string;
  users_id_assign?: number;
  assigned_name?: string;
  cartorio_cns?: string;
  followups_count?: number;
  tasks_count?: number;
}

export interface GlpiFollowup {
  id: number;
  items_id: number; // ticket id
  itemtype: 'Ticket';
  content: string;
  date: string;
  users_id: number;
  author_name: string;
  is_private: boolean; // Nota privada entre técnicos
}

export interface GlpiTask {
  id: number;
  tickets_id: number;
  content: string;
  actiontime: number; // segundos gastos
  date: string;
  users_id: number;
  users_id_tech?: number;
  author_name: string;
  state: 1 | 2; // 1: A Fazer, 2: Feito
}

export interface GlpiSolution {
  id: number;
  items_id: number;
  itemtype: 'Ticket';
  content: string;
  date_creation: string;
  date_approval?: string;
  status: 2 | 3; // 2: Aguardando aprovação, 3: Aprovada
  users_id: number;
  author_name: string;
}

export interface GlpiCategory {
  id: number;
  name: string;
  completename: string;
}

export interface GlpiEntity {
  id: number;
  name: string; // Nome do Cliente / Contrato
  unidade: string;
  regiao: string;
  cns?: string;
}

export interface GlpiKnowbaseItem {
  id: number;
  name: string;
  answer: string;
  date: string;
  category_name: string;
  views: number;
}

export interface GlpiPlanningItem {
  id: number;
  title: string;
  ticket_id: number;
  cliente: string;
  cartorio?: string;
  begin: string;
  end: string;
  technician: string;
  type: string;
}

export interface GlpiApiConfig {
  baseUrl: string; // ex: https://sistema.esdi.com.br
  apiPath: string; // default: /apirest.php
  appToken: string;
  userToken: string;
  sessionToken?: string;
  isConnected: boolean;
  lastSync?: string;
  isMockFallback: boolean;
}
