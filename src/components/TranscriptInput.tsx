import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Sparkles, FileText, RotateCcw, AlertCircle, ArrowRight } from 'lucide-react';
import { SAMPLE_CONVERSATIONS } from '../data/samples';
import { SampleConversation } from '../types';

interface TranscriptInputProps {
  transcript: string;
  onChange: (val: string) => void;
  onAnalyze: () => void;
  onReset: () => void;
  isAnalyzing: boolean;
  errorMessage: string | null;
  onLoadSample: (sample: SampleConversation) => void;
}

export const TranscriptInput: React.FC<TranscriptInputProps> = ({
  transcript,
  onChange,
  onAnalyze,
  onReset,
  isAnalyzing,
  errorMessage,
  onLoadSample,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Line & char counts
  const lineCount = transcript ? transcript.split('\n').filter((l) => l.trim().length > 0).length : 0;
  const charCount = transcript ? transcript.length : 0;

  // Keyboard shortcut: Cmd/Ctrl + Enter to trigger analysis
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (transcript.trim().length > 0 && !isAnalyzing) {
          e.preventDefault();
          onAnalyze();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [transcript, isAnalyzing, onAnalyze]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          onChange(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          onChange(content);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <section aria-labelledby="input-heading" className="w-full bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col space-y-4">
      {/* Top Header & Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 id="input-heading" className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Chat Transcript Input</span>
          </h2>
          <p className="text-xs text-zinc-400">
            Paste raw text from Slack, Discord, WhatsApp, Teams, or plain notes
          </p>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-zinc-400 font-medium mr-1">Load sample:</span>
          {SAMPLE_CONVERSATIONS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onLoadSample(sample)}
              className="px-2.5 py-1 text-[11px] font-medium bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 hover:text-emerald-300 border border-zinc-700/80 rounded-md transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
              title={sample.tagline}
            >
              {sample.title.split(':')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Textarea Area with Drag and Drop */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative rounded-lg border transition-all ${
          isDragging
            ? 'border-emerald-500 bg-emerald-950/20 ring-2 ring-emerald-500/30'
            : 'border-zinc-800 bg-zinc-950/70 focus-within:border-emerald-500/60 focus-within:ring-1 focus-within:ring-emerald-500/40'
        }`}
      >
        <textarea
          ref={textareaRef}
          value={transcript}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Paste your chat transcript here, or drag & drop a .txt/.log file...

Examples supported:
- [10:14 AM] Alex: We need to deploy the hotfix by 3 PM.
- Sarah Chen [09:30]: Approved: let's go with passkeys.
- Jordan: @alex can you review ticket #102 by tomorrow?
- 10/14/25, 11:20 AM - Marcus: Decision: freeze deployments.`}
          rows={10}
          className="w-full bg-transparent text-zinc-100 placeholder:text-zinc-600 text-xs sm:text-sm font-mono p-4 resize-y focus:outline-none leading-relaxed"
          aria-label="Conversation Transcript Input"
        />

        {/* Floating Upload Button Inside Area */}
        <div className="flex items-center justify-between px-3 py-2 bg-zinc-900/90 border-t border-zinc-800/60 text-xs text-zinc-400 rounded-b-lg">
          <div className="flex items-center gap-3">
            <span>
              {lineCount} {lineCount === 1 ? 'line' : 'lines'}
            </span>
            <span aria-hidden="true" className="text-zinc-700">·</span>
            <span>{charCount.toLocaleString()} chars</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.log,.md,.json,.csv"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-300 hover:text-emerald-400 hover:bg-zinc-800 rounded transition-colors"
              title="Upload transcript file (.txt, .log, .md)"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Import File</span>
            </button>
          </div>
        </div>
      </div>

      {/* Validation / Error Message */}
      {errorMessage && (
        <div
          role="alert"
          className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-red-300 text-xs flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[10px] text-zinc-300 font-mono">
            ⌘/Ctrl + Enter
          </kbd>
          <span>to run instant analysis</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {transcript && (
            <button
              onClick={onReset}
              disabled={isAnalyzing}
              className="px-3.5 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={onAnalyze}
            disabled={isAnalyzing || transcript.trim().length === 0}
            className="flex-1 sm:flex-none px-5 py-2 text-xs sm:text-sm font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            {isAnalyzing ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-zinc-950" />
                <span>Analyzing Locally...</span>
              </>
            ) : (
              <>
                <span>Analyze Conversation</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};
