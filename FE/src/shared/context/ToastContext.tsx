"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

export type ToastType = "success" | "error";

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  isExiting?: boolean;
}

interface ToastContextValue {
  success: (msg: string) => void;
  error: (msg: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isExiting: true } : t))
    );
    // Allow animation to complete before removing from DOM
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);

      // Auto dismiss after 3 seconds
      setTimeout(() => {
        removeToast(id);
      }, 3000);
    },
    [removeToast]
  );

  const success = useCallback((msg: string) => addToast(msg, "success"), [addToast]);
  const error = useCallback((msg: string) => addToast(msg, "error"), [addToast]);

  const value = useMemo(() => ({ success, error }), [success, error]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between w-full p-4 rounded-md border shadow-lg transition-all duration-300
              bg-store-paper/85 backdrop-blur-md text-store-ink 
              ${
                toast.type === "success"
                  ? "border-store-border border-l-4 border-l-green-500"
                  : "border-store-border border-l-4 border-l-red-500"
              }
              ${toast.isExiting ? "animate-toast-out" : "animate-toast-in"}
            `}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`size-2 rounded-full ${
                  toast.type === "success" ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <p className="text-xs font-bold uppercase tracking-wider">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-store-fg-subtle hover:text-store-ink transition-colors font-black text-sm px-1 cursor-pointer"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
