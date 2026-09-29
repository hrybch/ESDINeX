export type UserRole = 'SUPORTE_N1' | 'SUPORTE_N2_ADMIN' | 'FINANCEIRO' | 'GESTOR_TI' | 'GESTOR_CARTORIO';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clienteAtribuicao?: string;
  departamento?: string;
  avatar?: string;
  twoFactorEnabled: boolean;
  twoFactorMethod: 'totp' | 'sms' | 'certificado_a3';
  status: 'ativo' | 'bloqueado';
  lastLogin?: string;
  phone?: string;
}

export type AppCategory = 
  | 'atendimento'   // Central de Chamados, Helpdesk
  | 'sistema'       // Sistemas Web & Portais de Clientes
  | 'infra'         // Infraestrutura, Terminal, Diagnóstico
  | 'utilitarios';   // Cadastrar App, Usuários, Ferramentas gerais

export type WindowEmbedType = 'native' | 'iframe' | 'external_tab';

export interface AppDefinition {
  id: string;
  title: string;
  subtitle: string;
  category: AppCategory;
  iconName: string;
  allowedRoles: UserRole[];
  embedType: WindowEmbedType;
  url?: string;
  blocksIframe?: boolean;
  defaultWidth?: number;
  defaultHeight?: number;
  pinnedToDock?: boolean;
  onDesktop?: boolean;
  isCustom?: boolean;
}

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowDimensions {
  width: number;
  height: number;
}

export interface WindowBounds extends WindowPosition, WindowDimensions {}

export interface WindowInstance {
  id: string;
  appId: string;
  title: string;
  iconName: string;
  bounds: WindowBounds;
  previousBounds?: WindowBounds;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  embedType: WindowEmbedType;
  url?: string;
  blocksIframe?: boolean;
  customData?: Record<string, unknown>;
}

export interface EsdiTicket {
  id: string;
  title: string;
  cliente: string;
  departamento?: string;
  requester: string;
  category: string;
  urgency: 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  status: 'NOVO' | 'EM_ATENDIMENTO' | 'PENDENTE' | 'SOLUCIONADO' | 'FECHADO';
  assignedTo?: string;
  createdAt: string;
  description: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  timestamp: string;
  read: boolean;
}
