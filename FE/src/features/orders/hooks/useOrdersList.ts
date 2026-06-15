"use client";

import { useAuth } from "@/features/auth";
import { useListOrdersQuery } from "@/features/orders/api/orders.query.api";

export function useOrdersList(options?: { skip?: boolean }) {
  const { isAuthenticated, sessionChecked } = useAuth();
  const skip =
    options?.skip === true || !sessionChecked || !isAuthenticated;

  const query = useListOrdersQuery(undefined, {
    skip,
    refetchOnMountOrArgChange: true,
  });

  return {
    orders: skip ? [] : (query.data ?? []),
    isLoading:
      !sessionChecked || (isAuthenticated && (query.isLoading || query.isFetching)),
    error:
      isAuthenticated && query.isError ? "Could not load orders." : null,
    refetch: query.refetch,
  };
}
