"use client";

import { useEffect, useRef, useState } from "react";
import { AdminGuard, AdminShell } from "@/components/admin/AdminGuard";
import {
  useAdminSupportInbox,
  type ConversationStatus,
} from "@/features/chat";

const STATUS_TABS: Array<{ value: ConversationStatus | "all"; label: string }> =
  [
    { value: "open", label: "Open" },
    { value: "assigned", label: "Assigned" },
    { value: "closed", label: "Closed" },
    { value: "all", label: "All" },
  ];

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusBadgeClass(status: ConversationStatus) {
  if (status === "open") return "bg-amber-100 text-amber-800";
  if (status === "assigned") return "bg-sky-100 text-sky-800";
  return "bg-zinc-200 text-zinc-700";
}

function MessageBubble({
  message,
}: {
  message: { senderRole: string; content: string; createdAt: string };
}) {
  const isAdmin = message.senderRole === "admin";
  return (
    <div className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
          isAdmin
            ? "bg-zinc-900 text-white"
            : "bg-white text-zinc-900 ring-1 ring-zinc-200"
        }`}
      >
        <p>{message.content}</p>
        <p
          className={`mt-1 text-[10px] ${isAdmin ? "text-zinc-400" : "text-zinc-500"}`}
        >
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}

export function AdminSupportInbox() {
  const {
    statusFilter,
    setStatusFilter,
    conversations,
    selectedId,
    setSelectedId,
    selectedConversation,
    messages,
    isLoadingList,
    isLoadingMessages,
    isSending,
    error,
    usingPolling,
    sendReply,
    closeConversation,
  } = useAdminSupportInbox("open");

  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  useEffect(() => {
    const lastId = messages.at(-1)?.id ?? null;
    if (lastId && lastId !== lastMessageIdRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    lastMessageIdRef.current = lastId;
  }, [messages]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    await sendReply(text);
  };

  return (
    <AdminShell title="Support Inbox">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
        <span
          className={`rounded-full px-2 py-0.5 ${usingPolling ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}
        >
          {usingPolling ? "Polling mode" : "Live (Soketi)"}
        </span>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex min-h-[560px] overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
        <aside className="flex w-full max-w-xs flex-col border-r border-zinc-200 bg-white">
          <div className="flex flex-wrap gap-1 border-b border-zinc-200 p-2">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  statusFilter === tab.value
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoadingList ? (
              <p className="p-4 text-sm text-zinc-500">Loading...</p>
            ) : conversations.length === 0 ? (
              <p className="p-4 text-sm text-zinc-500">No conversations.</p>
            ) : (
              <ul>
                {conversations.map((conv) => (
                  <li key={conv.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(conv.id)}
                      className={`w-full border-b border-zinc-100 px-4 py-3 text-left transition-colors hover:bg-zinc-50 ${
                        selectedId === conv.id ? "bg-zinc-100" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-mono text-xs text-zinc-800">
                          {conv.id.slice(-8).toUpperCase()}
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusBadgeClass(conv.status)}`}
                        >
                          {conv.status}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-zinc-500">
                        User {conv.userId.slice(-6)} · {formatTime(conv.lastMessageAt)}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          {!selectedConversation ? (
            <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">
              Select a conversation
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-3">
                <div>
                  <p className="font-mono text-sm font-bold text-zinc-900">
                    Ticket {selectedConversation.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-zinc-500">
                    User ID: {selectedConversation.userId}
                  </p>
                </div>
                {selectedConversation.status !== "closed" ? (
                  <button
                    type="button"
                    onClick={() => void closeConversation()}
                    className="rounded-full border border-zinc-300 px-4 py-1.5 text-xs font-bold tracking-wide text-zinc-700 hover:bg-zinc-100"
                  >
                    Close ticket
                  </button>
                ) : null}
              </div>

              <div className="relative flex-1 overflow-y-auto p-4">
                {isLoadingMessages && messages.length === 0 ? (
                  <p className="text-sm text-zinc-500">Loading messages...</p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-zinc-500">No messages yet.</p>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {selectedConversation.status !== "closed" ? (
                <div className="border-t border-zinc-200 bg-white p-4">
                  <div className="flex gap-2">
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          void handleSend();
                        }
                      }}
                      rows={2}
                      placeholder="Reply to customer..."
                      className="min-h-[44px] flex-1 resize-none rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900"
                    />
                    <button
                      type="button"
                      disabled={isSending || !draft.trim()}
                      onClick={() => void handleSend()}
                      className="self-end rounded-full bg-zinc-900 px-5 py-2.5 text-xs font-bold tracking-widest text-white uppercase disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-zinc-200 bg-zinc-100 px-4 py-3 text-center text-sm text-zinc-600">
                  This ticket is closed.
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </AdminShell>
  );
}

export function AdminSupportInboxPage() {
  return (
    <AdminGuard>
      <AdminSupportInbox />
    </AdminGuard>
  );
}
