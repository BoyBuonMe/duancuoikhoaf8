"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { useAuth } from "@/features/auth";
import { AiChatPanel } from "@/components/chat/AiChatPanel";
import { SupportChatPanel } from "@/components/chat/SupportChatPanel";

type ChatTab = "ai" | "support";

export function ChatWidget() {
  const { isAuthenticated, sessionChecked } = useAuth();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<ChatTab>("ai");

  if (!sessionChecked || !isAuthenticated) {
    return null;
  }

  return (
    <>
      {open ? (
        <div className="fixed right-4 bottom-20 z-50 flex h-[min(520px,70vh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl sm:right-6 sm:bottom-24">
          <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-900 px-4 py-3 text-white">
            <div>
              <p className="text-sm font-bold">Gymshark Chat</p>
              <p className="text-[11px] text-zinc-300">AI & customer support</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1 hover:bg-zinc-800"
              aria-label="Close chat"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="flex border-b border-zinc-200">
            {(
              [
                { id: "ai" as const, label: "AI Assistant" },
                { id: "support" as const, label: "Support" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`flex-1 py-2.5 text-xs font-bold tracking-wide uppercase transition-colors ${
                  tab === item.id
                    ? "border-b-2 border-zinc-900 text-zinc-900"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex min-h-0 flex-1 flex-col p-4">
            {tab === "ai" ? <AiChatPanel /> : <SupportChatPanel />}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed right-4 bottom-4 z-50 flex size-14 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg transition-transform hover:scale-105 sm:right-6 sm:bottom-6"
        aria-label={open ? "Close chat widget" : "Open chat widget"}
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>
    </>
  );
}
