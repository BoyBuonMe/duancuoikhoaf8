"use client";

import { useEffect, useRef, useState } from "react";
import { useAiChat } from "@/features/chat";
import type { ChatMessage } from "@/features/chat/types/chat.types";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ChatMessageList({ messages }: { messages: ChatMessage[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-500">
        Ask about products, sizing, or orders.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => {
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
                  : "bg-zinc-100 text-zinc-900"
              }`}
            >
              {message.content}
              <p
                className={`mt-1 text-[10px] ${isUser ? "text-zinc-400" : "text-zinc-500"}`}
              >
                {formatTime(message.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}

export function AiChatPanel() {
  const { messages, isLoading, isSending, error, bootstrap, sendMessage } =
    useAiChat();
  const [draft, setDraft] = useState("");
  const startedRef = useRef(false);

  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      void bootstrap();
    }
  }, [bootstrap]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    await sendMessage(text);
  };

  return (
    <div className="flex h-full flex-col">
      {error ? (
        <div className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      ) : null}
      <div className="flex-1 overflow-y-auto pr-1">
        {isLoading ? (
          <p className="py-8 text-center text-sm text-zinc-500">Loading...</p>
        ) : (
          <ChatMessageList messages={messages} />
        )}
      </div>
      <div className="mt-3 flex gap-2 border-t border-zinc-200 pt-3">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleSend();
          }}
          placeholder="Ask AI assistant..."
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
    </div>
  );
}
