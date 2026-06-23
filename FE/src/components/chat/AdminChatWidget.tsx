"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, MessageCircle, Trash2, X } from "lucide-react";
import { useAuth } from "@/features/auth";
import { isDashboardUser } from "@/features/auth/model/auth-redirect";
import {
  useAdminSupportInbox,
  type ChatConversation,
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

function conversationLabel(conv: ChatConversation) {
  return (
    conv.userName ||
    conv.userEmail ||
    `User ${conv.userId.slice(-6)}`
  );
}

function ConversationList({
  statusFilter,
  setStatusFilter,
  conversations,
  isLoadingList,
  onSelect,
  onHide,
  onDelete,
}: {
  statusFilter: ConversationStatus | "all";
  setStatusFilter: (value: ConversationStatus | "all") => void;
  conversations: ChatConversation[];
  isLoadingList: boolean;
  onSelect: (id: string) => void;
  onHide: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex h-full flex-col">
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
          <p className="p-4 text-sm text-zinc-500">
            No conversations need support.
          </p>
        ) : (
          <ul>
            {conversations.map((conv) => (
              <li
                key={conv.id}
                className="group flex items-center gap-1 border-b border-zinc-100 px-2 hover:bg-zinc-50"
              >
                <button
                  type="button"
                  onClick={() => onSelect(conv.id)}
                  className="flex-1 py-3 pl-2 text-left"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-zinc-800">
                      {conversationLabel(conv)}
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusBadgeClass(conv.status)}`}
                    >
                      {conv.status}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[11px] text-zinc-500">
                    {conv.userEmail ?? `#${conv.id.slice(-6).toUpperCase()}`} ·{" "}
                    {formatTime(conv.lastMessageAt)}
                  </p>
                </button>
                <div className="flex shrink-0 items-center gap-0.5 pr-1">
                  <button
                    type="button"
                    onClick={() => onDelete(conv.id)}
                    title="Delete conversation"
                    className="rounded-full p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Delete conversation"
                  >
                    <Trash2 className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onHide(conv.id)}
                    title="Hide conversation"
                    className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700"
                    aria-label="Hide conversation"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
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
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
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

function SupportView({
  conversation,
  messages,
  isLoadingMessages,
  isSending,
  onBack,
  onDelete,
  onSend,
}: {
  conversation: ChatConversation;
  messages: Array<{
    id: string;
    senderRole: string;
    content: string;
    createdAt: string;
  }>;
  isLoadingMessages: boolean;
  isSending: boolean;
  onBack: () => void;
  onDelete: () => void;
  onSend: (text: string) => Promise<void> | void;
}) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    await onSend(text);
  };

  const isClosed = conversation.status === "closed";

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-zinc-200 bg-white px-3 py-2.5">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100"
          aria-label="Back to list"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-zinc-900">
            {conversationLabel(conversation)}
          </p>
          {conversation.userEmail ? (
            <p className="truncate text-[11px] text-zinc-500">
              {conversation.userEmail}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onDelete}
          title="Delete conversation"
          className="flex items-center gap-1 rounded-full border border-red-200 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50"
        >
          <Trash2 className="size-3.5" />
          Delete
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-zinc-50 p-3">
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

      {isClosed ? (
        <div className="border-t border-zinc-200 bg-zinc-100 px-3 py-3 text-center text-sm text-zinc-600">
          This ticket is closed.
        </div>
      ) : (
        <div className="flex gap-2 border-t border-zinc-200 bg-white p-3">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleSend();
            }}
            placeholder="Reply to customer..."
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
      )}
    </div>
  );
}

function AdminChatPanel({ onClose }: { onClose: () => void }) {
  const {
    statusFilter,
    setStatusFilter,
    conversations,
    setSelectedId,
    selectedConversation,
    messages,
    isLoadingList,
    isLoadingMessages,
    isSending,
    error,
    usingPolling,
    sendReply,
    hideConversation,
    deleteConversation,
  } = useAdminSupportInbox({ initialStatus: "open", autoSelect: false });

  return (
    <div className="fixed right-4 bottom-20 z-[60] flex h-[min(560px,75vh)] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl sm:right-6 sm:bottom-24">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-900 px-4 py-3 text-white">
        <div>
          <p className="text-sm font-bold">Support Inbox</p>
          <p className="text-[11px] text-zinc-300">
            {usingPolling ? "Polling mode" : "Live (Soketi)"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 hover:bg-zinc-800"
          aria-label="Close support inbox"
        >
          <X className="size-5" />
        </button>
      </div>

      {error ? (
        <div className="border-b border-red-100 bg-red-50 px-4 py-2 text-xs text-red-700">
          {error}
        </div>
      ) : null}

      <div className="min-h-0 flex-1">
        {selectedConversation ? (
          <SupportView
            conversation={selectedConversation}
            messages={messages}
            isLoadingMessages={isLoadingMessages}
            isSending={isSending}
            onBack={() => setSelectedId(null)}
            onDelete={() => void deleteConversation(selectedConversation.id)}
            onSend={sendReply}
          />
        ) : (
          <ConversationList
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            conversations={conversations}
            isLoadingList={isLoadingList}
            onSelect={setSelectedId}
            onHide={hideConversation}
            onDelete={(id) => void deleteConversation(id)}
          />
        )}
      </div>
    </div>
  );
}

export function AdminChatWidget() {
  const { user, sessionChecked, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);

  if (!sessionChecked || !isAuthenticated || !user || !isDashboardUser(user)) {
    return null;
  }

  return (
    <>
      {open ? <AdminChatPanel onClose={() => setOpen(false)} /> : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed right-4 bottom-4 z-[60] flex size-14 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg transition-transform hover:scale-105 sm:right-6 sm:bottom-6"
        aria-label={open ? "Close support inbox" : "Open support inbox"}
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>
    </>
  );
}
