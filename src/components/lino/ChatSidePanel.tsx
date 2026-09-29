"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Plus, Clock, ChevronRight, LogIn, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLinoStore } from "@/store/useLinoStore";
import { fetchUserChats } from "@/lib/lino";
import Link from "next/link";

interface ChatSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function ChatSidePanel({ isOpen, onClose }: ChatSidePanelProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { userChats, setUserChats, startNewChat } = useLinoStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken") || localStorage.getItem("token") || ""
        : "";

    if (!token) return;

    setLoading(true);
    fetchUserChats(token)
      .then((chats) => setUserChats(chats))
      .finally(() => setLoading(false));
  }, [isOpen, isAuthenticated, setUserChats]);

  const handleNewChat = () => {
    const newId = startNewChat();
    router.push(`/chat/${newId}`);
    onClose();
  };

  const handleOpenChat = (sessionId: string) => {
    router.push(`/chat/${sessionId}`);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 sys-dark:bg-black/40 z-40"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-72
          bg-white sys-dark:bg-[#0a0a0a]
          border-r border-black/10 sys-dark:border-white/10
          shadow-xl sys-dark:shadow-black/40
          z-50 flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-black/10 sys-dark:border-white/10">
          <div className="flex items-center gap-2 text-black sys-dark:text-white">
            <MessageSquare className="w-5 h-5" />
            <span className="font-semibold text-sm">Your Chats</span>
          </div>
          {/* Close — matches cart/profile icon pattern */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 sys-dark:hover:bg-white/10 rounded-full text-black sys-dark:text-white transition-colors"
            aria-label="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="px-3 pt-3 pb-2">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl
              bg-black sys-dark:bg-white
              text-white sys-dark:text-black
              text-sm font-medium
              hover:opacity-80 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-grow overflow-y-auto px-3 py-2 space-y-0.5">
          {!isAuthenticated ? (
            // Guest state
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4 py-8">
              <div className="w-12 h-12 rounded-full bg-black/5 sys-dark:bg-white/10 flex items-center justify-center">
                <LogIn className="w-5 h-5 text-black/30 sys-dark:text-white/30" />
              </div>
              <div>
                <p className="text-sm font-medium text-black sys-dark:text-white mb-1">
                  Sign in to save history
                </p>
                <p className="text-xs text-black/40 sys-dark:text-white/40 leading-relaxed">
                  Your chats will appear here once you&apos;re signed in.
                </p>
              </div>
              <Link
                href="/user/login"
                onClick={onClose}
                className="text-xs font-semibold text-black sys-dark:text-white underline underline-offset-2 hover:opacity-60 transition-opacity"
              >
                Sign in
              </Link>
            </div>
          ) : loading ? (
            // Loading skeleton
            <div className="space-y-2 pt-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 rounded-xl bg-black/5 sys-dark:bg-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : userChats.length === 0 ? (
            // Empty state (authenticated)
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4 py-8">
              <div className="w-12 h-12 rounded-full bg-black/5 sys-dark:bg-white/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-black/20 sys-dark:text-white/20" />
              </div>
              <p className="text-sm text-black/40 sys-dark:text-white/40">
                No chats yet — start one above!
              </p>
            </div>
          ) : (
            // Chat list
            userChats.map((chat) => {
              const lastMsg = chat.messages?.[0];
              const preview = lastMsg
                ? lastMsg.content.slice(0, 52) + (lastMsg.content.length > 52 ? "…" : "")
                : "No messages yet";

              return (
                <button
                  key={chat.sessionId}
                  onClick={() => handleOpenChat(chat.sessionId)}
                  className="w-full text-left flex items-start gap-3 px-3 py-3 rounded-xl
                    hover:bg-black/5 sys-dark:hover:bg-white/5
                    transition-colors group"
                >
                  <div className="flex-grow min-w-0">
                    <p className="text-xs text-black/60 sys-dark:text-white/60 truncate mt-0.5">
                      {lastMsg ? (
                        <>
                          <span className="text-black sys-dark:text-white font-medium">You:</span>{" "}
                          {preview}
                        </>
                      ) : (
                        preview
                      )}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-black/20 sys-dark:text-white/20" />
                      <span className="text-[11px] text-black/30 sys-dark:text-white/30">
                        {formatRelativeTime(chat.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-black/20 sys-dark:text-white/20 flex-shrink-0 mt-0.5 group-hover:text-black/60 sys-dark:group-hover:text-white/60 transition-colors" />
                </button>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
}
