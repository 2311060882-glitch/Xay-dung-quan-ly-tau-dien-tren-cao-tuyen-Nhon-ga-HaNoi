// src/components/ui/MenuItem.tsx
import { type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface MenuItemProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  onClick?: () => void;
}

export function MenuItem({ icon, title, subtitle, onClick }: MenuItemProps) {
  return (
    <button 
      onClick={onClick}
      className="w-full bg-white py-3.5 px-4 flex items-center justify-between border-b border-gray-50 last:border-none active:bg-gray-50 transition"
    >
      <div className="flex items-center gap-3.5">
        <div className="text-primary">{icon}</div>
        <div className="text-left">
          <p className="font-bold text-gray-800 text-sm">{title}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <ChevronRight size={18} className="text-gray-300" />
    </button>
  );
}