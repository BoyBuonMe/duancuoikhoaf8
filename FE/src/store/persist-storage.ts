import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import type { Storage } from "redux-persist";

function createNoopStorage(): Storage {
  return {
    getItem(key) {
      void key;
      return Promise.resolve(null);
    },
    setItem(key, value) {
      void key;
      return Promise.resolve(value);
    },
    removeItem(key) {
      void key;
      return Promise.resolve();
    },
  };
}

function createBrowserStorage(type: "local" | "session"): Storage {
  if (typeof window === "undefined") {
    return createNoopStorage();
  }
  return createWebStorage(type);
}

export const localPersistStorage = createBrowserStorage("local");
export const sessionPersistStorage = createBrowserStorage("session");
