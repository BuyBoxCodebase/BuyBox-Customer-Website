"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, User as UserIcon, MessageSquare } from "lucide-react";
import { CartIcon } from "../navbar/components/CartIcon";
import { UserDropdown } from "../navbar/components/UserDropdown";
import { useAuth } from "@/context/AuthContext";
import { Button } from "../ui/button";
import { useLinoStore } from "@/store/useLinoStore";
import { sendLinoMessage } from "@/lib/lino";
import ChatSidePanel from "@/components/lino/ChatSidePanel";
import { LinoChatMessages } from "@/components/lino/LinoChatMessages";

export default function LandingClient({ subcategories }: { subcategories: any[] }) {
  const [query, setQuery] = useState("");
  const { user, isAuthenticated, logout } = useAuth();
  const { messages, isLoading, sessionId, addMessage, setLoading } = useLinoStore();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isChatting = messages.length > 0 || isLoading;

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = query.trim();
    if (!text || isLoading) return;

    setQuery("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    addMessage({ role: "user", content: text });
    setLoading(true);

    try {
      const response = await sendLinoMessage(sessionId, text);
      addMessage({ role: "assistant", content: response.reply, products: response.products });
    } catch {
      addMessage({ role: "assistant", content: "Sorry, I'm having trouble connecting right now." });
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Map backend subcategories to display items with images
  const displayCategories = subcategories.slice(0, 4).map(sub => ({
    name: sub.name,
    path: `/subcategory/${sub.categoryId}%2F${sub.name}`,
    image: sub.imageUrl
  }));

  // Shared by the top bar and prompt box so they line up with the category grid
  const heroWidth = `w-full mx-auto transition-[max-width] duration-500 ease-in-out ${
    isChatting ? "max-w-3xl" : "max-w-[min(459px,calc(100dvh_-_320px))] md:max-w-3xl"
  }`;

  const searchForm = (
    <form
      onSubmit={handleSend}
      className={`relative ${heroWidth}`}
    >
      <textarea
        name="query"
        ref={textareaRef}
        rows={1}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          adjustHeight();
        }}
        onKeyDown={handleKeyDown}
        placeholder={isChatting ? "Tell me what you have in mind..." : "What shoes are you looking for?"}
        className="w-full pl-2 md:pl-4 pr-14 md:pr-16 py-3.5 md:py-4 rounded-xl border border-gray-300 sys-dark:border-[#333] bg-white sys-dark:bg-[#0a0a0a] text-base md:text-lg focus:outline-none focus:border-gray-500 sys-dark:focus:border-gray-500 placeholder:text-gray-500 sys-dark:placeholder:text-gray-400 text-black sys-dark:text-white resize-none overflow-y-auto max-h-[180px] leading-normal"
      />
      <button
        aria-label="Send"
        type="submit"
        disabled={!query.trim() || isLoading}
        className="absolute right-2 md:right-2.5 bottom-3.5 bg-black sys-dark:bg-white text-white sys-dark:text-black p-2 md:p-2.5 rounded-full hover:opacity-80 disabled:opacity-40 transition-opacity"
      >
        <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>
    </form>
  );

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden flex flex-col bg-background sys-dark:bg-[#0a0a0a] transition-colors duration-300">

      {/* Chat History Side Panel */}
      <ChatSidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />

     
      <div className="absolute top-4 md:top-6 inset-x-0 px-4 z-30">
        <div className={`flex items-center justify-between ${heroWidth}`}>
          <button
            onClick={() => setIsPanelOpen(true)}
            className="relative p-2 hover:bg-gray-100 sys-dark:hover:bg-white/10 rounded-full hover:text-gray-800 sys-dark:hover:text-white text-black sys-dark:text-white transition-colors"
            aria-label="Open chat history"
          >
            <MessageSquare className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2 md:gap-4 text-black sys-dark:text-white">
            <CartIcon />
            <div className="hidden sm:block">
              {isAuthenticated ? (
                <UserDropdown user={user as any} onLogout={logout} />
              ) : (
                <Link href="/user/login">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <span className="text-sm font-medium">Sign in</span>
                    <UserIcon className="w-5 h-5" />
                  </Button>
                </Link>
              )}
            </div>
            <div className="sm:hidden">
              {isAuthenticated ? (
                <Link href={`/user/profile`} className="text-sm font-medium hover:text-gray-800 flex items-center justify-center p-2 text-black sys-dark:text-white">
                  <UserIcon className="w-6 h-6" />
                </Link>
              ) : (
                <Link href="/user/login" className="flex items-center justify-center p-2 text-black sys-dark:text-white">
                  <UserIcon className="w-6 h-6" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="relative z-10 flex-grow flex flex-col w-full min-h-0 pt-16 md:pt-20">
        <div ref={scrollRef} className="flex-grow basis-0 min-h-0 overflow-y-auto px-4">
          {isChatting && (
            <div className="w-full max-w-3xl mx-auto py-4 animate-in fade-in duration-500">
              <LinoChatMessages messages={messages} isLoading={isLoading} />
            </div>
          )}
        </div>

        {/* Logo */}
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${
            isChatting ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
          }`}
          aria-hidden={isChatting}
        >
          <div className="overflow-hidden">
            <h1 className="pb-6 md:pb-14 text-center text-5xl sm:text-6xl md:text-7xl font-medium text-black sys-dark:text-white tracking-tight">
              Treides
            </h1>
          </div>
        </div>

        {/* Search / chat input */}
        <div
          className={`flex-shrink-0 px-4 transition-[padding] duration-500 ease-in-out ${
            isChatting ? "pt-2 pb-4 md:pb-6" : "pt-0 pb-0"
          }`}
        >
          {searchForm}
        </div>

        {/* Categories */}
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${
            isChatting ? "grid-rows-[0fr] opacity-0 pointer-events-none" : "grid-rows-[1fr] opacity-100"
          }`}
          aria-hidden={isChatting}
        >
          <div className="overflow-hidden">
            <div className="pt-6 md:pt-14 px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full mx-auto max-w-[min(459px,calc(100dvh_-_320px))] md:max-w-3xl">
                {displayCategories.map((cat) => (
                  <Link
                    key={cat.name}
                    href={cat.path}
                    tabIndex={isChatting ? -1 : undefined}
                    className="flex flex-col gap-1.5 group min-w-0"
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-50 sys-dark:bg-white/5">
                      {cat.image ? (
                        <Image
                          src={cat.image}
                          alt={cat.name}
                          fill
                          sizes="(min-width: 768px) 192px, 50vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-400 sys-dark:text-gray-500 text-xs">No img</span>
                        </div>
                      )}
                    </div>
                    <span className="text-sm md:text-base text-center text-black sys-dark:text-white truncate">{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div
          className="basis-0 min-h-0 transition-[flex-grow] duration-500 ease-in-out"
          style={{ flexGrow: isChatting ? 0 : 1 }}
        />
      </main>
    </div>
  );
}
