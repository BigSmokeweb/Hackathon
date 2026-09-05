'use client';

import { useState, useRef, useEffect } from 'react';
import { FloatingRobotCanvas } from './FloatingRobotCanvas';
import { Send, X, Sparkles, Bot, User, Compass, CornerDownLeft } from 'lucide-react';
import { API_BASE } from '@/lib/api-client';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedAction?: {
    label: string;
    href: string;
  };
}

export function FloatingChatSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Namaste! I am Celene, your AI Heritage Guide. Looking for a hidden culinary trail, artisan masterclass, or custom route across Ahmedabad, Mumbai, or Jaipur?',
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Handle send message
  async function handleSend(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const query = inputMessage.trim();
    if (!query || isTyping) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Call backend or perform intelligent curatorial response
    try {
      // 1. Try backend search if available
      const searchRes = await fetch(
        `${API_BASE}/experiences/search?q=${encodeURIComponent(query)}&limit=3`,
        { headers: { 'Content-Type': 'application/json' } }
      ).catch(() => null);

      let replyText = '';
      let action: { label: string; href: string } | undefined;

      if (searchRes && searchRes.ok) {
        const data = await searchRes.json();
        if (data?.data && data.data.length > 0) {
          const top = data.data[0];
          replyText = `I found an exceptional match: "${top.title}" in ${top.city} (${top.category}, ₹${top.priceMin}–₹${top.priceMax}). Authenticity rating is ${Math.round(top.authenticityRating * 100)}%.`;
          action = {
            label: `View ${top.title}`,
            href: `/experiences/${top.id}`,
          };
        }
      }

      // 2. Intelligent offline fallback reasoning if backend is unavailable
      if (!replyText) {
        const q = query.toLowerCase();
        if (q.includes('mumbai') || q.includes('colaba') || q.includes('bombay')) {
          replyText =
            'For Mumbai, I highly recommend our dawn Sassoon Dock fisherfolk auction tour and the Irani Cafe Art Deco circuit around Churchgate.';
          action = { label: 'Explore Mumbai Circuit', href: '/cities/mumbai' };
        } else if (q.includes('ahmedabad') || q.includes('pol') || q.includes('gujarat')) {
          replyText =
            'For Ahmedabad, don’t miss the midnight Manek Chowk spice trail and the 7th-generation Mata ni Pachedi sacred textile atelier.';
          action = { label: 'Explore Ahmedabad Circuit', href: '/cities/ahmedabad' };
        } else if (q.includes('jaipur') || q.includes('rajasthan') || q.includes('block')) {
          replyText =
            'For Jaipur, explore the Bagru natural indigo block-printing masters and the geometric Panna Meena Kund stepwell at Amer.';
          action = { label: 'Explore Jaipur Circuit', href: '/cities/jaipur' };
        } else if (q.includes('itinerary') || q.includes('trip') || q.includes('plan')) {
          replyText =
            'You can build a dynamic time-budget continuous route right now using our Itinerary Generator.';
          action = { label: 'Generate Itinerary', href: '/#itinerary' };
        } else {
          replyText =
            'I have curated access to master artisan workshops, private heritage sanctuaries, and culinary walks across India. Tell me your preferred city, budget, or travel style!';
          action = { label: 'Browse All Expeditions', href: '/explore' };
        }
      }

      // Simulated natural typing delay
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: 'asst-' + Date.now(),
            sender: 'assistant',
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestedAction: action,
          },
        ]);
        setIsTyping(false);
      }, 700);
    } catch {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: 'asst-' + Date.now(),
            sender: 'assistant',
            text: 'I can help you discover authentic master artisans and food walks. Would you like to check Mumbai, Ahmedabad, or Jaipur?',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setIsTyping(false);
      }, 600);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* ─── Chat Window Modal ─── */}
      {isOpen && (
        <div className="pointer-events-auto mb-3 w-[92vw] sm:w-[380px] h-[480px] bg-white border border-[#D8D4C8] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-[#347F8C] text-[#F7F4EA] px-5 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-lg">
                🤖
              </div>
              <div>
                <h4 className="font-manifold text-xs uppercase tracking-wider font-bold">
                  Celene Heritage Concierge
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8FAF82] animate-pulse" />
                  <span>AI Agent &bull; Online</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
              title="Close chat"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F7F4EA]/40 no-scrollbar">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-[#347F8C] text-white flex-shrink-0 flex items-center justify-center text-[10px] mt-1 font-bold">
                    C
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs ${
                    m.sender === 'user'
                      ? 'bg-[#347F8C] text-[#F7F4EA] rounded-br-xs'
                      : 'bg-white border border-[#D8D4C8] text-[#3E4541] rounded-bl-xs shadow-xs'
                  }`}
                >
                  <p className="leading-relaxed font-light">{m.text}</p>
                  {m.suggestedAction && (
                    <a
                      href={m.suggestedAction.href}
                      className="mt-2.5 inline-flex items-center gap-1.5 bg-[#F7F4EA] hover:bg-[#F7F4EA]/80 border border-[#D8D4C8] text-[#347F8C] font-mono font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-xl transition"
                    >
                      <Compass className="w-3 h-3 text-[#347F8C]" />
                      <span>{m.suggestedAction.label}</span>
                    </a>
                  )}
                  <span className="block text-[9px] font-mono text-[#3E4541]/50 mt-1 text-right">
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 items-center text-xs text-[#3E4541]/60 font-mono italic pl-8">
                <span className="w-1.5 h-1.5 rounded-full bg-[#347F8C] animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#347F8C] animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#347F8C] animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 text-[10px]">Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input form */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white border-t border-[#D8D4C8] flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about stops, artisans, or routes..."
              className="flex-1 bg-[#F7F4EA] border border-[#D8D4C8] rounded-xl px-3.5 py-2 text-xs text-[#3E4541] placeholder-[#3E4541]/50 focus:outline-none focus:border-[#347F8C]"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="bg-[#347F8C] hover:bg-[#2A6772] disabled:opacity-40 text-[#F7F4EA] p-2 rounded-xl transition shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* ─── Floating 3D Robot Mascot ─── */}
      <div className="pointer-events-auto">
        <FloatingRobotCanvas isOpen={isOpen} onClick={() => setIsOpen((prev) => !prev)} />
      </div>
    </div>
  );
}
