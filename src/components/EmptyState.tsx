import React from 'react';
import { SAMPLE_CONVERSATIONS } from '../data/samples';
import { SampleConversation } from '../types';
import {
  Zap,
  ShieldCheck,
  CheckSquare,
  Scale,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface EmptyStateProps {
  onLoadSample: (sample: SampleConversation) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onLoadSample }) => {
  return (
    <div className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl p-8 sm:p-10 space-y-8 text-center sm:text-left">
      <div className="max-w-2xl mx-auto sm:mx-0 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <Zap className="w-3.5 h-3.5" />
          <span>Cut Through 500+ Unread Messages In Seconds</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
          What did you miss in that chaotic thread?
        </h2>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Paste any chat export from Slack, Discord, Microsoft Teams, WhatsApp, or meeting transcripts.
          UnreadIQ extracts decisions, action items, assigned tasks, and hard deadlines in milliseconds—completely in your browser.
        </p>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-zinc-950/60 border border-zinc-800/80 rounded-xl text-left space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckSquare className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-200">Interactive Action Items</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Detects tasks, assignees (@mentions), and stated deadlines with interactive completion checkboxes.
          </p>
        </div>

        <div className="p-4 bg-zinc-950/60 border border-zinc-800/80 rounded-xl text-left space-y-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Scale className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-200">Ratified Decisions</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Separates idle banter from agreed consensus, team sign-offs, and architecture direction.
          </p>
        </div>

        <div className="p-4 bg-zinc-950/60 border border-zinc-800/80 rounded-xl text-left space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-200">100% In-Browser Privacy</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Zero API calls, zero server storage, zero third-party telemetry. Your confidential chats never leave your machine.
          </p>
        </div>
      </div>

      {/* Judge & Test Drive Quick Samples */}
      <div className="p-5 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">
              Try a Realistic Sample Conversation
            </h3>
            <p className="text-xs text-zinc-400">
              Click any scenario below to immediately test the local extraction engine:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {SAMPLE_CONVERSATIONS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onLoadSample(sample)}
              className="p-3.5 text-left bg-zinc-900/90 hover:bg-zinc-850 hover:border-emerald-500/40 border border-zinc-800 rounded-lg group transition-all"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-200 group-hover:text-emerald-300 mb-1">
                <span>{sample.title}</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 transition-transform group-hover:translate-x-0.5" />
              </div>
              <p className="text-[11px] text-zinc-400 line-clamp-2">
                {sample.tagline}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
