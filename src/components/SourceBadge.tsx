import React from 'react';
import { SourceApp } from '../types';
import {
  MessageSquare,
  Send,
  Mail,
  Users,
  Instagram,
  Slack,
} from 'lucide-react';

interface SourceBadgeProps {
  sourceApp: SourceApp | string;
  showPrefix?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function getSourceAppMeta(source: SourceApp | string) {
  switch (source) {
    case 'whatsapp':
      return {
        name: 'WhatsApp',
        color: '#25d366',
        bg: 'bg-[#25d366]/10 border-[#25d366]/30 text-[#25d366]',
        icon: <MessageSquare className="w-3 h-3 text-[#25d366] shrink-0" />,
      };
    case 'telegram':
      return {
        name: 'Telegram',
        color: '#2481cc',
        bg: 'bg-[#2481cc]/15 border-[#2481cc]/30 text-[#50b2ff]',
        icon: <Send className="w-3 h-3 text-[#50b2ff] shrink-0" />,
      };
    case 'email':
    case 'gmail':
      return {
        name: 'Gmail',
        color: '#ea4335',
        bg: 'bg-[#ea4335]/15 border-[#ea4335]/30 text-[#ff7878]',
        icon: <Mail className="w-3 h-3 text-[#ff7878] shrink-0" />,
      };
    case 'teams':
      return {
        name: 'Microsoft Teams',
        color: '#6264a7',
        bg: 'bg-[#6264a7]/15 border-[#6264a7]/30 text-[#a4a6e8]',
        icon: <Users className="w-3 h-3 text-[#a4a6e8] shrink-0" />,
      };
    case 'slack':
      return {
        name: 'Slack',
        color: '#ecb22e',
        bg: 'bg-[#ecb22e]/15 border-[#ecb22e]/30 text-[#ffc83b]',
        icon: <Slack className="w-3 h-3 text-[#ffc83b] shrink-0" />,
      };
    case 'instagram':
      return {
        name: 'Instagram',
        color: '#e1306c',
        bg: 'bg-[#e1306c]/15 border-[#e1306c]/30 text-[#ff6ea7]',
        icon: <Instagram className="w-3 h-3 text-[#ff6ea7] shrink-0" />,
      };
    default:
      return {
        name: 'Imported conversation',
        color: '#9ab0c5',
        bg: 'bg-[#182635] border-[#22364c] text-[#9ab0c5]',
        icon: <MessageSquare className="w-3 h-3 text-[#9ab0c5] shrink-0" />,
      };
  }
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({
  sourceApp,
  showPrefix = true,
  size = 'sm',
  className = '',
}) => {
  const meta = getSourceAppMeta(sourceApp);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border font-medium transition-colors ${
        size === 'sm' ? 'text-[10px]' : 'text-xs'
      } ${meta.bg} ${className}`}
      title={`Source Platform: ${meta.name}`}
    >
      {meta.icon}
      {showPrefix && <span className="opacity-75">Source:</span>}
      <span className="font-semibold">{meta.name}</span>
    </span>
  );
};
