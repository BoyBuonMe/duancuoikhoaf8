"use client";

import { useEffect, useRef, useState } from "react";
import { useUserSupportChat } from "@/features/chat";
import type { ChatMessage } from "@/features/chat/types/chat.types";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SupportChatPanel() {
  const {
    conversation,
    messages,
    isLoading,
    isSending,
    error,
    usingPolling,
    bootstrap,
    sendMessage,
  } = useUserSupportChat();
  const [draft, setDraft] = useState("");
  const startedRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      void bootstrap();
    }
  }, [bootstrap]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    await sendMessage(text);
  };

  return (
    <div className="flex h-full flex-col">
      <p className="mb-2 text-[11px] text-zinc-500">
        {usingPolling ? "Updates every few seconds" : "Live chat with support"}
        {conversation ? ` · #${conversation.id.slice(-6).toUpperCase()}` : ""}
      </p>

      {error ? (
        <div className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto pr-1">
        {isLoading ? (
          <p className="py-8 text-center text-sm text-zinc-500">Connecting...</p>
        ) : messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500">
            Describe your issue — an admin will reply soon.
          </p>
        ) : (
          <div className="space-y-3">
            {messages.map((message: ChatMessage) => {
              const isUser = message.senderRole === "user";
              return (
                <div
                  key={message.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                      isUser
                        ? "bg-zinc-900 text-white"
                        : "bg-sky-50 text-zinc-900 ring-1 ring-sky-100"
                    }`}
                  >
                    {message.content}
                    <p
                      className={`mt-1 text-[10px] ${isUser ? "text-zinc-400" : "text-sky-700"}`}
                    >
                      {isUser ? "You" : "Support"} · {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {conversation?.status !== "closed" ? (
        <div className="mt-3 flex gap-2 border-t border-zinc-200 pt-3">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleSend();
            }}
            placeholder="Message support..."
            className="flex-1 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900"
          />
          <button
            type="button"
            disabled={isSending || !draft.trim()}
            onClick={() => void handleSend()}
            className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-bold text-white uppercase disabled:opacity-50"
          >
            Send
          </button>
        </div>
      ) : (
        <p className="mt-3 text-center text-sm text-zinc-500">
          This support ticket is closed.
        </p>
      )}
    </div>
  );
}
