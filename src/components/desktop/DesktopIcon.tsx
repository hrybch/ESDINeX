import React, { useState } from 'react';
import { AppDefinition } from '../../types/os';
import { AppIcon } from '../common/AppIcon';

interface DesktopIconProps {
  app: AppDefinition;
  onOpen: (appId: string) => void;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({ app, onOpen }) => {
  const [isSelected, setIsSelected] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSelected(true);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpen(app.id);
  };

  return (
    <div
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={`group w-24 p-2 flex flex-col items-center gap-1.5 rounded-lg cursor-pointer transition-all select-none ${
        isSelected
          ? 'bg-blue-600/25 ring-1 ring-blue-400/50 shadow-md'
          : 'hover:bg-slate-800/40 hover:ring-1 hover:ring-slate-700/50'
      }`}
    >
      {/* Icon Capsule with subtle depth */}
      <div className="w-12 h-12 rounded-xl bg-slate-900/90 border border-slate-700/60 shadow-lg flex items-center justify-center text-blue-400 group-hover:scale-105 group-hover:text-blue-300 transition-transform">
        <AppIcon name={app.iconName} className="w-6 h-6" />
      </div>

      {/* Label with anti-aliased readability and shadow */}
      <span className="text-[11px] font-medium text-slate-100 text-center leading-tight line-clamp-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] px-1">
        {app.title}
      </span>
    </div>
  );
};
