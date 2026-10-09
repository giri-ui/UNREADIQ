import React, { useState, useRef } from 'react';
import { Conversation, ConversationCategory, SourceApp } from '../types';
import { parseRawTranscript } from '../utils/parser';
import JSZip from 'jszip';
import {
  X,
  UploadCloud,
  FileArchive,
  FileText,
  Check,
  ShieldCheck,
  FolderArchive,
  Sparkles,
} from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportConversation: (newConv: Conversation) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportConversation,
}) => {
  const [channelName, setChannelName] = useState('');
  const [sourceApp, setSourceApp] = useState<SourceApp>('whatsapp');
  const [category, setCategory] = useState<ConversationCategory>('college');
  const [rawText, setRawText] = useState('');
  const [isProcessingZip, setIsProcessingZip] = useState(false);
  const [zipFileName, setZipFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processFile = async (file: File) => {
    // 1. Check if it's a zip file
    if (file.name.endsWith('.zip') || file.type === 'application/zip' || file.type === 'application/x-zip-compressed') {
      setIsProcessingZip(true);
      setZipFileName(file.name);
      try {
        const zip = await JSZip.loadAsync(file);
        let chatText = '';
        let foundFileName = '';

        // Search for _chat.txt (WhatsApp standard) or any .txt/.log/.md file
        const fileNames = Object.keys(zip.files);
        const preferredTxt = fileNames.find((name) => name.toLowerCase().includes('_chat.txt')) ||
          fileNames.find((name) => name.toLowerCase().endsWith('.txt')) ||
          fileNames.find((name) => name.toLowerCase().endsWith('.log') || name.toLowerCase().endsWith('.md'));

        if (preferredTxt) {
          const zipEntry = zip.files[preferredTxt];
          chatText = await zipEntry.async('text');
          foundFileName = preferredTxt;
        }

        if (chatText) {
          setRawText(chatText);
          const cleanName = file.name
            .replace(/\.zip$/i, '')
            .replace(/^WhatsApp Chat - /i, '')
            .replace(/^Telegram - /i, '');
          if (!channelName) {
            setChannelName(cleanName);
          }
        } else {
          alert('No text transcript file (.txt) found inside the zip archive.');
        }
      } catch (err) {
        console.error('Error unzipping chat archive', err);
        alert('Could not unpack zip archive. Please ensure it is a valid zip file.');
      } finally {
        setIsProcessingZip(false);
      }
    } else {
      // 2. Plain text / log / md file
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setRawText(content);
          if (!channelName) {
            setChannelName(file.name.replace(/\.[^/.]+$/, ''));
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSubmit = () => {
    if (!rawText.trim()) return;

    const parsedMsgs = parseRawTranscript(rawText);
    const finalName = channelName.trim() || `${sourceApp.toUpperCase()} Class Export`;
    const participants = Array.from(
      new Set(parsedMsgs.map((m) => m.sender).filter((s) => s !== 'Participant'))
    );

    const newConv: Conversation = {
      id: `imported-${Date.now()}`,
      name: finalName,
      sourceApp,
      category,
      unreadCount: parsedMsgs.length,
      latestActivity: 'Just imported · Local',
      participants: participants.length > 0 ? participants : ['User'],
      isImported: true,
      messages: parsedMsgs.map((m, idx) => ({
        messageId: `imp-msg-${Date.now()}-${idx}`,
        sourceApp,
        conversationId: `imported-${Date.now()}`,
        conversationName: finalName,
        category,
        senderId: m.sender.toLowerCase().replace(/\s+/g, '-'),
        senderName: m.sender,
        timestamp: m.timestamp || 'Today',
        messageText: m.text,
      })),
    };

    onImportConversation(newConv);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-[#0f1722] border border-[#203247] rounded-2xl shadow-2xl p-5 sm:p-6 text-white overflow-y-auto max-h-[90vh] space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#1c2c3e]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2481cc]/20 border border-[#2481cc]/40 flex items-center justify-center text-[#50b2ff]">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 id="import-modal-title" className="text-base font-bold text-white">
                Import Chat Export (Supports .ZIP & .TXT)
              </h2>
              <p className="text-xs text-[#708499]">
                Drop WhatsApp exported zip or paste class group transcript
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#708499] hover:text-white rounded-lg hover:bg-[#1a2839]"
            aria-label="Close import modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form fields */}
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[#9ab0c5] mb-1 font-medium">Platform</label>
              <select
                value={sourceApp}
                onChange={(e) => setSourceApp(e.target.value as SourceApp)}
                className="w-full bg-[#0c141d] border border-[#1c2a38] rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-[#2481cc]"
              >
                <option value="whatsapp">WhatsApp (.zip / .txt)</option>
                <option value="telegram">Telegram (.json / .txt)</option>
                <option value="teams">Microsoft Teams</option>
                <option value="slack">Slack</option>
                <option value="email">College Email</option>
                <option value="instagram">Instagram</option>
                <option value="other">Other App</option>
              </select>
            </div>

            <div>
              <label className="block text-[#9ab0c5] mb-1 font-medium">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ConversationCategory)}
                className="w-full bg-[#0c141d] border border-[#1c2a38] rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-[#2481cc]"
              >
                <option value="college">College & Academics</option>
                <option value="personal">Family & Personal</option>
              </select>
            </div>

            <div>
              <label className="block text-[#9ab0c5] mb-1 font-medium">Group / Channel Name</label>
              <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="e.g. CS7 - DBMS Project"
                className="w-full bg-[#0c141d] border border-[#1c2a38] rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-[#2481cc]"
              />
            </div>
          </div>

          {/* Drag & Drop Space for File Uploads including .ZIP */}
          <div>
            <label className="block text-[#9ab0c5] font-medium mb-1.5">
              Upload Chat Export Archive (.ZIP) or Text File
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-5 rounded-xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center text-center space-y-2 ${
                isDragging
                  ? 'border-[#2481cc] bg-[#2481cc]/10 ring-2 ring-[#2481cc]/20'
                  : 'border-[#22354a] bg-[#0c141d] hover:border-[#2481cc]/50 hover:bg-[#121c27]'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".zip,.txt,.log,.md,.json,.csv"
                className="hidden"
              />

              <div className="w-10 h-10 rounded-xl bg-[#2481cc]/15 border border-[#2481cc]/30 flex items-center justify-center text-[#50b2ff]">
                {isProcessingZip ? (
                  <Sparkles className="w-5 h-5 animate-spin" />
                ) : zipFileName ? (
                  <FileArchive className="w-5 h-5 text-[#25d366]" />
                ) : (
                  <FolderArchive className="w-5 h-5" />
                )}
              </div>

              <div>
                <div className="text-xs font-semibold text-white">
                  {zipFileName
                    ? `Extracted: ${zipFileName}`
                    : 'Drop WhatsApp .ZIP or chat text file here'}
                </div>
                <div className="text-[11px] text-[#708499]">
                  Supports WhatsApp exported zip archive with <code>_chat.txt</code>, or click to browse
                </div>
              </div>
            </div>
          </div>

          {/* Or Paste Raw Text */}
          <div>
            <label className="text-[#9ab0c5] font-medium block mb-1">
              Or Paste Conversation Transcript Directly
            </label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`[09:15 AM] Priya Ma'am: Girish, meet me in the seminar hall at 9 AM tomorrow.
[09:20 AM] CR Rahul: Tomorrow's DBMS lab starts at 10 AM. Bring your observation notebook.
[09:25 AM] Proctor Ravi Kumar: Girish, please meet me tomorrow at 11 AM regarding your attendance.`}
              rows={6}
              className="w-full bg-[#0c141d] border border-[#1c2a38] rounded-lg p-3 text-white text-xs font-mono focus:outline-none focus:border-[#2481cc] leading-relaxed"
            />
          </div>

          <div className="p-2.5 bg-[#0d1622] border border-[#192738] rounded-lg flex items-center gap-2 text-[11px] text-[#708499]">
            <ShieldCheck className="w-4 h-4 text-[#2481cc] shrink-0" />
            <span>
              Zip extraction and transcript parsing execute 100% locally in your browser memory.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#1c2c3e] flex items-center justify-end gap-2 text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[#9ab0c5] hover:text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!rawText.trim()}
            className="px-5 py-2 font-semibold bg-[#2481cc] hover:bg-[#2ea6ff] disabled:opacity-40 text-white rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Analyze & Add to College Inbox</span>
          </button>
        </div>
      </div>
    </div>
  );
};
