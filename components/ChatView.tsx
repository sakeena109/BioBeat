
import React, { useState, useRef, useEffect } from 'react';
import { Send, BrainCircuit, User, Sparkles, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { Message } from '../types';
import { streamHealthChat } from '../services/geminiService';

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'I am BioBeat Intelligence. I have reviewed your latest health metrics. Your vitals currently fall within established baseline parameters. How can I interpret your health data for you?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const assistantId = (Date.now() + 1).toString();
    const initialAssistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, initialAssistantMessage]);

    try {
      let currentContent = '';
      const { text, sources } = await streamHealthChat(input, messages, (chunk) => {
        currentContent += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === assistantId ? { ...msg, content: currentContent } : msg
        ));
      });

      setMessages(prev => prev.map(msg => 
        msg.id === assistantId ? { 
            ...msg, 
            content: text,
            sources: sources?.map((s: any) => ({
                title: s.web?.title || s.maps?.title || 'Medical Reference',
                uri: s.web?.uri || s.maps?.uri || '#'
            }))
        } : msg
      ));
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === assistantId ? { ...msg, content: 'Clinical engine communication failure. Check connection.' } : msg
      ));
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950/50">
      <div className="bg-rose-500/10 border-b border-rose-500/20 px-6 py-2 flex items-center gap-3">
        <AlertCircle className="w-4 h-4 text-rose-500" />
        <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Always verify AI-generated insights with a licensed medical professional.</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-10 space-y-10">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-6 ${msg.role === 'assistant' ? '' : 'flex-row-reverse'}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
              msg.role === 'assistant' ? 'bg-teal-500 text-white' : 'bg-zinc-800 text-zinc-400'
            }`}>
              {msg.role === 'assistant' ? <BrainCircuit className="w-7 h-7" /> : <User className="w-7 h-7" />}
            </div>
            <div className={`flex flex-col gap-3 max-w-[85%] ${msg.role === 'assistant' ? '' : 'items-end'}`}>
              <div className={`p-6 rounded-3xl border text-sm leading-relaxed shadow-sm ${
                msg.role === 'assistant' 
                  ? 'bg-zinc-900/80 border-zinc-800 text-zinc-100' 
                  : 'bg-teal-500 border-teal-400 text-white'
              }`}>
                {msg.content ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                    <div className="flex gap-1 items-center py-2">
                        <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" />
                    </div>
                )}
              </div>
              
              {msg.sources && msg.sources.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {msg.sources.map((source, idx) => (
                    <a 
                      key={idx}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {source.title.slice(0, 40)}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-8 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent">
        <div className="max-w-4xl mx-auto glass rounded-3xl border border-zinc-800/80 focus-within:border-teal-500/50 p-2 transition-all shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="p-3 text-zinc-500">
                <Sparkles className="w-5 h-5 text-teal-500" />
            </div>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about vitals, symptoms, or health optimizations..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-zinc-100 placeholder:text-zinc-600 text-sm py-4"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className={`p-4 rounded-2xl transition-all ${
                input.trim() && !isTyping ? 'bg-teal-500 text-white shadow-xl shadow-teal-500/20 hover:scale-105 active:scale-95' : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {isTyping ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
