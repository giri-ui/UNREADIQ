import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface PrivacyBannerProps {
  onLearnMore: () => void;
}

export const PrivacyBanner: React.FC<PrivacyBannerProps> = ({ onLearnMore }) => {
  return (
    <aside aria-label="Privacy guarantee" className="w-full bg-zinc-900/60 border-b border-zinc-800/80 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-zinc-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-zinc-200 font-medium">Zero-Cloud Privacy:</strong> Transcripts are processed strictly on this device via deterministic browser logic. No chat data is saved or sent to any server.
          </span>
        </div>
        <button
          onClick={onLearnMore}
          className="text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-2 shrink-0 flex items-center gap-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
        >
          <Info className="w-3.5 h-3.5" />
          <span>How it works</span>
        </button>
      </div>
    </aside>
  );
};
