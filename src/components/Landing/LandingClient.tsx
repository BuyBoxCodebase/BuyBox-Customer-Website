"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, User as UserIcon, MessageSquare } from "lucide-react";
import { CartIcon } from "../navbar/components/CartIcon";
import { UserDropdown } from "../navbar/components/UserDropdown";
import { useAuth } from "@/context/AuthContext";
import { Button } from "../ui/button";
import { useLinoStore } from "@/store/useLinoStore";
import { streamLinoMessage } from "@/lib/lino";
import { AskButton } from "@/components/lino/AskButton";
import { searchUrl } from "@/lib/search";
import ChatSidePanel from "@/components/lino/ChatSidePanel";
import { LinoChatMessages } from "@/components/lino/LinoChatMessages";
import { SubcategoryCarousel } from "./SubcategoryCarousel";
import { useTypewriter } from "@/hooks/useTypewriter";
import { SEARCH_PROMPTS } from "@/constants/searchPrompts";

export default function LandingClient({ subcategories }: { subcategories: any[] }) {
  const [query, setQuery] = useState("");
  const { user, isAuthenticated, logout } = useAuth();
  const { messages, isLoading, sessionId, addMessage, updateMessage, setLoading } = useLinoStore();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  // "Ask" tapped with an empty box: the next Enter goes to Lino instead of search.
  const [askMode, setAskMode] = useState(false);
  const router = useRouter();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isChatting = messages.length > 0 || isLoading;

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const send = async (text: string) => {
    if (!text || isLoading) return;

    addMessage({ role: "user", content: text });
    const replyId = addMessage({ role: "assistant", content: "" });
    setLoading(true);

    try {
      await streamLinoMessage(sessionId, text, {
        onStatus: (status) => updateMessage(replyId, () => ({ status })),
        onProducts: (products) => updateMessage(replyId, () => ({ products })),
        onText: (chunk) => updateMessage(replyId, (reply) => ({ content: reply.content + chunk, status: undefined })),
      });
    } catch {
      updateMessage(replyId, (reply) => ({
        content: reply.content || "Sorry, I'm having trouble connecting right now.",
      }));
    } finally {
      updateMessage(replyId, () => ({ status: undefined }));
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = query.trim();
    if (!text || isLoading) return;

    // Before a conversation starts, Enter is a normal search; "Ask Lino" on the results page
    // brings the customer back here with the chat started (see the ?ask effect below).
    if (!isChatting && !askMode) {
      router.push(searchUrl({ q: text }));
      return;
    }

    setQuery("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    send(text);
  };

  const handleAsk = () => {
    if (isLoading) return;
    const text = query.trim();
    if (!text) {
      setAskMode(true);
      textareaRef.current?.focus();
      return;
    }
    setQuery("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    send(text);
  };

   useEffect(() => {
    const ask = new URLSearchParams(window.location.search).get("ask");
    if (ask === null) return;
    window.history.replaceState(null, "", window.location.pathname);
    if (ask.trim()) send(ask.trim());
    else {
      setAskMode(true);
      textareaRef.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const displayCategories = subcategories.map(sub => ({
    name: sub.name,
    path: `/subcategory/${sub.categoryId}%2F${sub.name}`,
    image: sub.imageUrl
  }));

  // Shared by the top bar and prompt box so they line up with the category grid
  const heroWidth = `w-full mx-auto transition-[max-width] duration-500 ease-in-out ${
    isChatting ? "max-w-3xl" : "max-w-[min(459px,calc(100dvh_-_320px))] md:max-w-3xl"
  }`;

  // Before chatting the box has one button, Ask (Enter / the keyboard's Search key searches).
  // Once chatting, the box only sends, so Ask gives way to the send arrow.
  const hasText = query.trim().length > 0;
  // Example searches type themselves out in the empty search box (not in chat / Ask mode).
  const animatePlaceholder = !isChatting && !askMode && query.length === 0;
  const typedPrompt = useTypewriter(SEARCH_PROMPTS, animatePlaceholder);
  const searchForm = (
    <form
      onSubmit={handleSend}
      className={`relative ${heroWidth}`}
    >
      <div className="flex items-end gap-1.5 md:gap-2 pl-2 md:pl-4 pr-2 md:pr-2.5 py-2 md:py-2.5 rounded-xl border border-gray-300 sys-dark:border-[#333] bg-white sys-dark:bg-[#0a0a0a] focus-within:border-gray-500 sys-dark:focus-within:border-gray-500">
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
          enterKeyHint={isChatting || askMode ? "send" : "search"}
          aria-label={isChatting || askMode ? "Message Treides" : "Search for shoes"}
          placeholder={
            isChatting || askMode
              ? "Tell me what you have in mind..."
              : animatePlaceholder
                ? typedPrompt
                : "What shoes are you looking for?"
          }
          className="flex-1 min-w-0 py-1.5 md:py-2 bg-transparent text-base md:text-lg focus:outline-none placeholder:text-gray-500 sys-dark:placeholder:text-gray-400 text-black sys-dark:text-white resize-none overflow-y-auto max-h-[180px] leading-normal"
        />
        {isChatting ? (
          <button
            aria-label="Send"
            type="submit"
            disabled={!hasText || isLoading}
            className="shrink-0 bg-black sys-dark:bg-white text-white sys-dark:text-black p-2 md:p-2.5 rounded-full hover:opacity-80 disabled:opacity-40 transition-opacity"
          >
            <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        ) : (
          <AskButton
            onClick={handleAsk}
            disabled={isLoading}
            // Faded until there's something to ask (or Ask has been picked), but still tappable.
            className={`shrink-0 h-9 md:h-11 md:px-4 md:text-base sys-dark:bg-white/10 sys-dark:text-white sys-dark:hover:bg-white/20 ${
              hasText || askMode ? "" : "opacity-60"
            }`}
          />
        )}
      </div>
    </form>
  );

  return (
    <div
      data-system-theme
      className="relative w-full h-[100dvh] overflow-hidden flex flex-col bg-background sys-dark:bg-[#0a0a0a] transition-colors duration-300"
    >

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
            {/* One row drifting sideways in a loop: circles below md, square tiles from md up. */}
            <div className="pt-10 md:pt-14 px-4">
              <div className="w-full mx-auto max-w-3xl">
                <SubcategoryCarousel categories={displayCategories} hidden={isChatting} />
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
