import React from 'react';
import { Send, Search, User, ShieldCheck, Trash2, Sliders } from 'lucide-react';
import { UserProfile } from '../types';

interface TelegramHeaderProps {
  userProfile: UserProfile;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenProfile: () => void;
  onOpenPrivacy: () => void;
  onPurge: () => void;
}

export const TelegramHeader: React.FC<TelegramHeaderProps> = ({
  userProfile,
  searchQuery,
  onSearchChange,
  onOpenProfile,
  onOpenPrivacy,
  onPurge,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-[#1c2a38] bg-[#0c141d]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#2481cc] flex items-center justify-center text-white shadow-md shadow-[#2481cc]/20">
            <Send className="w-4 h-4 translate-x-0.5 -translate-y-0.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white">UnreadIQ</span>
              <span className="text-[11px] text-[#2481cc] font-medium bg-[#132333] px-2 py-0.5 rounded border border-[#2481cc]/30">
                Morning Intelligence
              </span>
            </div>
            <p className="text-[11px] text-[#708499] hidden sm:block">
              Wake up. Know what happened. Know what matters.
            </p>
          </div>
        </div>

        {/* Global Live Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#708499] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search overnight messages, decisions, people..."
              className="w-full bg-[#111a24] border border-[#1d2a39] rounded-lg pl-9 pr-8 py-1.5 text-xs text-white placeholder:text-[#55697d] focus:outline-none focus:border-[#2481cc]"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-2 text-[#708499] hover:text-white text-xs"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Actions & Profile */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenPrivacy}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[#2481cc] hover:text-[#50b2ff] bg-[#122232] border border-[#2481cc]/30 rounded-lg transition-colors"
            title="Inspect 100% In-Browser Privacy Verification"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Local</span>
          </button>

          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-[#172331] hover:bg-[#1e2f42] text-white border border-[#22354a] rounded-lg transition-colors"
            title="Configure Your Name, Aliases & Important VIP Contacts"
          >
            <div className="w-5 h-5 rounded-full bg-[#2481cc]/20 border border-[#2481cc]/50 flex items-center justify-center text-[#2481cc]">
              <User className="w-3 h-3" />
            </div>
            <span className="hidden sm:inline">{userProfile.preferredName}</span>
            <Sliders className="w-3 h-3 text-[#708499]" />
          </button>

          <button
            onClick={onPurge}
            className="p-1.5 text-[#e55353] hover:text-[#ff7878] hover:bg-[#2b1717] border border-[#e55353]/30 rounded-lg transition-colors"
            title="Purge session memory and wipe all conversation data"
            aria-label="Purge session memory"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="px-4 pb-2 md:hidden">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#708499] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search messages, decisions, people..."
            className="w-full bg-[#111a24] border border-[#1d2a39] rounded-lg pl-9 pr-8 py-1.5 text-xs text-white placeholder:text-[#55697d] focus:outline-none focus:border-[#2481cc]"
          />
        </div>
      </div>
    </header>
  );
};
