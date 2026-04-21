
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Sparkles, X, ChevronRight, Calculator as Tractor, ShieldCheck } from 'lucide-react';
import { getChatResponse } from '../services/geminiService';
import { ScanResult } from '../../types';

interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

interface AIConsultantChatProps {
  scanResult: ScanResult;
}

const AIConsultantChat: React.FC<AIConsultantChatProps> = ({ scanResult }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: `Hello! I've analyzed **${scanResult.url}**. Based on the results, your security score is **${scanResult.score}/100**. How can I help you strengthen your agricultural digital assets today?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [m.text]
      }));

      const response = await getChatResponse(input, scanResult, history);
      
      const modelMessage: Message = {
        role: 'model',
        text: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'model',
        text: "I'm sorry, I encountered a communication error with the core AI engine. Please check your connectivity or try again in a moment.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "How do I fix the SSL issues?",
    "Explain the open ports risk.",
    "Is this safe for farm data?",
    "What are critical vulnerabilities?"
  ];

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-2xl shadow-blue-500/40 border border-blue-400/30 ${isOpen ? 'hidden' : ''}`}
      >
        <Bot size={32} />
        <motion.div
           animate={{ scale: [1, 1.2, 1] }}
           transition={{ repeat: Infinity, duration: 2 }}
           className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-400 border-2 border-white"
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-8 right-8 z-50 flex flex-col w-[400px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-6rem)] rounded-3xl bg-slate-900 shadow-2xl border border-white/10 overflow-hidden backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600/20 to-cyan-500/20 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white">
                  <Tractor size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">AI Security Consultant</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Agri-Shield Active</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center ${m.role === 'user' ? 'bg-slate-700 text-slate-300' : 'bg-blue-900/50 text-blue-400 border border-blue-500/30'}`}>
                      {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                      m.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-slate-800 text-slate-200 border border-white/5 rounded-tl-none'
                    }`}>
                      {m.text.split('**').map((part, index) => 
                        index % 2 === 1 ? <span key={index} className="font-bold text-blue-300">{part}</span> : part
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="h-8 w-8 rounded-lg bg-blue-900/50 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                      <Loader2 size={16} className="animate-spin" />
                    </div>
                    <div className="bg-slate-800 rounded-2xl rounded-tl-none p-3 border border-white/5 flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length < 3 && !isLoading && (
              <div className="px-4 py-2 flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(s); handleSend(); }}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full border border-white/5 transition-colors flex items-center gap-1"
                  >
                    <Sparkles size={10} className="text-blue-400" /> {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-slate-900/50">
              <div className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about your security profile..."
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 pr-12 transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-slate-700 text-white rounded-lg transition-all flex items-center justify-center"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-[10px] text-slate-500 text-center mt-3 flex items-center justify-center gap-1">
                <ShieldCheck size={10} /> Powered by Gemini 1.5 Flash for Agri-Security
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIConsultantChat;
