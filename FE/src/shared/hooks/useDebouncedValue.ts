"use client";

import { useEffect, useState } from "react";

/**
 * Returns `value` after it has remained unchanged for `delay` ms.
 * Useful for throttling search inputs, network calls, etc.
 */
export function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
