import React from 'react';
import {
  ShieldAlert,
  KeyRound,
  Terminal,
  Fingerprint,
  Headphones,
  ScreenShare,
  Building2,
  FileCheck,
  Stamp,
  BookOpen,
  Receipt,
  LayoutGrid,
  HardDrive,
  FolderLock,
  Globe,
  Monitor,
  ExternalLink,
  Shield,
  FileText,
  User,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  PlusSquare,
  Plus,
  Users,
  UserCheck,
  Server,
  Database,
  Cpu,
  Layers,
  Lock,
  Activity,
  Wifi,
  Wrench,
  LucideProps
} from 'lucide-react';

interface AppIconProps extends LucideProps {
  name: string;
}

export const AppIcon: React.FC<AppIconProps> = ({ name, ...props }) => {
  switch (name) {
    case 'PlusSquare':
    case 'Plus':
      return <PlusSquare {...props} />;
    case 'Users':
      return <Users {...props} />;
    case 'UserCheck':
      return <UserCheck {...props} />;
    case 'Server':
      return <Server {...props} />;
    case 'Database':
      return <Database {...props} />;
    case 'Cpu':
      return <Cpu {...props} />;
    case 'Layers':
      return <Layers {...props} />;
    case 'Lock':
      return <Lock {...props} />;
    case 'Activity':
      return <Activity {...props} />;
    case 'Wifi':
      return <Wifi {...props} />;
    case 'Wrench':
      return <Wrench {...props} />;
    case 'ShieldAlert':
      return <ShieldAlert {...props} />;
    case 'KeyRound':
      return <KeyRound {...props} />;
    case 'Terminal':
      return <Terminal {...props} />;
    case 'Fingerprint':
      return <Fingerprint {...props} />;
    case 'Headphones':
      return <Headphones {...props} />;
    case 'ScreenShare':
      return <ScreenShare {...props} />;
    case 'Building2':
      return <Building2 {...props} />;
    case 'FileCheck':
      return <FileCheck {...props} />;
    case 'Stamp':
      return <Stamp {...props} />;
    case 'BookOpen':
      return <BookOpen {...props} />;
    case 'Receipt':
      return <Receipt {...props} />;
    case 'HardDrive':
      return <HardDrive {...props} />;
    case 'FolderLock':
      return <FolderLock {...props} />;
    case 'Monitor':
      return <Monitor {...props} />;
    case 'ExternalLink':
      return <ExternalLink {...props} />;
    case 'Shield':
      return <Shield {...props} />;
    case 'FileText':
      return <FileText {...props} />;
    case 'User':
      return <User {...props} />;
    case 'Sliders':
      return <Sliders {...props} />;
    case 'CheckCircle2':
      return <CheckCircle2 {...props} />;
    case 'AlertTriangle':
      return <AlertTriangle {...props} />;
    case 'XCircle':
      return <XCircle {...props} />;
    default:
      return <Globe {...props} />;
  }
};
