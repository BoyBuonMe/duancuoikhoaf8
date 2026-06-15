import { afterEach } from "vitest";

// Per-test localStorage cleanup. Redux slice tests use createTestStore
// without redux-persist so state does not leak across files.
afterEach(() => {
  if (typeof window !== "undefined") {
    window.localStorage.clear();
    window.sessionStorage.clear();
  }
});
