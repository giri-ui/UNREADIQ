import React, { useState } from 'react';
import { CatchUpResult } from '../types';
import { Sparkles, Sun, CheckCircle, Clock, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';

interface MorningBannerProps {
  briefing: CatchUpResult;
  onRefreshCatchUp: () => void;
  isProcessing: boolean;
}

export const MorningBanner: React.FC<MorningBannerProps> = ({
  briefing,
  onRefreshCatchUp,
  isProcessing,
}) => {
  const [showThreeAnswers, setShowThreeAnswers] = useState(true);

  return (
    <section aria-labelledby="morning-banner-title" className="w-full bg-gradient-to-b from-[#131f2d] to-[#0f1722] border border-[#1e2f42] rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1b2b3c]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#50b2ff] text-xs font-semibold uppercase tracking-wider">
            <Sun className="w-4 h-4 text-[#ffb020]" />
            <span>Overnight Intelligence Briefing</span>
          </div>
          <h1 id="morning-banner-title" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Good morning. Here's what you missed.
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#9ab0c5]">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#50b2ff]" />
              <span>{briefing.timeSpan}</span>
            </span>
            <span aria-hidden="true" className="text-[#3b4f65]">·</span>
            <span>
              <strong className="text-white font-medium">{briefing.analyzedMessagesCount}</strong> overnight messages analyzed across{' '}
              <strong className="text-white font-medium">{briefing.conversationsCount}</strong> channels
            </span>
            <span aria-hidden="true" className="text-[#3b4f65]">·</span>
            <span className="text-[#50b2ff] font-mono">{briefing.processingTimeMs}ms parse</span>
          </div>
        </div>

        {/* Catch Me Up CTA Button */}
        <button
          onClick={onRefreshCatchUp}
          disabled={isProcessing}
          className="self-start sm:self-auto px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#2481cc] hover:bg-[#2ea6ff] active:bg-[#1a6bb0] disabled:opacity-50 rounded-xl shadow-lg shadow-[#2481cc]/25 transition-all flex items-center gap-2 shrink-0"
        >
          {isProcessing ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Re-analyzing Inbox...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Catch me up</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </>
          )}
        </button>
      </div>

      {/* The 3 Core Morning Questions (Collapsible or visible) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#9ab0c5] uppercase tracking-wider">
            Quick 3-Minute Digest
          </span>
          <button
            onClick={() => setShowThreeAnswers(!showThreeAnswers)}
            className="text-xs text-[#50b2ff] hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>{showThreeAnswers ? 'Minimize' : 'Expand Digest'}</span>
            {showThreeAnswers ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showThreeAnswers && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 1. What happened while I was away? */}
            <div className="p-4 bg-[#14202e] border border-[#203247] rounded-xl space-y-2">
              <div className="text-xs font-bold text-white flex items-center gap-1.5 pb-1 border-b border-[#203247]">
                <span className="w-4 h-4 rounded-full bg-[#2481cc]/20 text-[#50b2ff] text-[10px] flex items-center justify-center font-bold">1</span>
                <span>What happened while you were away?</span>
              </div>
              <ul className="space-y-1.5 text-xs text-[#b8cbdc] leading-relaxed">
                {briefing.answers.whatHappened.slice(0, 3).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#50b2ff] shrink-0 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 2. What is most important to me? */}
            <div className="p-4 bg-[#14202e] border border-[#203247] rounded-xl space-y-2">
              <div className="text-xs font-bold text-white flex items-center gap-1.5 pb-1 border-b border-[#203247]">
                <span className="w-4 h-4 rounded-full bg-[#ffb020]/20 text-[#ffb020] text-[10px] flex items-center justify-center font-bold">2</span>
                <span>What is most important to you?</span>
              </div>
              <ul className="space-y-1.5 text-xs text-[#b8cbdc] leading-relaxed">
                {briefing.answers.whatMatters.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#ffb020] shrink-0 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. What do I need to do next? */}
            <div className="p-4 bg-[#14202e] border border-[#203247] rounded-xl space-y-2">
              <div className="text-xs font-bold text-white flex items-center gap-1.5 pb-1 border-b border-[#203247]">
                <span className="w-4 h-4 rounded-full bg-[#25d366]/20 text-[#25d366] text-[10px] flex items-center justify-center font-bold">3</span>
                <span>What do you need to do next?</span>
              </div>
              <ul className="space-y-1.5 text-xs text-[#b8cbdc] leading-relaxed">
                {briefing.answers.whatToDoNext.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#25d366] shrink-0 mt-0.5">✓</span>
                    <span className="font-medium text-white">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
