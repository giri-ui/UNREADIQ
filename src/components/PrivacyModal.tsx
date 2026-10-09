import React from 'react';
import { ShieldCheck, Lock, Cpu, ServerOff, X, Check } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurge: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
  onPurge,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#0f1722] border border-[#203247] rounded-2xl shadow-2xl p-6 text-white overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#1c2c3e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2481cc]/20 border border-[#2481cc]/40 flex items-center justify-center text-[#50b2ff]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="privacy-modal-title" className="text-lg font-bold text-white">
                100% In-Browser Confidentiality Architecture
              </h2>
              <p className="text-xs text-[#708499]">
                Zero-telemetry local intelligence model
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#708499] hover:text-white rounded-lg hover:bg-[#1a2839] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-5 space-y-4 text-xs text-[#b8cbdc]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 bg-[#14202e] border border-[#1e3044] rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-[#50b2ff] font-bold">
                <ServerOff className="w-4 h-4" />
                <span>Zero Server APIs</span>
              </div>
              <p className="text-[11px] text-[#708499] leading-relaxed">
                No remote servers receive your conversations. Analysis executes purely in local browser memory.
              </p>
            </div>

            <div className="p-3.5 bg-[#14202e] border border-[#1e3044] rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-[#50b2ff] font-bold">
                <Cpu className="w-4 h-4" />
                <span>Deterministic NLP</span>
              </div>
              <p className="text-[11px] text-[#708499] leading-relaxed">
                Uses fast, zero-latency rule tokenizers in JavaScript without hallucinations or data leaks.
              </p>
            </div>

            <div className="p-3.5 bg-[#14202e] border border-[#1e3044] rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-[#50b2ff] font-bold">
                <Lock className="w-4 h-4" />
                <span>Ephemeral RAM Only</span>
              </div>
              <p className="text-[11px] text-[#708499] leading-relaxed">
                No cookies or permanent tracker storage. You can purge all memory at any moment.
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#14202e] border border-[#1e3044] rounded-xl space-y-2.5">
            <h3 className="font-bold text-white text-[11px] uppercase tracking-wider text-[#50b2ff]">
              How UnreadIQ Keeps Your Overnight Conversations Safe
            </h3>
            <ul className="space-y-2 text-xs text-[#9ab0c5]">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#25d366] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Multi-App Unified Model:</strong> Normalizes chat text across Slack, Telegram, WhatsApp, Email, and Teams without needing account credentials.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#25d366] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Strict Fact Distinction:</strong> Quoted evidence, assignees, and deadlines are verbatim from messages; priority tags are transparently derived.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#25d366] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">No Accidental API Transmission:</strong> Does not send proprietary project code, customer data, or family messages to third-party endpoints.
                </span>
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-[#708499]">
              Discard all inbox transcripts and clear memory:
            </div>
            <button
              onClick={() => {
                onPurge();
                onClose();
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#ff7878] hover:text-white hover:bg-[#e55353]/20 border border-[#e55353]/30 rounded-lg transition-colors"
            >
              Purge Session Memory
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-[#1c2c3e] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-[#1a2839] hover:bg-[#22354a] text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
