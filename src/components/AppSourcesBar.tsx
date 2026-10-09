import React from 'react';
import { SourceApp } from '../types';
import {
  MessageSquare,
  Send,
  Mail,
  Slack,
  Users,
  Instagram,
  PlusCircle,
  ShieldCheck,
} from 'lucide-react';

interface AppSourcesBarProps {
  selectedApp: SourceApp | 'all';
  onSelectApp: (app: SourceApp | 'all') => void;
  appCounts: Record<SourceApp, number>;
  onOpenImport: () => void;
}

export const AppSourcesBar: React.FC<AppSourcesBarProps> = ({
  selectedApp,
  onSelectApp,
  appCounts,
  onOpenImport,
}) => {
  const apps: Array<{ id: SourceApp; name: string; icon: React.ReactNode; color: string }> = [
    {
      id: 'slack',
      name: 'Slack',
      icon: <Slack className="w-3.5 h-3.5 text-[#ecb22e]" />,
      color: 'hover:border-[#ecb22e]/40',
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: <Send className="w-3.5 h-3.5 text-[#2481cc]" />,
      color: 'hover:border-[#2481cc]/40',
    },
    {
      id: 'email',
      name: 'Email',
      icon: <Mail className="w-3.5 h-3.5 text-[#ea4335]" />,
      color: 'hover:border-[#ea4335]/40',
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: <MessageSquare className="w-3.5 h-3.5 text-[#25d366]" />,
      color: 'hover:border-[#25d366]/40',
    },
    {
      id: 'teams',
      name: 'Teams',
      icon: <Users className="w-3.5 h-3.5 text-[#6264a7]" />,
      color: 'hover:border-[#6264a7]/40',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: <Instagram className="w-3.5 h-3.5 text-[#e1306c]" />,
      color: 'hover:border-[#e1306c]/40',
    },
  ];

  return (
    <div className="w-full bg-[#111923] border border-[#1c2a38] rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none py-0.5">
        <button
          onClick={() => onSelectApp('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shrink-0 flex items-center gap-1.5 ${
            selectedApp === 'all'
              ? 'bg-[#2481cc] text-white'
              : 'text-[#9ab0c5] hover:text-white hover:bg-[#182330]'
          }`}
        >
          <span>All Apps</span>
        </button>

        {apps.map((app) => {
          const count = appCounts[app.id] || 0;
          const isSelected = selectedApp === app.id;

          return (
            <button
              key={app.id}
              onClick={() => onSelectApp(isSelected ? 'all' : app.id)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors shrink-0 flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-[#1a293a] border-[#2481cc] text-white shadow-sm'
                  : `bg-[#151f2b] border-[#1f2e3e] text-[#9ab0c5] hover:text-white ${app.color}`
              }`}
            >
              {app.icon}
              <span>{app.name}</span>
              {count > 0 && (
                <span className="text-[10px] bg-[#0c141d] text-[#50b2ff] px-1.5 py-0.2 rounded font-mono">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        <span className="text-[11px] text-[#708499] hidden lg:inline flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-[#2481cc]" />
          <span>Local Engine · Zero Server APIs</span>
        </span>
        <button
          onClick={onOpenImport}
          className="px-3 py-1.5 text-xs font-medium bg-[#182432] hover:bg-[#202f42] text-[#50b2ff] border border-[#2481cc]/30 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Import Chat</span>
        </button>
      </div>
    </div>
  );
};
