import React from 'react';
import { ShieldCheck, Copy, Trash2, Check, Zap } from 'lucide-react';

interface HeaderProps {
  onOpenPrivacy: () => void;
  onPurge: () => void;
  onCopySummary: () => void;
  hasData: boolean;
  isCopied: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPrivacy,
  onPurge,
  onCopySummary,
  hasData,
  isCopied,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-5 h-5 fill-emerald-500/20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white">UnreadIQ</span>
              <span className="text-xs text-zinc-400 font-normal">What Did I Miss?</span>
            </div>
            <div className="text-[11px] text-zinc-400 hidden sm:block">
              Instant transcript intelligence · ProtocolX Edition
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Privacy badge button */}
          <button
            onClick={onOpenPrivacy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/30 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            title="Inspect 100% Client-Side Privacy Verification"
          >
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline font-medium">100% Local Browser Engine</span>
            <span className="md:hidden font-medium">Local</span>
          </button>

          {/* Copy Summary Button */}
          {hasData && (
            <button
              onClick={onCopySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg border border-zinc-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              title="Copy Executive Summary to Clipboard"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copy Report</span>
                </>
              )}
            </button>
          )}

          {/* Purge / Wipe button */}
          {hasData && (
            <button
              onClick={onPurge}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-red-500/20 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              title="Purge current transcript and wipe data from memory"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Purge Data</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
