"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLinoStore } from "@/store/useLinoStore";
import { sendLinoMessage, fetchLinoHistory } from "@/lib/lino";
import { useAuth } from "@/context/AuthContext";
import ReactMarkdown from "react-markdown";
import { LinoProductCarousel } from "@/components/lino/LinoProductCarousel";
import { Send } from "lucide-react";

export default function ChatPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionIdParam = params.sessionId;
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const {
    messages,
    isLoading,
    addMessage,
    setLoading,
    sessionId,
    setSessionId,
    setMessages,
    startNewChat,
  } = useLinoStore();

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  };

  // 1. Sync store sessionId with URL param, then load history
  useEffect(() => {
    if (!sessionIdParam) return;

    const init = async () => {
      setSessionId(sessionIdParam);

      // Attempt to load existing history from the backend
      const history = await fetchLinoHistory(sessionIdParam);
      if (history?.messages) {
        const mapped = history.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          products: msg.metadata?.products || [],
        }));
        setMessages(mapped);
      }
      setHistoryLoaded(true);
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionIdParam]);

  // 2. After history is loaded, fire the pending initial query (set by LandingClient)
  useEffect(() => {
    if (!historyLoaded) return;
    const key = `lino-pending-${sessionIdParam}`;
    const pendingQuery = sessionStorage.getItem(key);
    if (pendingQuery) {
      sessionStorage.removeItem(key);
      handleSend(pendingQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyLoaded]);

  // 3. Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const query = text.trim();
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    addMessage({ role: "user", content: query });
    setLoading(true);

    try {
      const response = await sendLinoMessage(
        sessionId,
        query,
        isAuthenticated && user ? user.id : undefined,
      );
      addMessage({
        role: "assistant",
        content: response.reply,
        products: response.products,
      });
    } catch {
      addMessage({
        role: "assistant",
        content: "Sorry, I'm having trouble connecting right now.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    const newId = startNewChat();
    router.push(`/chat/${newId}`);
  };

  return (
    <div className="w-full h-[calc(100vh-64px)] bg-[#f9f9f9]">
      <div className="container mx-auto max-w-4xl px-4 py-4 flex flex-col h-full overflow-hidden">

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
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "user" ? (
              <div className="max-w-[85%] md:max-w-[70%] rounded-2xl p-4 bg-[#f5f0e6] text-gray-900 rounded-tr-sm shadow-sm border border-[#e8e3d9]">
                <div className="text-[15px] leading-relaxed font-medium whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>
            ) : (
              <div className="w-full text-gray-900 bg-white rounded-2xl p-4 sm:p-6 pb-4 border border-gray-100 shadow-sm">
                <div className="prose prose-sm max-w-none text-gray-800 text-[15px] leading-relaxed font-medium prose-img:rounded-xl prose-img:shadow-sm prose-img:max-w-[320px] prose-img:h-auto prose-img:object-cover">
                  <ReactMarkdown
                    components={{
                      img: ({ node, ...props }) => (
                        <img
                          {...props}
                          className="max-w-[320px] h-auto rounded-xl shadow-sm object-cover"
                          alt={props.alt || ""}
                        />
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>

                {msg.products && msg.products.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                      Recommended For You
                    </p>
                    <LinoProductCarousel products={msg.products} />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex w-full justify-start pb-2">
            <div className="flex gap-2 items-center h-[30px]">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="relative flex-shrink-0 mt-0 mb-0 pt-2 pb-2">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
          className="relative flex items-end"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => { setInput(e.target.value); adjustHeight(); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(input);
              }
            }}
            placeholder="Tell me what you have in mind..."
            className="w-full pl-3 pr-14 py-3.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300 text-[15px] font-medium placeholder:text-gray-400 resize-none overflow-y-auto max-h-[180px] leading-relaxed"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 bottom-2 bg-gray-900 text-white p-2.5 rounded-full hover:bg-black disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
    </div>
  );
}
