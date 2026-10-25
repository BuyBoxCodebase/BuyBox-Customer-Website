"use client";

import ReactMarkdown from "react-markdown";
import { LinoProductCarousel } from "@/components/lino/LinoProductCarousel";
import type { LinoMessage } from "@/store/useLinoStore";

export function LinoChatMessages({ messages, isLoading }: { messages: LinoMessage[]; isLoading: boolean }) {
  return (
    <div className="flex flex-col gap-6">
      {messages.map((msg) => (
        <div key={msg.id} className={`flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
          {msg.role === "user" ? (
            <div className="max-w-[85%] md:max-w-[70%] rounded-2xl rounded-tr-sm px-4 py-3 bg-black text-white sys-dark:bg-white sys-dark:text-black">
              <div className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</div>
            </div>
          ) : (
            <div className="w-full min-w-0 text-black sys-dark:text-white">
              <div className="text-[15px] leading-relaxed break-words [&_p+p]:mt-2 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_ul]:my-2 [&_ol]:my-2 [&_strong]:font-semibold">
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
                <div className="mt-3 -mx-1">
                  <LinoProductCarousel products={msg.products} />
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {isLoading && (
        <div className="flex w-full justify-start">
          <div className="flex gap-2 items-center h-[30px]">
            <div className="w-2 h-2 bg-black/40 sys-dark:bg-white/40 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-black/40 sys-dark:bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
            <div className="w-2 h-2 bg-black/40 sys-dark:bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>
      )}
    </div>
  );
}
