import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Wrench,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Zap,
  ArrowRight,
  User,
  Plus,
} from 'lucide-react';
import { Appliance, ChatMessage } from '../types';
import { sendAiChatApi } from '../services/api';

interface AIChatViewProps {
  appliances: Appliance[];
  onRaiseComplaint: (appliance: Appliance) => void;
}

const QUICK_PROMPTS = [
  'My AC isn\'t cooling and fan air feels lukewarm.',
  'My RO water purifier is beeping and dripping water.',
  'Front load washing machine making loud grinding noise on spin cycle.',
  'How do I check if my refrigerator compressor is under warranty?',
  'What preventive service is required before summer for split AC?',
];

export const AIChatView: React.FC<AIChatViewProps> = ({
  appliances,
  onRaiseComplaint,
}) => {
  const [selectedApplianceId, setSelectedApplianceId] = useState<string>('all');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: "Hello! I am **Applora AI**, your home appliance diagnostic assistant. Ask me to diagnose faults, explain warranties, troubleshoot leaks or noises, or advise whether to repair or replace!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectedAppliance = appliances.find((a) => a.id === selectedApplianceId);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      applianceId: selectedApplianceId !== 'all' ? selectedApplianceId : undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    const historyForServer = messages.map((m) => ({
      sender: m.sender,
      text: m.text,
    }));

    const response = await sendAiChatApi({
      userMessage: textToSend,
      applianceContext: selectedAppliance
        ? {
            name: selectedAppliance.name,
            brand: selectedAppliance.brand,
            model: selectedAppliance.modelNumber,
            purchaseDate: selectedAppliance.purchaseDate,
            warranty: selectedAppliance.warranty.summaryTerms,
          }
        : undefined,
      chatHistory: historyForServer,
    });

    setIsLoading(false);

    const aiMsg: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      sender: 'ai',
      text: response.reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, aiMsg]);
  };

  return (
    <div className="space-y-4 pb-20 text-slate-900 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-600 text-white font-bold shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                AI Diagnostic Assistant
              </span>
              <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200 font-bold">
                Gemini 3.6 Flash
              </span>
            </div>
            <h1 className="text-lg font-extrabold text-slate-900">
              Applora AI Intelligence
            </h1>
          </div>
        </div>

        {/* Appliance Context Picker */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold shrink-0">Context:</span>
          <select
            value={selectedApplianceId}
            onChange={(e) => setSelectedApplianceId(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-800 font-semibold rounded-lg p-2 max-w-[200px]"
          >
            <option value="all">All Appliances (General)</option>
            {appliances.map((a) => (
              <option key={a.id} value={a.id}>
                {a.brand} {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Suggestion Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-purple-500 text-xs text-slate-700 whitespace-nowrap shrink-0 hover:text-purple-600 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Messages Box */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 h-[460px] overflow-y-auto space-y-3.5 shadow-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white'
                  : 'bg-purple-600 text-white font-bold'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[82%] rounded-xl p-3 text-xs sm:text-sm space-y-1.5 ${
                msg.sender === 'user'
                  ? 'bg-purple-600 text-white rounded-tr-none shadow-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-900 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
              <div
                className={`text-[10px] text-right mt-1 ${
                  msg.sender === 'user' ? 'text-purple-100' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-xs text-purple-700 font-semibold animate-pulse">
              Applora AI is analyzing diagnostic signals...
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={
            selectedAppliance
              ? `Ask about ${selectedAppliance.name}...`
              : 'Ask Applora AI about any appliance issue...'
          }
          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 shadow-xs"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
