import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useDebouncedValue", () => {
  it("returns the initial value synchronously", () => {
    const { result } = renderHook(() => useDebouncedValue("a", 100));
    expect(result.current).toBe("a");
  });

  it("only commits the latest value after the delay window", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 200),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "b" });
    rerender({ value: "c" });
    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(199);
    });
    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("c");
  });

  it("uses the default delay when none is passed", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) => useDebouncedValue(value),
      { initialProps: { value: 1 } },
    );
    rerender({ value: 2 });
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current).toBe(2);
  });
});
