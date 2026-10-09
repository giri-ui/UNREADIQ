import React, { useState } from 'react';
import { ChatMessage, ActionItem, Decision } from '../types';
import { X, Search, MessageSquare, CheckSquare, Lightbulb } from 'lucide-react';

interface OriginalTranscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  actionItems: ActionItem[];
  decisions: Decision[];
}

export const OriginalTranscriptModal: React.FC<OriginalTranscriptModalProps> = ({
  isOpen,
  onClose,
  messages,
  actionItems,
  decisions,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredMessages = messages.filter(
    (m) =>
      m.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.sender.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="source-transcript-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-6 text-zinc-100 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 shrink-0">
          <div>
            <h2 id="source-transcript-title" className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Parsed Source Transcript ({messages.length} messages)</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Inspect original lines, detected timestamps, and parsed speaker attributions
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search in transcript */}
        <div className="py-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter raw messages by sender or keyword..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
          {filteredMessages.map((m) => {
            const hasTask = actionItems.some((t) => t.sourceMessageId === m.id);
            const hasDecision = decisions.some((d) => d.sourceMessageId === m.id);

            return (
              <div
                key={m.id}
                className="p-3 bg-zinc-950/70 border border-zinc-800/80 rounded-lg space-y-1 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center justify-between text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-200">{m.sender}</span>
                    {m.timestamp && <span className="text-[11px] text-zinc-400">· {m.timestamp}</span>}
                  </div>

                  <div className="flex items-center gap-2">
                    {hasTask && (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                        <CheckSquare className="w-3 h-3" />
                        Task
                      </span>
                    )}
                    {hasDecision && (
                      <span className="text-[10px] text-amber-400 flex items-center gap-1 font-medium">
                        <Lightbulb className="w-3 h-3" />
                        Decision
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-zinc-300 font-sans leading-relaxed">{m.text}</p>
              </div>
            );
          })}

          {filteredMessages.length === 0 && (
            <div className="p-8 text-center text-zinc-400">
              No messages match "{searchTerm}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
