"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLinoStore } from "@/store/useLinoStore";
import { sendLinoMessage } from "@/lib/lino";
import ReactMarkdown from "react-markdown";
import { LinoProductCarousel } from "@/components/lino/LinoProductCarousel";
import { Send } from "lucide-react";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q");
  const { messages, isLoading, addMessage, setLoading, sessionId } = useLinoStore();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Track if we have already initialized the chat from the URL query
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialQuery && !initialized && messages.length === 0) {
      setInitialized(true);
      handleSend(initialQuery);
    }
  }, [initialQuery, initialized, messages.length]);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    const query = text.trim();
    setInput("");
    
    addMessage({ role: 'user', content: query });
    setLoading(true);
    
    try {
      const response = await sendLinoMessage(sessionId, query);
      addMessage({ 
        role: 'assistant', 
        content: response.reply,
        products: response.products 
      });
    } catch (error) {
      addMessage({ 
        role: 'assistant', 
        content: "Sorry, I'm having trouble connecting right now." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-4 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      
      {/* Chat Messages */}
      <div 
        ref={scrollRef}
        className="flex-grow flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar pb-2"
      >
        {messages.length === 0 && !isLoading && (
          <div className="flex-grow flex items-center justify-center text-gray-400 font-medium text-sm">
            Send a message to start shopping!
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            
            <div className={`max-w-[85%] rounded-xl p-4 ${
              msg.role === 'user' 
                ? 'bg-gray-100 border border-gray-200 text-gray-800 rounded-tr-sm shadow-sm' 
                : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
            }`}>
              <div className="prose prose-sm max-w-none text-gray-800 text-[14px] leading-relaxed font-medium">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
              
              {msg.products && msg.products.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Recommended For You</p>
                  <LinoProductCarousel products={msg.products} />
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4 justify-start">
            <div className="bg-white rounded-xl rounded-tl-sm p-4 shadow-sm flex gap-2 items-center h-[50px]">
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="relative flex-shrink-0 mt-0 mb-0 pt-2 pb-2">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell me what you have in mind..."
            className="w-full pl-6 pr-14 py-3.5 bg-white border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300 text-[15px] font-medium placeholder:text-gray-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white p-2.5 rounded-full hover:bg-black disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
